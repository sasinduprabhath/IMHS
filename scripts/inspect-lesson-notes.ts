import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectLessonNotes() {
  console.log("=========================================================================");
  console.log(" 🔍 INSPECTING LESSON NOTES (CONTENT) IN DATABASE");
  console.log("=========================================================================");

  const lessonsWithContent = await prisma.lesson.findMany({
    where: {
      content: {
        not: null,
      },
    },
    take: 10,
    select: {
      id: true,
      title: true,
      type: true,
      driveFileId: true,
      vimeoVideoId: true,
      content: true,
    },
  });

  console.log(`Found ${lessonsWithContent.length} lessons with content (sample 10):`);
  for (const l of lessonsWithContent) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Title: ${l.title}`);
    console.log(`Type: ${l.type} | Drive: ${l.driveFileId} | Vimeo: ${l.vimeoVideoId}`);
    console.log(`Content Raw Snippet (first 300 chars):\n${l.content?.slice(0, 300)}`);
  }
}

inspectLessonNotes()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
