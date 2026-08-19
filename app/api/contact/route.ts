import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().min(1, "Valid phone number is required").max(30, "Phone number too long"),
  email: z.string().max(150, "Email too long").optional().nullable().or(z.literal("")),
  courseInterest: z.string().max(200, "Course interest too long").optional().nullable().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(2000, "Message max 2000 characters"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: Max 5 contact inquiries per 15 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `contact:${clientIp}`,
      RATE_LIMITS.CONTACT_INQUIRY.maxAttempts,
      RATE_LIMITS.CONTACT_INQUIRY.windowMs
    );

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Too many contact inquiries submitted. Please wait 15 minutes.");
    }

    // 2. Zod Schema Validation
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // 3. Input Sanitization
    const name = sanitizeString(validatedData.name, 100);
    const phone = sanitizeString(validatedData.phone, 30);
    const rawEmail = validatedData.email ? validatedData.email.trim() : "";
    const email = rawEmail && rawEmail.includes("@") ? sanitizeEmail(rawEmail) : null;
    const courseInterest = validatedData.courseInterest ? sanitizeString(validatedData.courseInterest, 200) : null;
    const message = sanitizeString(validatedData.message, 2000);

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        phone,
        email,
        courseInterest,
        message,
      },
    });

    return NextResponse.json(
      { success: true, inquiryId: inquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.warn("[API Contact Validation Error]", error.errors);
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    console.error("[API Contact Error]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
