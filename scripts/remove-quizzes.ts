import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeQuizzes() {
  console.log("=========================================================================");
  console.log(" 🧹 REMOVING ALL QUIZZES & QUIZ LESSONS FROM DATABASE");
  console.log("=========================================================================");

  // 1. Delete any lessons where type is "QUIZ" or title contains "Quiz" / "Test" / "Exam" (if quiz)
  const quizLessons = await prisma.lesson.deleteMany({
    where: {
      OR: [
        { type: "QUIZ" },
        { title: { contains: "Quiz" } },
        { title: { contains: "quiz" } },
        { title: { contains: "MCQ" } },
        { title: { contains: "mcq" } },
      ],
    },
  });

  console.log(`✅ Removed ${quizLessons.count} quiz lessons from database.`);
}

removeQuizzes()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
