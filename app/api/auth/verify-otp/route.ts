// app/api/auth/verify-otp/route.ts
// Step 2 of the two-factor login flow:
//   Validates the OTP → returns a bypass token for NextAuth session creation

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { encode } from "next-auth/jwt";
import {
  generateDeviceUuid,
  setDeviceCookies,
  DEVICE_UUID_COOKIE_NAME,
} from "@/lib/trustedDevice";
import { logger } from "@/lib/logger";
import { z } from "zod";

const verifyOtpSchema = z.object({
  pendingUserId: z.string().min(1, "User ID is required").max(50, "User ID too long"),
  otp: z.string().regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
  trustDevice: z.boolean().optional().default(false),
  deviceSignature: z.string().max(100).optional().default(""),
  deviceUuid: z.string().max(100).optional().default(""),
  deviceInfo: z.string().max(200).optional().default(""),
});

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        status: "ERROR",
        message: parsed.error.issues[0]?.message || "Invalid verification request format.",
      }, { status: 400 });
    }

    const {
      pendingUserId,
      otp: otpInput,
      trustDevice,
      deviceSignature,
      deviceUuid: rawDeviceUuid,
      deviceInfo,
    } = parsed.data;

    // Resolve device UUID from payload, cookie, or generate new
    const cookieUuid = req.cookies.get(DEVICE_UUID_COOKIE_NAME)?.value || "";
    let finalDeviceUuid = rawDeviceUuid || cookieUuid || "";
    if (!finalDeviceUuid || !finalDeviceUuid.startsWith("dev_")) {
      finalDeviceUuid = generateDeviceUuid();
    }

    // IP-level OTP rate limiting
    const ipLimit = checkRateLimit(`auth:otp:ip:${clientIp}`, 15, RATE_LIMITS.OTP_VERIFY.windowMs);
    if (!ipLimit.success) {
      logger.security("RATE_LIMIT_EXCEEDED", `IP OTP rate limit exceeded`, { ip: clientIp, path: "/api/auth/verify-otp" });
      return NextResponse.json({
        status: "ERROR",
        message: "Too many verification attempts from your network. Please wait 10 minutes.",
      }, { status: 429 });
    }

    // Per-user OTP rate limit: max 5 attempts per 10 minutes
    const userLimit = checkRateLimit(`auth:otp:usr:${pendingUserId}`, RATE_LIMITS.OTP_VERIFY.maxAttempts, RATE_LIMITS.OTP_VERIFY.windowMs);
    if (!userLimit.success) {
      logger.security("RATE_LIMIT_EXCEEDED", `User OTP attempts rate limit exceeded`, { userId: pendingUserId, ip: clientIp, path: "/api/auth/verify-otp" });
      return NextResponse.json({
        status: "ERROR",
        message: "Too many incorrect attempts. Please log in again to receive a new code.",
      }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { id: pendingUserId } });

    if (!user || !user.otpCode || !user.otpExpiry) {
      return NextResponse.json({
        status: "ERROR",
        message: "Verification code not found or already used. Please log in again.",
      }, { status: 400 });
    }

    // Confirm device is not explicitly BLOCKED by admin
    const blockedDevice = await prisma.studentDevice.findFirst({
      where: {
        userId: user.id,
        status: "BLOCKED",
        OR: [
          { deviceSignature: finalDeviceUuid },
          ...(deviceSignature ? [{ deviceSignature }] : []),
        ],
      },
    });
    if (blockedDevice) {
      return NextResponse.json({
        status: "ERROR",
        message: "Access Denied: This device has been locked by administration.",
      }, { status: 403 });
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
      });
      return NextResponse.json({
        status: "EXPIRED",
        message: "Your verification code has expired. Please log in again to receive a new code.",
      }, { status: 400 });
    }

    // Verify OTP hash
    const isValid = await verifyOtp(otpInput, user.otpCode);

    if (!isValid) {
      const attempts = (user.otpAttempts || 0) + 1;
      const remaining = RATE_LIMITS.OTP_VERIFY.maxAttempts - attempts;
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: attempts },
      });

      logger.security("AUTH_OTP_FAILED", `Incorrect OTP attempt for user ${user.email} (${remaining} remaining)`, {
        userId: user.id,
        ip: clientIp,
      });

      if (remaining <= 0) {
        logger.security("AUTH_ACCOUNT_LOCKED", `Max OTP attempts reached for user ${user.email}, code invalidated`, {
          userId: user.id,
          ip: clientIp,
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
        });
        return NextResponse.json({
          status: "ERROR",
          message: "Too many incorrect attempts. Please log in again to receive a new code.",
        }, { status: 403 });
      }

      return NextResponse.json({
        status: "INVALID",
        message: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        attemptsRemaining: remaining,
      }, { status: 401 });
    }

    // ✓ OTP is valid - clear it from DB
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
    });

    logger.security("AUTH_OTP_VERIFIED", `2FA OTP successfully verified for user ${user.email}`, {
      userId: user.id,
      ip: clientIp,
    });

    // ── Device Registration & Approval ────────────────────────────────
    const existingDevices = await prisma.studentDevice.findMany({
      where: { userId: user.id },
    });

    const isFirstDevice = !user.deviceSignature && existingDevices.length === 0;
    const approvedStatus = isFirstDevice ? "PRIMARY" : "ALLOWED";

    // Match existing device by uuid, signature, or pending status
    const matchingRecord = existingDevices.find((d) =>
      d.deviceSignature === finalDeviceUuid ||
      (deviceSignature && d.deviceSignature === deviceSignature) ||
      d.status === "PENDING"
    );

    if (matchingRecord) {
      await prisma.studentDevice.update({
        where: { id: matchingRecord.id },
        data: {
          deviceSignature: finalDeviceUuid,
          deviceInfo: deviceInfo || matchingRecord.deviceInfo || "Web Browser",
          status: approvedStatus,
          ipAddress: clientIp,
          lastAttemptAt: new Date(),
        },
      });
    } else {
      await prisma.studentDevice.create({
        data: {
          userId: user.id,
          deviceSignature: finalDeviceUuid,
          deviceInfo: deviceInfo || "Web Browser",
          status: approvedStatus,
          ipAddress: clientIp,
          lastAttemptAt: new Date(),
        },
      });
    }

    // If first device ever, also store as user's primary deviceSignature
    if (isFirstDevice) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          deviceSignature: finalDeviceUuid,
          deviceLockedAt: new Date(),
        },
      });
    }

    // Build a signed JWT that the login page can use with NextAuth signIn
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET is not configured.");
    }
    const verifiedToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        studentId: user.studentId,
        otpVerified: true,
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
      },
      secret,
    });

    const response = NextResponse.json({
      status: "SUCCESS",
      verifiedToken,
      deviceUuid: finalDeviceUuid,
    });

    // Set persistent 1-year device UUID cookie + (optional) 30-day trusted device cookie
    await setDeviceCookies(response, user.id, finalDeviceUuid, trustDevice);

    return response;

  } catch (err) {
    console.error("[verify-otp] Unexpected error:", err);
    return NextResponse.json({ status: "ERROR", message: "An unexpected error occurred." }, { status: 500 });
  }
}
