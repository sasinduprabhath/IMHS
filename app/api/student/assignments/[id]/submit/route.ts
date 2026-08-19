import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString, sanitizeUrl, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const assignmentSubmitSchema = z.object({
  fileUrl: z.string().min(1, "File URL is required").max(500, "File URL too long"),
  fileName: z.string().min(1, "File Name is required").max(255, "File Name too long"),
  fileSize: z.number().int().nonnegative("File size must be positive").max(52428800).nullable().optional(),
  deviceFingerprint: z.string().max(100).optional().default(""),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(
    `assignment_sub:${session.user.id}:${clientIp}`,
    RATE_LIMITS.ASSIGNMENT_SUBMIT.maxAttempts,
    RATE_LIMITS.ASSIGNMENT_SUBMIT.windowMs
  );
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Assignment submission rate limit reached. Please wait a few minutes.");
  }

  try {
    const { id: rawAssignmentId } = await params;
    const assignmentId = sanitizeIdentifier(rawAssignmentId, 50);

    const body = await req.json();
    const parsed = assignmentSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid submission data." }, { status: 400 });
    }

    const { fileUrl: rawFileUrl, fileName: rawFileName, fileSize, deviceFingerprint } = parsed.data;

    const fileUrl = sanitizeUrl(rawFileUrl);
    if (!fileUrl) {
      return NextResponse.json({ error: "Invalid or dangerous file URL protocol provided." }, { status: 400 });
    }
    const fileName = sanitizeString(rawFileName, 255);

    // 1. Fetch Assignment & Check Enrollment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "You must be actively enrolled in this course to submit assignments" },
        { status: 403 }
      );
    }

    // 2. Deadline Auto-Lock Check
    const now = new Date();
    const isPastDue = now > new Date(assignment.dueDate);

    if (isPastDue && !assignment.allowLate) {
      return NextResponse.json(
        { error: `Submission Deadline Passed: Submissions for this assignment closed on ${new Date(assignment.dueDate).toLocaleString()}` },
        { status: 400 }
      );
    }

    const initialStatus = isPastDue ? "LATE" : "SUBMITTED";

    // 4. Create or Update Submission in MySQL
    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: session.user.id,
        },
      },
      update: {
        fileUrl,
        fileName,
        fileSize: fileSize ? Number(fileSize) : null,
        status: initialStatus,
        submittedAt: now,
      },
      create: {
        assignmentId,
        userId: session.user.id,
        fileUrl,
        fileName,
        fileSize: fileSize ? Number(fileSize) : null,
        status: initialStatus,
        submittedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: isPastDue
        ? "Assignment submitted as Late Submission."
        : "Assignment submitted successfully!",
      submission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
