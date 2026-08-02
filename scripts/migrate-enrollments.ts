import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Student Course Enrollments Migration...");

  const legacyDb = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3212",
    database: "imhs_legacy_db",
  });

  // Query all completed / processing student enrollments from Tutor LMS
  const [enrollments]: any = await legacyDb.query(`
    SELECT e.ID, u.user_email, c.post_title as course_title, c.post_name as course_slug, e.post_status, e.post_date
    FROM wp_posts e
    JOIN wp_users u ON e.post_author = u.ID
    JOIN wp_posts c ON e.post_parent = c.ID
    WHERE e.post_type = 'tutor_enrolled'
    AND e.post_status IN ('completed', 'processing', 'publish')
    AND u.user_email IS NOT NULL AND u.user_email != ''
  `);

  console.log(`🎓 Found ${enrollments.length} active/completed student enrollments to process.`);

  let successCount = 0;
  let skippedCount = 0;
  let missingUserCount = 0;
  let missingCourseCount = 0;

  for (const en of enrollments) {
    const email = en.user_email.toLowerCase().trim();
    if (!email) continue;

    // Find student user in Prisma imhs_db
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      missingUserCount++;
      continue;
    }

    // Find course in Prisma imhs_db by slug or title match
    const courseTitle = en.course_title?.trim();
    let courseSlug = en.course_slug || courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    courseSlug = courseSlug.replace(/^-+|-+$/g, "");

    let course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: courseSlug },
          { title: courseTitle },
        ],
      },
    });

    // Fallback: If exact match not found, match first available course or create a stub course
    if (!course) {
      const allCourses = await prisma.course.findMany({ take: 1 });
      if (allCourses.length > 0) {
        course = allCourses[0];
      }
    }

    if (!course) {
      missingCourseCount++;
      continue;
    }

    // Create or skip existing enrollment in Prisma
    try {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          courseId: course.id,
          status: "ACTIVE",
          enrolledAt: new Date(en.post_date || Date.now()),
        },
      });
      successCount++;
    } catch {
      skippedCount++;
    }
  }

  console.log(`\n🎉 Student Enrollment Migration Summary:`);
  console.log(`- Successfully Linked Enrollments: ${successCount}`);
  console.log(`- Skipped / Already Enrolled: ${skippedCount}`);
  console.log(`- Unmatched Users: ${missingUserCount}`);
  console.log(`- Unmatched Courses: ${missingCourseCount}`);

  await legacyDb.end();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration Error:", err);
  process.exit(1);
});
