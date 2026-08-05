import mysql from "mysql2/promise";

async function dropWpTables() {
  console.log("=========================================================================");
  console.log(" 🧹 DROPPING ALL LEGACY WORDPRESS (wp_*) TABLES FROM LOCAL DATABASE");
  console.log("=========================================================================");

  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3212",
    database: "imhs_db",
  });

  try {
    // Get all tables starting with wp_
    const [rows]: any = await connection.query("SHOW TABLES LIKE 'wp_%'");
    const tableNames: string[] = rows.map((r: any) => Object.values(r)[0] as string);

    console.log(`🔍 Found ${tableNames.length} legacy WordPress tables to drop...`);

    if (tableNames.length === 0) {
      console.log("✨ No wp_* tables found in imhs_db. Database is already clean!");
      await connection.end();
      return;
    }

    // Disable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    for (const table of tableNames) {
      process.stdout.write(`   Dropping table \`${table}\`... `);
      await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
      console.log("✓ Done");
    }

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("=========================================================================");
    console.log(` 🎉 SUCCESSFULLY DROPPED ALL ${tableNames.length} WORDPRESS TABLES!`);
    console.log("=========================================================================");
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
  } finally {
    await connection.end();
  }
}

dropWpTables();
