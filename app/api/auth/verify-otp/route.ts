// app/api/auth/verify-otp/route.ts
// Step 2 of the two-factor login flow:
//   Validates the OTP → returns a bypass token for NextAuth session creation

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { encode } from "next-auth/jwt";

const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pendingUserId = (body.pendingUserId as string) || "";
    const otpInput = (body.otp as string) || "";

    if (!pendingUserId || !otpInput || otpInput.length !== 6) {
      return NextResponse.json({ status: "ERROR", message: "Invalid request." }, { status: 400 });
    }

    // Per-user OTP rate limit: max 5 attempts per 10 minutes
    const rateKey = `auth:otp:${pendingUserId}`;
    const rateLimit = checkRateLimit(rateKey, MAX_OTP_ATTEMPTS, 10 * 60 * 1000);
    if (!rateLimit.success) {
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
      const remaining = MAX_OTP_ATTEMPTS - attempts;
      await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: attempts },
      });

      if (remaining <= 0) {
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

    // ✓ OTP is valid — clear it from DB
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, otpAttempts: 0 },
    });

    // Build a signed JWT that the login page can use with NextAuth signIn
    // We embed the verified user data directly in the token
    const secret = process.env.NEXTAUTH_SECRET!;
    const verifiedToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        otpVerified: true,
        // Short-lived: 5 minutes
        exp: Math.floor(Date.now() / 1000) + 5 * 60,
      },
      secret,
    });

    return NextResponse.json({
      status: "SUCCESS",
      verifiedToken,
    });

  } catch (err) {
    console.error("[verify-otp] Unexpected error:", err);
    return NextResponse.json({ status: "ERROR", message: "An unexpected error occurred." }, { status: 500 });
  }
}
