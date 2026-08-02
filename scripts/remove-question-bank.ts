import { prisma } from '../lib/prisma';

async function removeQuestionBank() {
  console.log("=== REMOVING PRACTICE QUIZZES & QUESTION BANK CHAPTER FROM DATABASE ===");

  const chapters = await prisma.chapter.findMany({
    where: {
      OR: [
        { title: { contains: "Question Bank" } },
        { title: { contains: "Practice Quizzes" } },
        { title: { contains: "Clinical Question Bank" } }
      ]
    }
  });

  console.log(`Found ${chapters.length} question bank chapters to delete.`);

  for (const ch of chapters) {
    // Cascade delete lessons and chapter
    await prisma.chapter.delete({
      where: { id: ch.id }
    });
    console.log(`Deleted chapter "${ch.title}" (ID: ${ch.id})`);
  }

  // Also clean any lesson with title starting with Quiz
  const quizLessons = await prisma.lesson.deleteMany({
    where: {
      OR: [
        { type: "QUIZ" },
        { title: { startsWith: "Quiz Q" } }
      ]
    }
  });

  console.log(`Deleted ${quizLessons.count} quiz lessons.`);
  console.log("🎉 ALL QUIZZES AND QUESTION BANK CHAPTERS REMOVED FROM DATABASE!");
}

removeQuestionBank()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
