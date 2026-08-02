import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

const createStudentSchema = z.object({
  name: z.string().min(2, "Name is required").max(100, "Name too long"),
  email: z.string().email("Valid email is required").max(150, "Email too long"),
  phone: z.string().min(8, "Phone number is required").max(30, "Phone too long"),
  tempPassword: z.string().min(6, "Temporary password must be at least 6 characters").max(100, "Password max 100 characters"),
  courseIds: z.array(z.string().max(50)).default([]),
}).strict();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
      progress: {
        select: { lessonId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, students });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = createStudentSchema.parse(body);

    const cleanEmail = sanitizeEmail(data.email);
    const cleanName = sanitizeString(data.name, 100);
    const cleanPhone = sanitizeString(data.phone, 30);
    const cleanPassword = sanitizeString(data.tempPassword, 100);

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 12);

    // Create user and enrollments in transaction
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: "STUDENT",
        enrollments: {
          create: data.courseIds.map((courseId) => ({ courseId })),
        },
      },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, student: newUser }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
