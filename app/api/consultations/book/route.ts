import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { encryptField } from "@/lib/encryption";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/sanitization";
import { z } from "zod";
import crypto from "crypto";

const consultationBookingSchema = z.object({
  studentName: z.string().min(1, "Student name is required").max(100, "Name too long"),
  studentEmail: z.string().email("Valid email is required").max(150, "Email too long"),
  studentPhone: z.string().min(7, "Valid phone number is required").max(30, "Phone number too long"),
  sessionType: z.string().min(1, "Session type is required").max(100, "Session type too long"),
  durationMins: z.number().int().positive().max(480).optional().default(45),
  priceLkr: z.number().int().nonnegative().max(1000000).optional().default(0),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid booking date format" }),
  timeSlot: z.string().min(1, "Time slot is required").max(50, "Time slot too long"),
  topicNotes: z.string().max(2000, "Topic notes max 2000 characters").optional().default(""),
});

export async function POST(req: Request) {
  try {
    // 1. Rate limiting: max 5 consultation booking submissions per 15 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `consultation_book:${clientIp}`,
      RATE_LIMITS.CONSULTATION_BOOK.maxAttempts,
      RATE_LIMITS.CONSULTATION_BOOK.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Too many consultation bookings requested. Please wait 15 minutes.");
    }

    const body = await req.json();
    const parsed = consultationBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid consultation booking details." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanName = sanitizeString(data.studentName, 100);
    const cleanEmail = sanitizeEmail(data.studentEmail);
    const cleanPhone = sanitizePhone(data.studentPhone);
    const cleanTopicNotes = sanitizeString(data.topicNotes, 2000);
    const parsedDate = new Date(data.bookingDate);

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Perform atomic transaction check & booking to prevent race condition double-booking
    const booking = await prisma.$transaction(async (tx) => {
      const existingSlot = await (tx as any).consultationBooking.findFirst({
        where: {
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          timeSlot: data.timeSlot,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (existingSlot) {
        throw new Error(
          `SLOT_TAKEN: The ${data.timeSlot} slot on ${parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} is already booked. Please choose another date or time slot.`
        );
      }

      // Generate cryptographically secure booking code e.g. IMHS-BK-7A9F-2B4C
      const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();
      const bookingCode = `IMHS-BK-${randomBytes.slice(0, 4)}-${randomBytes.slice(4)}`;

      // Encrypt confidential consultation notes at rest using AES-256-GCM
      const encryptedNotes = cleanTopicNotes ? encryptField(cleanTopicNotes) : null;

      return await (tx as any).consultationBooking.create({
        data: {
          bookingCode,
          studentName: cleanName,
          studentEmail: cleanEmail,
          studentPhone: cleanPhone,
          sessionType: data.sessionType,
          durationMins: data.durationMins,
          priceLkr: data.priceLkr,
          bookingDate: parsedDate,
          timeSlot: data.timeSlot,
          topicNotes: encryptedNotes,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking submitted successfully!",
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          studentName: booking.studentName,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          sessionType: booking.sessionType,
          status: booking.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message?.startsWith("SLOT_TAKEN:")) {
      return NextResponse.json(
        { error: error.message.replace("SLOT_TAKEN: ", "") },
        { status: 400 }
      );
    }
    console.error("Error creating consultation booking:", error);
    return NextResponse.json(
      { error: "Failed to create consultation booking. Please try again." },
      { status: 500 }
    );
  }
}
