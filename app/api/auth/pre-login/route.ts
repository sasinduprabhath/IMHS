// app/api/auth/pre-login/route.ts
// Step 1 of the two-factor login flow:
//   Validates password + device binding → generates OTP → sends email

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitization";
import { generateOtp, hashOtp, otpExpiry, buildOtpEmail, maskEmail } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";

const WA_SUPPORT_LINK = `https://wa.me/94776828490?text=${encodeURIComponent(
  "Hello IMHS Support, I need help with my account login — my device has been blocked."
)}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email as string;
    const rawPassword = body.password as string;
    const deviceSignature = (body.deviceSignature as string) || "";

    if (!rawEmail || !rawPassword) {
      return NextResponse.json({ status: "ERROR", message: "Missing credentials." }, { status: 400 });
    }

    const email = sanitizeEmail(rawEmail);
    const password = sanitizeString(rawPassword, 100);

    // ── Rate limiting ──────────────────────────────────────────────────
    const forwardedFor = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const clientIp = forwardedFor.split(",")[0].trim();
    const rateLimitKey = `auth:pre-login:${clientIp}:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json({
        status: "ERROR",
        message: "Too many login attempts. Please wait 15 minutes and try again.",
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
      return NextResponse.json({ status: "ERROR", message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "FROZEN") {
      return NextResponse.json({
        status: "ERROR",
        message: "Your account has been frozen by administration. Contact IMHS Support.",
      }, { status: 403 });
    }

    // ── Password validation ────────────────────────────────────────────
    const cleanHash = user.passwordHash.replace(/^\$wp\$/, "");
    const isValidPassword = await bcrypt.compare(password, cleanHash);
    if (!isValidPassword) {
      return NextResponse.json({ status: "ERROR", message: "Invalid email or password." }, { status: 401 });
    }

    // ── Admin bypass: skip 2FA entirely for admin accounts ─────────────
    if (user.role === "ADMIN") {
      return NextResponse.json({ status: "ADMIN_BYPASS" });
    }

    // ── Device Binding Check ───────────────────────────────────────────
    if (user.deviceSignature) {
      // Device is registered — verify signature matches
      if (deviceSignature !== user.deviceSignature) {
        return NextResponse.json({
          status: "DEVICE_LOCKED",
          message:
            "Access Denied: Your account is locked to your primary device. " +
            "If you have a new device, please contact IMHS Support on WhatsApp to request a device reset.",
          waLink: WA_SUPPORT_LINK,
        }, { status: 403 });
      }
    } else {
      // No device registered yet — register this device now
      await prisma.user.update({
        where: { id: user.id },
        data: {
          deviceSignature,
          deviceLockedAt: new Date(),
        },
      });
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

    const emailContent = buildOtpEmail({
      name: user.name.split(" ")[0],
      otp,
      waLink: WA_SUPPORT_LINK,
    });

    try {
      await sendMail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (mailErr) {
      console.error("[pre-login] Failed to send OTP email:", mailErr);
      // Clear the OTP so the user can try again
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
