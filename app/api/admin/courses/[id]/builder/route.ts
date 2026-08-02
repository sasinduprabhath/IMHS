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
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { chapters } = body; // Array of chapters with lessons

    if (!Array.isArray(chapters)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    // Transaction to replace course structure safely
    await prisma.$transaction(async (tx) => {
      // Find existing chapters
      const existingChapters = await tx.chapter.findMany({
        where: { courseId: id },
        select: { id: true },
      });

      const existingChapterIds = existingChapters.map((c) => c.id);

      // Delete existing lessons and chapters
      if (existingChapterIds.length > 0) {
        await tx.lessonProgress.deleteMany({
          where: { lesson: { chapterId: { in: existingChapterIds } } },
        });
        await tx.lesson.deleteMany({
          where: { chapterId: { in: existingChapterIds } },
        });
        await tx.chapter.deleteMany({
          where: { courseId: id },
        });
      }

      // Re-create chapters and lessons
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const newChapter = await tx.chapter.create({
          data: {
            courseId: id,
            title: ch.title || `Chapter ${i + 1}`,
            order: i + 1,
          },
        });

        if (Array.isArray(ch.lessons)) {
          for (let j = 0; j < ch.lessons.length; j++) {
            const les = ch.lessons[j];
            await tx.lesson.create({
              data: {
                chapterId: newChapter.id,
                title: les.title || `Lesson ${j + 1}`,
                type: les.type === "DOCUMENT" ? "DOCUMENT" : "VIDEO",
                vimeoVideoId: les.vimeoVideoId || null,
                driveFileId: les.driveFileId || null,
                content: les.content || "",
                order: j + 1,
              },
            });
          }
        }
      }
    });

    const updatedCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
