import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const gradeSubmissionSchema = z.object({
  score: z.number().int().min(0, "Score cannot be negative").max(1000, "Score exceeds maximum range"),
  feedback: z.string().max(2000, "Feedback too long").optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const body = await req.json();
    const parsed = gradeSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Valid score is required" }, { status: 400 });
    }

    const { score, feedback } = parsed.data;

    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        score,
        feedback: feedback ? sanitizeString(feedback, 2000) : null,
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
