// lib/auth.ts - NextAuth configuration with Device Binding + 2FA support

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { decode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitization";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing.");
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verifiedToken: { label: "Verified Token", type: "text" },   // OTP bypass
      },

      async authorize(credentials) {
        const secret = process.env.NEXTAUTH_SECRET!;

        // ── Path A: OTP-verified token bypass ─────────────────────────
        // After verifying OTP, the client sends a signed short-lived token
        // instead of email + password. We decode & trust it.
        if (credentials?.verifiedToken) {
          try {
            const payload = await decode({
              token: credentials.verifiedToken,
              secret,
            });

            if (!payload || !payload.otpVerified) {
              throw new Error("Invalid or expired verification token.");
            }

            // Confirm user still exists and is active
            const user = await prisma.user.findUnique({
              where: { id: payload.id as string },
            });

            if (!user || user.status === "FROZEN") {
              throw new Error("Account not found or frozen.");
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              studentId: user.studentId,
            };
          } catch {
            throw new Error("Verification failed. Please log in again.");
          }
        }

        // ── Path B: Direct admin login (no 2FA) ───────────────────────
        // Admin accounts bypass device binding and OTP entirely.
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;

        if (!rawEmail || !rawPassword) {
          throw new Error("Missing email or password.");
        }

        const email = sanitizeEmail(rawEmail);
        const password = sanitizeString(rawPassword, 100);

        const rateLimitKey = `auth:login:${email}`;
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH_ACCOUNT.maxAttempts, RATE_LIMITS.AUTH_ACCOUNT.windowMs);
        if (!rateLimit.success) {
          throw new Error("Too many failed login attempts. Account temporarily locked. Try again in 15 minutes.");
        }

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

        if (!user) throw new Error("Invalid email or password.");
        if (user.status === "FROZEN") {
          throw new Error("Your account has been frozen by administration. Contact IMHS desk.");
        }
        if (user.role !== "ADMIN") {
          // Students must use the two-step pre-login flow
          throw new Error("Please use the student portal login form.");
        }

        const cleanHash = user.passwordHash.replace(/^\$wp\$/, "");
        const isValid = await bcrypt.compare(password, cleanHash);
        if (!isValid) throw new Error("Invalid email or password.");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          studentId: user.studentId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.studentId = (user as any).studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string;
        (session.user as any).studentId = token.studentId as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
