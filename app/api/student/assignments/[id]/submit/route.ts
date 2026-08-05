import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: assignmentId } = await params;
    const body = await req.json();
    const { fileUrl, fileName, fileSize, deviceFingerprint } = body;

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: "File URL and File Name are required" }, { status: 400 });
    }

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

    // 2. Register/Update Device Signature (Allowed device tracking)
    if (deviceFingerprint) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          deviceSignature: deviceFingerprint,
          deviceLockedAt: new Date(),
        },
      }).catch(() => {}); // non-blocking update
    }

    // 3. Deadline Auto-Lock Check
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
