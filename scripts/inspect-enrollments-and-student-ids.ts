import mysql from "mysql2/promise";

async function main() {
  const legacyDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "imhs_legacy_db",
  });

  console.log("🔍 Inspecting Legacy Enrollments & Student ID Metadata...");

  // 1. Check tutor_enrolled post records
  const [enrollments]: any = await legacyDb.query(`
    SELECT ID, post_author as student_wp_id, post_parent as course_wp_id, post_status, post_date
    FROM wp_posts
    WHERE post_type = 'tutor_enrolled'
    LIMIT 10
  `);

  console.log("\n🎓 Sample tutor_enrolled Records:");
  console.log(enrollments);

  // 2. Check distinct meta_key names in wp_usermeta to find Student Reg ID / Student Code fields
  const [userMetaKeys]: any = await legacyDb.query(`
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM wp_usermeta
    WHERE meta_key NOT LIKE 'wp_%' AND meta_key NOT LIKE 'session_%' AND meta_key NOT LIKE 'dismissed_%'
    GROUP BY meta_key
    ORDER BY count DESC
    LIMIT 40
  `);

  console.log("\n📋 Sample Custom User Meta Keys in wp_usermeta:");
  console.log(userMetaKeys);

  // 3. Sample usermeta values for a student
  const [sampleUserMeta]: any = await legacyDb.query(`
    SELECT user_id, meta_key, meta_value
    FROM wp_usermeta
    WHERE user_id = 2
    LIMIT 30
  `);

  console.log("\n👤 Sample UserMeta entries for user_id = 2:");
  console.log(sampleUserMeta);

  await legacyDb.end();
}

main().catch(console.error);
