import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
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
      },
      async authorize(credentials, req) {
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;

        if (!rawEmail || !rawPassword) {
          throw new Error("Missing email or password");
        }

        const email = sanitizeEmail(rawEmail);
        const password = sanitizeString(rawPassword, 100);

        // Extract client IP address for rate limiting
        const forwardedFor = req?.headers?.["x-forwarded-for"] as string | undefined;
        const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
        const rateLimitKey = `auth:login:${clientIp}:${email}`;

        // Enforce strict rate limit: max 5 login attempts per 15 minutes
        const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
        if (!rateLimit.success) {
          throw new Error("Too many failed login attempts. Account temporarily locked. Try again in 15 minutes.");
        }

        let searchEmail = email;
        if (searchEmail === "admin") {
          searchEmail = "admin@imhs.edu.lk";
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: searchEmail },
              { studentId: searchEmail.toUpperCase() },
            ],
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status === "FROZEN") {
          throw new Error("Your account has been frozen by administration. Contact IMHS desk.");
        }

        // Clean WordPress bcrypt prefix ($wp$) if present
        const cleanHash = user.passwordHash.replace(/^\$wp\$/, "");
        const isValidPassword = await bcrypt.compare(
          password,
          cleanHash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
