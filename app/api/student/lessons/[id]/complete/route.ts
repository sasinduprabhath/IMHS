import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await params;

    // Resolve active user in database (by ID or fallback to email)
    let targetUserId = session.user.id;
    const userById = targetUserId
      ? await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } })
      : null;

    if (!userById && session.user.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (userByEmail) {
        targetUserId = userByEmail.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: "User account not found" }, { status: 404 });
    }

    // Verify target lesson exists in database
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });

    if (!lesson) {
      return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    }

    // Check existing progress
    const existing = await prisma.lessonProgress.findFirst({
      where: {
        userId: targetUserId,
        lessonId: lesson.id,
      },
    });

    if (existing) {
      // Toggle off (unmark)
      await prisma.lessonProgress.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, completed: false });
    } else {
      // Create progress (mark complete)
      await prisma.lessonProgress.create({
        data: {
          userId: targetUserId,
          lessonId: lesson.id,
        },
      });
      return NextResponse.json({ success: true, completed: true });
    }
  } catch (error: any) {
    console.error("Lesson completion toggle error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
