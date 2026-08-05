import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { score, feedback } = body;

    if (score === undefined || score === null || isNaN(Number(score))) {
      return NextResponse.json({ error: "Valid numeric score is required" }, { status: 400 });
    }

    const numericScore = Number(score);

    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        score: numericScore,
        feedback: feedback || null,
        status: "GRADED",
        gradedAt: new Date(),
        gradedBy: session.user.name || "Lecturer",
      },
      include: {
        assignment: { select: { title: true, maxMarks: true } },
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 });
  }
}
