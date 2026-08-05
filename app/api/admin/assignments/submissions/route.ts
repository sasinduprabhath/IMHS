import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (courseId && courseId !== "ALL") {
      where.assignment = { courseId };
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxMarks: true,
            course: { select: { id: true, title: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          },
        },
      },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
