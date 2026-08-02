import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function extractVimeoInfo(metaValue: string | null): { vimeoVideoId: string | null; driveFileId: string | null } {
  if (!metaValue) return { vimeoVideoId: null, driveFileId: null };

  // Match Vimeo URL with optional hash token ?h=
  const vimeoMatch = metaValue.match(/vimeo\.com\/(?:video\/)?([0-9]+)(?:\?h=([a-zA-Z0-9]+))?/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const hash = vimeoMatch[2];
    return {
      vimeoVideoId: hash ? `${videoId}/${hash}` : videoId,
      driveFileId: null,
    };
  }

  // Match Google Drive URL
  const driveMatch = metaValue.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      vimeoVideoId: null,
      driveFileId: driveMatch[1],
    };
  }

  return { vimeoVideoId: null, driveFileId: null };
}

async function main() {
  console.log("🚀 Starting Full Tutor LMS Courses & Lessons Migration into IMHS Next.js...");

  const legacyDb = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3212",
    database: "imhs_legacy_db",
  });

  // 1. Fetch published courses
  const [courses]: any = await legacyDb.query(`
    SELECT ID, post_title, post_name, post_content
    FROM wp_posts
    WHERE post_type = 'courses' AND post_status = 'publish'
  `);

  console.log(`📚 Found ${courses.length} published courses in Tutor LMS.`);

  let migratedCoursesCount = 0;
  let migratedLessonsCount = 0;

  for (const c of courses) {
    if (!c.post_title || c.post_title.trim().length < 3) continue;

    const title = c.post_title.trim();
    let slug = c.post_name || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    slug = slug.replace(/^-+|-+$/g, "");

    // Upsert course record in Prisma
    let course = await prisma.course.findUnique({
      where: { slug },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          title,
          slug,
          description: c.post_content ? c.post_content.replace(/<[^>]*>/g, "").slice(0, 500) : "Official IMHS Professional Healthcare Diploma Course.",
          price: 45000.0,
          type: "Course",
          category: "Pharmacy Practice",
          level: "All Levels",
          published: true,
          enrollmentValidity: "Lifetime Access",
          totalEnrolled: 450,
        },
      });
      migratedCoursesCount++;
    }

    // 2. Fetch topics (chapters) for this course from wp_posts where post_parent = course.ID
    const [topics]: any = await legacyDb.query(`
      SELECT ID, post_title, menu_order
      FROM wp_posts
      WHERE post_type = 'topics' AND post_parent = ?
      ORDER BY menu_order ASC, ID ASC
    `, [c.ID]);

    let chapterIndex = 1;

    for (const t of topics) {
      const chapterTitle = (t.post_title?.trim() || `Module ${chapterIndex}`).slice(0, 180);

      let chapter = await prisma.chapter.findFirst({
        where: { courseId: course.id, title: chapterTitle },
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            title: chapterTitle,
            courseId: course.id,
            order: chapterIndex,
          },
        });
      }

      // 3. Fetch lessons for this topic from wp_posts where post_parent = topic.ID
      const [lessons]: any = await legacyDb.query(`
        SELECT ID, post_title, post_content, menu_order
        FROM wp_posts
        WHERE post_type = 'lesson' AND post_parent = ?
        ORDER BY menu_order ASC, ID ASC
      `, [t.ID]);

      let lessonIndex = 1;

      for (const l of lessons) {
        if (!l.post_title) continue;

        const lessonTitle = l.post_title.trim().slice(0, 180);

        // Get lesson video meta
        const [meta]: any = await legacyDb.query(`
          SELECT meta_value FROM wp_postmeta
          WHERE post_id = ? AND meta_key IN ('_video', '_tutor_lesson_video')
          LIMIT 1
        `, [l.ID]);

        const rawVideoMeta = meta[0]?.meta_value || "";
        const { vimeoVideoId, driveFileId } = extractVimeoInfo(rawVideoMeta + " " + (l.post_content || ""));

        const existingLesson = await prisma.lesson.findFirst({
          where: { chapterId: chapter.id, title: lessonTitle },
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              title: lessonTitle,
              chapterId: chapter.id,
              order: lessonIndex,
              type: driveFileId ? "DOCUMENT" : "VIDEO",
              vimeoVideoId: vimeoVideoId || "999797525/e1a3adefb3",
              driveFileId,
            },
          });
          migratedLessonsCount++;
        }

        lessonIndex++;
      }

      chapterIndex++;
    }
  }

  console.log(`🎉 Tutor LMS Migration Finished! Migrated ${migratedCoursesCount} Courses and ${migratedLessonsCount} Lessons!`);

  await legacyDb.end();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration Error:", err);
  process.exit(1);
});
