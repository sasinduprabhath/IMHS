import mysql from "mysql2/promise";

async function main() {
  const legacyDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "imhs_legacy_db",
  });

  console.log("🔍 Inspecting Tutor LMS Courses, Topics, and Lessons...");

  // 1. Get sample Published Courses
  const [courses]: any = await legacyDb.query(`
    SELECT ID, post_title, post_name, post_status
    FROM wp_posts
    WHERE post_type = 'courses' AND post_status = 'publish'
    LIMIT 10
  `);

  console.log(`\n📚 Published Courses Sample (${courses.length} found):`);
  console.log(courses);

  // 2. Get sample Lessons & PostMeta keys
  const [lessonMeta]: any = await legacyDb.query(`
    SELECT p.ID, p.post_title, m.meta_key, m.meta_value
    FROM wp_posts p
    JOIN wp_postmeta m ON p.ID = m.post_id
    WHERE p.post_type = 'lesson'
    AND m.meta_key LIKE '%video%'
    LIMIT 10
  `);

  console.log(`\n🎥 Lesson Video Meta Sample:`);
  console.log(lessonMeta);

  await legacyDb.end();
}

main().catch(console.error);
