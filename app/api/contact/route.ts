import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100, "Name too long"),
  phone: z.string().min(8, "Valid phone number is required").max(30, "Phone number too long"),
  email: z.string().email("Invalid email").max(150, "Email too long").optional().or(z.literal("")),
  courseInterest: z.string().max(200, "Course interest too long").optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000, "Message max 2000 characters"),
}).strict();

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: Max 5 contact inquiries per 15 minutes per IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = checkRateLimit(`contact:${clientIp}`, 5, 15 * 60 * 1000);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime);
    }

    // 2. Strict Zod Schema Validation & Rejection of unexpected properties
    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // 3. Input Sanitization
    const name = sanitizeString(validatedData.name, 100);
    const phone = sanitizeString(validatedData.phone, 30);
    const email = validatedData.email ? sanitizeEmail(validatedData.email) : null;
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
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
