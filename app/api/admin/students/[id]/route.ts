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

    // Pre-check duplicate email
    if (updateData.email) {
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          id: { not: id },
        },
        select: { id: true, name: true, studentId: true },
      });
      if (existingEmailUser) {
        return NextResponse.json({
          success: false,
          message: `The email "${updateData.email}" is already used by another student: "${existingEmailUser.name}" (${existingEmailUser.studentId || "No Reg ID"}). Each student must have a unique email.`,
        }, { status: 409 });
      }
    }

    // Pre-check duplicate studentId
    if (updateData.studentId) {
      const existingIdUser = await prisma.user.findFirst({
        where: {
          studentId: updateData.studentId,
          id: { not: id },
        },
        select: { id: true, name: true, email: true },
      });
      if (existingIdUser) {
        return NextResponse.json({
          success: false,
          message: `The Reg ID "${updateData.studentId}" is already assigned to "${existingIdUser.name}" (${existingIdUser.email}). Reg IDs must be unique.`,
        }, { status: 409 });
      }
    }

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
    if (error?.code === "P2002") {
      const target = error.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(", ") : String(target || "");
      if (targetStr.includes("email")) {
        return NextResponse.json({
          success: false,
          message: "Another student account already exists with this email address.",
        }, { status: 409 });
      }
      if (targetStr.includes("studentId")) {
        return NextResponse.json({
          success: false,
          message: "Another student account already exists with this Reg ID.",
        }, { status: 409 });
      }
      return NextResponse.json({
        success: false,
        message: "Unique constraint failed: A student with this detail already exists in the system.",
      }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: error.message || "Failed to update student" }, { status: 500 });
  }
}
