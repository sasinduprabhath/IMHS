import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const courses = await prisma.course.count();
  const chapters = await prisma.chapter.count();
  const lessons = await prisma.lesson.count();

  console.log("📊 IMHS Active Database Totals:");
  console.log(`- Total Registered Users: ${users}`);
  console.log(`- Total Published Courses: ${courses}`);
  console.log(`- Total Chapters/Modules: ${chapters}`);
  console.log(`- Total Video/Document Lessons: ${lessons}`);

  await prisma.$disconnect();
}

main().catch(console.error);
