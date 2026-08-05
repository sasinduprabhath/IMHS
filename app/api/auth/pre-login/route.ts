// app/api/auth/pre-login/route.ts
// Step 1 of the two-factor login flow:
//   Validates password + device binding → logs device attempts → generates OTP → sends email

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitization";
import { generateOtp, hashOtp, otpExpiry, buildOtpEmail, maskEmail } from "@/lib/otp";
import { sendMail } from "@/lib/mailer";
import { verifyTrustedDeviceToken, TRUSTED_DEVICE_COOKIE_NAME } from "@/lib/trustedDevice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email as string;
    const rawPassword = body.password as string;
    const deviceSignature = (body.deviceSignature as string) || "";
    const deviceInfo = (body.deviceInfo as string) || "Unknown Device";

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

    // ── Admin bypass: skip 2FA & device binding entirely for admin ──────
    if (user.role === "ADMIN") {
      return NextResponse.json({ status: "ADMIN_BYPASS" });
    }

    // ── 30-Day Trusted Browser Check (Skip 2FA if trusted cookie exists) ─────
    const trustedCookie = req.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
    if (trustedCookie) {
      const isTrusted = await verifyTrustedDeviceToken(trustedCookie, user.id, deviceSignature);
      if (isTrusted) {
        console.log(`[pre-login] 30-day trusted browser active for ${user.email} -> skipping 2FA OTP.`);
        const secret = process.env.NEXTAUTH_SECRET || "imhs_default_secret_32_characters_long";
        const verifiedToken = await encode({
          token: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
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
    } catch (mailErr) {
      console.error("[pre-login] Failed to send OTP email:", mailErr);
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
