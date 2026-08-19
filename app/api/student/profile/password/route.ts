import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(100, "Password too long"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(100, "Password max 100 characters"),
}).strict();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 password change attempts per 15 minutes per user / IP
    const rateLimit = checkRateLimit(
      `pwd_change:${session.user.id}:${clientIp}`,
      RATE_LIMITS.PASSWORD_RESET.maxAttempts,
      RATE_LIMITS.PASSWORD_RESET.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Too many password change attempts. Please wait 15 minutes.");
    }

    const body = await req.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
