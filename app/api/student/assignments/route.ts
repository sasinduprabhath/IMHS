import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  try {
    // Get student's enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    const where: any = {
      courseId: { in: enrolledCourseIds },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        chapter: { select: { id: true, title: true } },
        submissions: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    });

    const formattedAssignments = assignments.map((a) => {
      const sub = a.submissions[0] || null;
      const isPastDue = new Date() > new Date(a.dueDate);

      let status = "PENDING";
      if (sub) {
        status = sub.status; // "SUBMITTED" | "LATE" | "GRADED"
      } else if (isPastDue && !a.allowLate) {
        status = "CLOSED";
      } else if (isPastDue) {
        status = "OVERDUE";
      }

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        attachmentUrl: a.attachmentUrl,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        allowLate: a.allowLate,
        allowedFileTypes: a.allowedFileTypes,
        course: a.course,
        chapter: a.chapter,
        status,
        submission: sub
          ? {
              id: sub.id,
              fileUrl: sub.fileUrl,
              fileName: sub.fileName,
              fileSize: sub.fileSize,
              submittedAt: sub.submittedAt,
              status: sub.status,
              score: sub.score,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt,
              gradedBy: sub.gradedBy,
            }
          : null,
      };
    });

    return NextResponse.json({ assignments: formattedAssignments });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
