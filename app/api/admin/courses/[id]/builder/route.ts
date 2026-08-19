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
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id: courseId } = await params;
    const body = await req.json();
    const { chapters } = body; // Array of chapters with lessons

    if (!Array.isArray(chapters)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    // Non-destructive update strategy preserving existing student LessonProgress
    await prisma.$transaction(async (tx) => {
      // 1. Fetch current database state for this course
      const existingChapters = await tx.chapter.findMany({
        where: { courseId },
        include: { lessons: { select: { id: true } } },
      });

      const existingChapterMap = new Map(existingChapters.map((c) => [c.id, c]));
      const existingLessonIds = new Set(
        existingChapters.flatMap((c) => c.lessons.map((l) => l.id))
      );

      const retainedChapterIds = new Set<string>();
      const retainedLessonIds = new Set<string>();

      // 2. Upsert chapters and lessons
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        let chapterId = ch.id;

        if (chapterId && existingChapterMap.has(chapterId)) {
          // Update existing chapter
          await tx.chapter.update({
            where: { id: chapterId },
            data: {
              title: ch.title || `Chapter ${i + 1}`,
              order: i + 1,
            },
          });
        } else {
          // Create new chapter
          const createdChapter = await tx.chapter.create({
            data: {
              courseId,
              title: ch.title || `Chapter ${i + 1}`,
              order: i + 1,
            },
          });
          chapterId = createdChapter.id;
        }
        retainedChapterIds.add(chapterId);

        if (Array.isArray(ch.lessons)) {
          for (let j = 0; j < ch.lessons.length; j++) {
            const les = ch.lessons[j];
            let lessonId = les.id;

            if (lessonId && existingLessonIds.has(lessonId)) {
              // Update existing lesson (preserves existing student LessonProgress!)
              await tx.lesson.update({
                where: { id: lessonId },
                data: {
                  chapterId,
                  title: les.title || `Lesson ${j + 1}`,
                  type: les.type === "DOCUMENT" ? "DOCUMENT" : "VIDEO",
                  vimeoVideoId: les.vimeoVideoId || null,
                  driveFileId: les.driveFileId || null,
                  content: les.content || "",
                  order: j + 1,
                },
              });
            } else {
              // Create new lesson
              const createdLesson = await tx.lesson.create({
                data: {
                  chapterId,
                  title: les.title || `Lesson ${j + 1}`,
                  type: les.type === "DOCUMENT" ? "DOCUMENT" : "VIDEO",
                  vimeoVideoId: les.vimeoVideoId || null,
                  driveFileId: les.driveFileId || null,
                  content: les.content || "",
                  order: j + 1,
                },
              });
              lessonId = createdLesson.id;
            }
            retainedLessonIds.add(lessonId);
          }
        }
      }

      // 3. Remove deleted lessons and chapters only
      const deletedLessonIds = Array.from(existingLessonIds).filter(
        (id) => !retainedLessonIds.has(id)
      );
      if (deletedLessonIds.length > 0) {
        await tx.lessonProgress.deleteMany({
          where: { lessonId: { in: deletedLessonIds } },
        });
        await tx.lesson.deleteMany({
          where: { id: { in: deletedLessonIds } },
        });
      }

      const deletedChapterIds = Array.from(existingChapterMap.keys()).filter(
        (id) => !retainedChapterIds.has(id)
      );
      if (deletedChapterIds.length > 0) {
        await tx.chapter.deleteMany({
          where: { id: { in: deletedChapterIds } },
        });
      }
    });

    const updatedCourse = await prisma.course.findUnique({
      where: { id: courseId },
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
    console.error("Course builder update error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
