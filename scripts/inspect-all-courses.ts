import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectCourses() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  console.log(`=========================================================================`);
  console.log(` 📚 ALL COURSES IN DATABASE (${courses.length} Total)`);
  console.log(`=========================================================================`);

  for (const c of courses) {
    console.log(`\n📘 Course: ${c.title} (ID: ${c.id})`);
    console.log(`   Slug: ${c.slug}`);
    console.log(`   Price: LKR ${c.price} (Original: LKR ${c.originalPrice})`);
    console.log(`   CoverImage: ${c.coverImage}`);
    console.log(`   Category: ${c.category} | Level: ${c.level}`);
    console.log(`   Modules/Chapters: ${c.chapters.length} | Lessons: ${c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)}`);
    console.log(`   Active Enrollments: ${c._count.enrollments}`);
  }
}

inspectCourses().finally(() => prisma.$disconnect());
