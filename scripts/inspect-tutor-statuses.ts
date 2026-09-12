import mysql from "mysql2/promise";

async function main() {
  const legacyDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "imhs_legacy_db",
  });

  console.log("🔍 Checking tutor_enrolled status breakdown...");

  const [statuses]: any = await legacyDb.query(`
    SELECT post_status, COUNT(*) as count
    FROM wp_posts
    WHERE post_type = 'tutor_enrolled'
    GROUP BY post_status
  `);

  console.log(statuses);

  // Check sample tutor_enrolled rows with user email and course title
  const [sampleEnrollments]: any = await legacyDb.query(`
    SELECT e.ID, u.user_email, u.display_name, c.post_title as course_title, e.post_status
    FROM wp_posts e
    JOIN wp_users u ON e.post_author = u.ID
    JOIN wp_posts c ON e.post_parent = c.ID
    LIMIT 20
  `);

  console.log("\n🎓 Sample Enrollment Mapping:");
  console.log(sampleEnrollments);

  await legacyDb.end();
}

main().catch(console.error);
