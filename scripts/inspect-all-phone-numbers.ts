import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const legacyDb = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3212",
    database: "imhs_legacy_db",
  });

  console.log("🔍 Checking WhatsApp Phone Numbers & Reg IDs in wp_usermeta...");

  const [phoneMetaKeys]: any = await legacyDb.query(`
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM wp_usermeta
    WHERE meta_key LIKE '%phone%' OR meta_key LIKE '%mobile%' OR meta_key LIKE '%whatsapp%' OR meta_key LIKE '%digits%'
    GROUP BY meta_key
  `);

  console.log("Phone Meta Keys in legacy DB:", phoneMetaKeys);

  // Sample students with user_login, display_name, user_email, and phone
  const [sampleStudents]: any = await legacyDb.query(`
    SELECT u.ID, u.user_login, u.user_email, u.display_name,
           (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key IN ('billing_phone', 'phone_number', 'digits_phone', 'digits_phone_no', 'phone') LIMIT 1) as phone
    FROM wp_users u
    LIMIT 20
  `);

  console.log("\n👤 Sample Student Records with Reg ID (user_login) & Phone:");
  console.log(sampleStudents);

  await legacyDb.end();
  await prisma.$disconnect();
}

main().catch(console.error);
