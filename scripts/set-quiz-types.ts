import { prisma } from '../lib/prisma';

async function setQuizTypes() {
  console.log("=== UPDATING QUIZ LESSON TYPES TO 'QUIZ' IN DATABASE ===");

  const chapter = await prisma.chapter.findFirst({
    where: { title: { contains: "Question Bank" } },
    include: { lessons: true }
  });

  if (chapter) {
    const updated = await prisma.lesson.updateMany({
      where: { chapterId: chapter.id },
      data: { type: "QUIZ" }
    });
    console.log(`✅ Updated ${updated.count} lessons in chapter "${chapter.title}" to type="QUIZ"`);
  }

  // Also update any lesson with title starting with Quiz
  const updatedByTitle = await prisma.lesson.updateMany({
    where: { title: { startsWith: "Quiz Q" } },
    data: { type: "QUIZ" }
  });

  console.log(`✅ Updated ${updatedByTitle.count} quiz questions by title pattern to type="QUIZ"`);
}

setQuizTypes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
