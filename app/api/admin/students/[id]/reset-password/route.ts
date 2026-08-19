import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const clientIp = getClientIp(req);

    // Rate limiting: Max 10 password resets per 15 min per admin/IP
    const rateLimit = checkRateLimit(
      `admin:pwd_reset:${session.user.id || clientIp}`,
      RATE_LIMITS.PASSWORD_RESET.maxAttempts,
      RATE_LIMITS.PASSWORD_RESET.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Too many password resets. Please wait 15 minutes.");
    }

    const body = await req.json();
    const tempPassword = body.tempPassword;

    if (!tempPassword || tempPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
