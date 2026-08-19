import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStudentSchema = z.object({
  status: z.enum(["ACTIVE", "FROZEN"]).optional(),
  name: z.string().min(1, "Name cannot be empty").max(100, "Name too long").optional(),
  email: z.string().email("Valid email required").max(150, "Email too long").optional(),
  phone: z.string().max(30, "Phone too long").optional(),
  studentId: z.string().max(50, "Student ID too long").optional(),
});

// GET student details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH toggle student status (ACTIVE / FROZEN) or update student details
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const body = await req.json();
    const parsed = updateStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Invalid update data." }, { status: 400 });
    }

    const data = parsed.data;
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status; // "ACTIVE" | "FROZEN"
    if (data.name) updateData.name = sanitizeString(data.name, 100);
    if (data.email) updateData.email = sanitizeEmail(data.email);
    if (data.phone) updateData.phone = sanitizePhone(data.phone);
    if (data.studentId !== undefined) updateData.studentId = sanitizeIdentifier(data.studentId, 50);

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
