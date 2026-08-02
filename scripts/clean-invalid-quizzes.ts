import { prisma } from '../lib/prisma';

async function cleanInvalidQuizzes() {
  console.log("=== CLEANING OUT JUNK / DUMMY QUIZ QUESTIONS FROM DATABASE ===");

  const chapter = await prisma.chapter.findFirst({
    where: { title: { contains: "Question Bank" } },
    include: { lessons: true }
  });

  if (!chapter) {
    console.log("No Question Bank chapter found.");
    return;
  }

  const junkKeywords = ["firewall", "authentication", "iso2_code", "country_name", "undefined", "test question", "null", "e_submissions"];

  const toDelete = chapter.lessons.filter((l) => {
    const titleLower = l.title.toLowerCase();
    const contentLower = (l.content || "").toLowerCase();
    return junkKeywords.some((kw) => titleLower.includes(kw) || contentLower.includes(kw));
  });

  console.log(`Found ${toDelete.length} junk quiz entries to remove.`);

  for (const item of toDelete) {
    await prisma.lesson.delete({
      where: { id: item.id }
    });
  }

  // Renumber remaining clinical questions
  const remaining = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" }
  });

  for (let i = 0; i < remaining.length; i++) {
    const l = remaining[i];
    const cleanTitle = l.title.replace(/^Quiz Q\d+:\s*/i, "");
    await prisma.lesson.update({
      where: { id: l.id },
      data: {
        title: `Quiz Q${i + 1}: ${cleanTitle}`,
        order: i + 1,
        type: "QUIZ"
      }
    });
  }

  console.log(`✅ Cleaned up! Remaining valid clinical quiz questions: ${remaining.length}`);
}

cleanInvalidQuizzes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
