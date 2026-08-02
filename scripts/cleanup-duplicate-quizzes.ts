import { prisma } from '../lib/prisma';

async function cleanupDuplicateQuizzes() {
  console.log("=== DEDUPLICATING QUIZ QUESTIONS IN DATABASE ===");

  const chapter = await prisma.chapter.findFirst({
    where: { title: { contains: "Question Bank" } },
    include: { lessons: { orderBy: { id: "asc" } } }
  });

  if (!chapter) {
    console.log("No Question Bank chapter found.");
    return;
  }

  const seenContent = new Set<string>();
  const toDeleteIds: string[] = [];

  for (const lesson of chapter.lessons) {
    const textWithoutPrefix = lesson.title.replace(/^Quiz Q\d+:\s*/i, "").trim().toLowerCase();
    
    if (seenContent.has(textWithoutPrefix)) {
      toDeleteIds.push(lesson.id);
    } else {
      seenContent.add(textWithoutPrefix);
    }
  }

  console.log(`Found ${toDeleteIds.length} duplicate quiz lessons to delete.`);

  const BATCH_SIZE = 1000;
  for (let i = 0; i < toDeleteIds.length; i += BATCH_SIZE) {
    const batch = toDeleteIds.slice(i, i + BATCH_SIZE);
    await prisma.lesson.deleteMany({
      where: { id: { in: batch } }
    });
    console.log(`Deleted batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);
  }

  // Re-number remaining lessons in order
  const remainingLessons = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" }
  });

  for (let i = 0; i < remainingLessons.length; i++) {
    const l = remainingLessons[i];
    const cleanTitle = l.title.replace(/^Quiz Q\d+:\s*/i, "");
    await prisma.lesson.update({
      where: { id: l.id },
      data: {
        title: `Quiz Q${i + 1}: ${cleanTitle}`,
        order: i + 1,
        type: "QUIZ",
      }
    });
  }

  console.log(`🎉 DEDUPLICATION COMPLETE! Remaining clean unique quiz questions in DB: ${remainingLessons.length}`);
}

cleanupDuplicateQuizzes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
