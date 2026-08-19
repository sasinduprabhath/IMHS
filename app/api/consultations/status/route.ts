import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { decryptField } from "@/lib/encryption";
import { sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const codeSchema = z.string().min(5, "Invalid booking code").max(30, "Booking code too long").regex(/^[A-Za-z0-9_\-]+$/, "Invalid booking code characters");

export async function GET(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `consultation_status:${clientIp}`,
      RATE_LIMITS.CONSULTATION_LOOKUP.maxAttempts,
      RATE_LIMITS.CONSULTATION_LOOKUP.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Too many lookup attempts. Please wait 10 minutes.");
    }

    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");

    if (!rawCode) {
      return NextResponse.json({ error: "Booking reference code is required." }, { status: 400 });
    }

    const parsedCode = codeSchema.safeParse(rawCode.trim());
    if (!parsedCode.success) {
      return NextResponse.json({ error: "Invalid booking reference code format." }, { status: 400 });
    }

    const cleanCode = sanitizeIdentifier(parsedCode.data, 30).toUpperCase();

    const booking = await (prisma as any).consultationBooking.findUnique({
      where: { bookingCode: cleanCode },
      select: {
        bookingCode: true,
        studentName: true,
        sessionType: true,
        durationMins: true,
        bookingDate: true,
        timeSlot: true,
        status: true,
        meetingLink: true,
        createdAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "No booking found matching this code." }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        ...booking,
        meetingLink: decryptField(booking.meetingLink),
      },
    });
  } catch (error: any) {
    console.error("Error fetching booking status:", error);
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}
