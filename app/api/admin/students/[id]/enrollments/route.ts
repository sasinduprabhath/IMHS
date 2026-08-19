import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

export const dynamic = "force-dynamic";

const postEnrollmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required").max(100),
});

const patchEnrollmentSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment ID is required").max(100),
  status: z.enum(["ACTIVE", "FROZEN"]).optional(),
  blockedChapterIds: z.union([z.array(z.string().max(100)), z.string().max(5000)]).optional(),
  blockedLessonIds: z.union([z.array(z.string().max(100)), z.string().max(5000)]).optional(),
});

// POST assign new course enrollment
export async function POST(
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
    const parsed = postEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Course ID required" }, { status: 400 });
    }

    const courseId = sanitizeIdentifier(parsed.data.courseId, 100);

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: id,
          courseId,
        },
      },
      update: {
        status: "ACTIVE", // Reset to ACTIVE if re-enrolled
      },
      create: {
        userId: id,
        courseId,
        status: "ACTIVE",
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH update enrollment status (ACTIVE / FROZEN) or granular blocked chapters/lessons
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
    const parsed = patchEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message || "Invalid enrollment update." }, { status: 400 });
    }

    const { enrollmentId: rawEnrollmentId, status, blockedChapterIds, blockedLessonIds } = parsed.data;
    const enrollmentId = sanitizeIdentifier(rawEnrollmentId, 100);

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (blockedChapterIds !== undefined) {
      updateData.blockedChapterIds = Array.isArray(blockedChapterIds)
        ? JSON.stringify(blockedChapterIds)
        : blockedChapterIds;
    }
    if (blockedLessonIds !== undefined) {
      updateData.blockedLessonIds = Array.isArray(blockedLessonIds)
        ? JSON.stringify(blockedLessonIds)
        : blockedLessonIds;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: { course: true },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
