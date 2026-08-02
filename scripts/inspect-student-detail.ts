import mysql from "mysql2/promise";

async function main() {
  const legacyDb = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3212",
    database: "imhs_legacy_db",
  });

  const [user]: any = await legacyDb.query(`
    SELECT ID, user_login, user_email, display_name FROM wp_users WHERE user_email = 'samanthalakmali771@gmail.com'
  `);

  console.log("User record:", user);

  if (user[0]) {
    const [meta]: any = await legacyDb.query(`
      SELECT meta_key, meta_value FROM wp_usermeta WHERE user_id = ?
    `, [user[0].ID]);
    console.log("User Meta:", meta);

    const [enrollments]: any = await legacyDb.query(`
      SELECT e.ID, e.post_status, c.post_title
      FROM wp_posts e
      JOIN wp_posts c ON e.post_parent = c.ID
      WHERE e.post_type = 'tutor_enrolled' AND e.post_author = ?
    `, [user[0].ID]);
    console.log("Enrollments:", enrollments);
  }

  await legacyDb.end();
}

main().catch(console.error);
