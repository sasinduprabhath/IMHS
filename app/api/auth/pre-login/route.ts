// app/api/auth/pre-login/route.ts
// Step 1 of the two-factor login flow:
//   Validates password + device binding → logs device attempts → generates OTP → sends email

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitization";
import { generateOtp, hashOtp, otpExpiry, buildOtpEmail, maskEmail } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { verifyTrustedDeviceToken, TRUSTED_DEVICE_COOKIE_NAME } from "@/lib/trustedDevice";
import { logger } from "@/lib/logger";
import { z } from "zod";

const preLoginSchema = z.object({
  email: z.string().min(1, "Email or Student ID is required").max(150, "Identifier too long"),
  password: z.string().min(1, "Password is required").max(100, "Password max 100 characters"),
  deviceSignature: z.string().max(100).optional().default(""),
  deviceInfo: z.string().max(200).optional().default("Unknown Device"),
});

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  try {
    const body = await req.json();
    const parsed = preLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        status: "ERROR",
        message: parsed.error.issues[0]?.message || "Invalid input parameters.",
      }, { status: 400 });
    }

    const { email: rawEmail, password: rawPassword, deviceSignature, deviceInfo } = parsed.data;

    const email = sanitizeEmail(rawEmail);
    const password = sanitizeString(rawPassword, 100);

    // ── Rate limiting (Strict IP + Account Protection) ─────────────────
    // 1. IP-wide brute force prevention
    const ipLimit = checkRateLimit(`auth:pre-login:ip:${clientIp}`, RATE_LIMITS.AUTH_IP.maxAttempts, RATE_LIMITS.AUTH_IP.windowMs);
    if (!ipLimit.success) {
      logger.security("RATE_LIMIT_EXCEEDED", `IP rate limit exceeded on pre-login`, { ip: clientIp, path: "/api/auth/pre-login" });
      return NextResponse.json({
        status: "ERROR",
        message: "Too many login attempts from your network. Please wait 15 minutes and try again.",
      }, { status: 429 });
    }

    // 2. Targeted account credential protection
    const accountLimit = checkRateLimit(`auth:pre-login:acc:${email}`, RATE_LIMITS.AUTH_ACCOUNT.maxAttempts, RATE_LIMITS.AUTH_ACCOUNT.windowMs);
    if (!accountLimit.success) {
      logger.security("RATE_LIMIT_EXCEEDED", `Account rate limit exceeded for ${email}`, { ip: clientIp, path: "/api/auth/pre-login" });
      return NextResponse.json({
        status: "ERROR",
        message: "Too many login attempts for this account. Please wait 15 minutes and try again.",
      }, { status: 429 });
    }

    // ── Look up user ───────────────────────────────────────────────────
    let searchEmail = email;
    if (searchEmail === "admin") searchEmail = "admin@imhs.edu.lk";

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: searchEmail },
          { studentId: searchEmail.toUpperCase() },
        ],
      },
    });

    if (!user) {
      logger.security("AUTH_LOGIN_FAILED", `Login attempt for non-existent account: ${email}`, { ip: clientIp, path: "/api/auth/pre-login" });
      return NextResponse.json({ status: "ERROR", message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "FROZEN") {
      logger.security("AUTH_ACCOUNT_LOCKED", `Attempted login on frozen account: ${user.email}`, { userId: user.id, ip: clientIp });
      return NextResponse.json({
        status: "ERROR",
        message: "Your account has been frozen by administration. Contact IMHS Support.",
      }, { status: 403 });
    }

    // ── Password validation ────────────────────────────────────────────
    const cleanHash = user.passwordHash.replace(/^\$wp\$/, "");
    const isValidPassword = await bcrypt.compare(password, cleanHash);
    if (!isValidPassword) {
      logger.security("AUTH_LOGIN_FAILED", `Invalid password entered for ${user.email}`, { userId: user.id, ip: clientIp });
      return NextResponse.json({ status: "ERROR", message: "Invalid email or password." }, { status: 401 });
    }

    // ── Admin bypass: skip 2FA & device binding entirely for admin ──────
    if (user.role === "ADMIN") {
      logger.security("AUTH_LOGIN_SUCCESS", `Admin pre-login authenticated: ${user.email}`, { userId: user.id, ip: clientIp });
      return NextResponse.json({ status: "ADMIN_BYPASS" });
    }

    const trustedCookie = req.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
    if (trustedCookie) {
      const isTrusted = await verifyTrustedDeviceToken(trustedCookie, user.id, deviceSignature);
      if (isTrusted) {
        logger.security("AUTH_LOGIN_SUCCESS", `30-day trusted device recognized for ${user.email}`, { userId: user.id, ip: clientIp });
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

        return NextResponse.json({
          status: "TRUSTED_DEVICE_BYPASS",
          verifiedToken,
        });
      }
    }

    // ── Device Binding & Device List Check ─────────────────────────────
    let isDeviceAuthorized = false;

    if (user.deviceSignature) {
      if (deviceSignature === user.deviceSignature) {
        isDeviceAuthorized = true;
      } else {
        // Check if device signature is in StudentDevice table with status ALLOWED or PRIMARY
        const existingDevice = await prisma.studentDevice.findFirst({
          where: { userId: user.id, deviceSignature },
        });

        if (existingDevice && (existingDevice.status === "ALLOWED" || existingDevice.status === "PRIMARY")) {
          isDeviceAuthorized = true;
          // Update last attempt
          await prisma.studentDevice.update({
            where: { id: existingDevice.id },
            data: { lastAttemptAt: new Date(), ipAddress: clientIp },
          });
        } else {
          // Record or update this blocked attempt in StudentDevice database
          if (existingDevice) {
            await prisma.studentDevice.update({
              where: { id: existingDevice.id },
              data: { lastAttemptAt: new Date(), ipAddress: clientIp, deviceInfo },
            });
          } else if (deviceSignature) {
            await prisma.studentDevice.create({
              data: {
                userId: user.id,
                deviceSignature,
                deviceInfo,
                status: "BLOCKED",
                ipAddress: clientIp,
                lastAttemptAt: new Date(),
              },
            });
          }

          // Build a detailed pre-filled WhatsApp message with student name, ID, email, and device info
          const waMessage = 
            `Hello IMHS Support,\n\n` +
            `*Device Unlock Request*\n` +
            `• Student Name: ${user.name}\n` +
            `• Email: ${user.email}\n` +
            `• Reg ID: ${user.studentId || "N/A"}\n` +
            `• Device Details: ${deviceInfo}\n` +
            `• Problem: My account is locked to my primary device. I am attempting to log in from a new device. Please approve my device in the admin panel so I can access my courses.`;

          const waLink = `https://wa.me/94776828490?text=${encodeURIComponent(waMessage)}`;

          logger.security("AUTH_DEVICE_LOCKED", `Device mismatch for user ${user.email}`, {
            userId: user.id,
            ip: clientIp,
            details: { deviceInfo },
          });

          return NextResponse.json({
            status: "DEVICE_LOCKED",
            message:
              `Access Denied: Your account is locked to your primary device. ` +
              `Please click below to send a pre-filled message to IMHS Support on WhatsApp requesting approval for this device (${deviceInfo}).`,
            waLink,
            studentInfo: {
              name: user.name,
              email: user.email,
              regId: user.studentId,
            },
          }, { status: 403 });
        }
      }
    } else {
      // First login: register primary device
      await prisma.user.update({
        where: { id: user.id },
        data: {
          deviceSignature,
          deviceLockedAt: new Date(),
        },
      });

      if (deviceSignature) {
        await prisma.studentDevice.create({
          data: {
            userId: user.id,
            deviceSignature,
            deviceInfo,
            status: "PRIMARY",
            ipAddress: clientIp,
            lastAttemptAt: new Date(),
          },
        });
      }
      isDeviceAuthorized = true;
    }

    // ── Generate & send OTP ────────────────────────────────────────────
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiry = otpExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: hashedOtp,
        otpExpiry: expiry,
        otpAttempts: 0,
      },
    });

    const defaultWaLink = `https://wa.me/94776828490?text=${encodeURIComponent(
      `Hello IMHS Support, I need help with my account login (${user.email}).`
    )}`;

    const emailContent = buildOtpEmail({
      name: user.name.split(" ")[0],
      otp,
      waLink: defaultWaLink,
    });

    try {
      await sendMail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      logger.security("AUTH_OTP_SENT", `2FA OTP email dispatched for user ${user.email}`, { userId: user.id, ip: clientIp });
    } catch (mailErr) {
      logger.error("Failed to send OTP email", mailErr, { userId: user.id, ip: clientIp });
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiry: null },
      });
      return NextResponse.json({
        status: "ERROR",
        message:
          "Failed to send verification email. Please check your email address or contact IMHS Support.",
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "OTP_SENT",
      maskedEmail: maskEmail(user.email),
      pendingUserId: user.id,
      expiresAt: expiry.toISOString(),
    });

  } catch (err) {
    console.error("[pre-login] Unexpected error:", err);
    return NextResponse.json({ status: "ERROR", message: "An unexpected error occurred." }, { status: 500 });
  }
}
