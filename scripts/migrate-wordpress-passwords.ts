import mysql from "mysql2/promise";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Importing Legacy WordPress Password Hashes & Reg IDs for all Students...");

  const legacyDb = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "imhs_legacy_db",
  });

  const [legacyUsers]: any = await legacyDb.query(`
    SELECT u.ID, u.user_login, u.user_email, u.user_pass
    FROM wp_users u
    WHERE u.user_email IS NOT NULL AND u.user_email != ''
  `);

  console.log(`📦 Loaded ${legacyUsers.length} student records from wp_users.`);

  let updatedCount = 0;

  for (const lu of legacyUsers) {
    const email = lu.user_email.toLowerCase().trim();
    if (!email) continue;

    const rawRegId = lu.user_login?.trim();
    const studentId = rawRegId ? rawRegId.toUpperCase() : `IWPH${lu.ID}`;
    const passwordHash = lu.user_pass;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            studentId,
            passwordHash,
          },
        });
        updatedCount++;
      } catch {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            studentId: `${studentId}-${lu.ID}`,
            passwordHash,
          },
        });
        updatedCount++;
      }
    }
  }

  console.log(`🎉 Success! Imported Password Hashes & Reg IDs for ${updatedCount} students!`);

  await legacyDb.end();
  await prisma.$disconnect();
}

main().catch(console.error);
