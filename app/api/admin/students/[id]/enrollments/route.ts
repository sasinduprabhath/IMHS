import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    const { id } = await params;
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Course ID required" }, { status: 400 });
    }

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

    const { id } = await params;
    const body = await req.json();
    const { enrollmentId, status, blockedChapterIds, blockedLessonIds } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, message: "Enrollment ID is required" },
        { status: 400 }
      );
    }

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
