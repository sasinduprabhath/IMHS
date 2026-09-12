import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const legacyDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "imhs_legacy_db",
  });

  // 1. Inspect Nehul Wafa in legacy DB
  const [nehulLegacy]: any = await legacyDb.query(`
    SELECT ID, user_login, user_email, display_name, user_pass FROM wp_users WHERE display_name LIKE '%Nehul%' OR user_email LIKE '%nehul%'
  `);

  console.log("🔍 Legacy Nehul Wafa record:", nehulLegacy);

  // 2. Inspect Nehul Wafa in Prisma DB
  const nehulPrisma = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { contains: "Nehul" } },
        { email: { contains: "nehul" } },
      ],
    },
  });

  console.log("🔍 Prisma Nehul Wafa record:", nehulPrisma);

  // 3. Sample 5 password hashes from wp_users to inspect hash formats
  const [sampleHashes]: any = await legacyDb.query(`
    SELECT ID, user_login, user_pass FROM wp_users LIMIT 5
  `);

  console.log("\n🔒 Sample WordPress Password Hashes:");
  console.log(sampleHashes);

  await legacyDb.end();
  await prisma.$disconnect();
}

main().catch(console.error);
