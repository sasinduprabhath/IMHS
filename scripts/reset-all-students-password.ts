import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TARGET_PASSWORD = "IMHS123";
const BCRYPT_ROUNDS = 12;

async function resetAllStudentsPassword() {
  console.log("=========================================================================");
  console.log(" 🔑 IMHS BULK STUDENT PASSWORD RESET UTILITY");
  console.log("=========================================================================");
  console.log(`Target Password : "${TARGET_PASSWORD}"`);
  console.log(`Bcrypt Rounds   : ${BCRYPT_ROUNDS}`);

  // 1. Audit user counts before running
  const [totalUsers, adminCount, studentCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);

  console.log(`\n📊 Current User Counts in Database:`);
  console.log(`- Total Users   : ${totalUsers}`);
  console.log(`- Admin Accounts: ${adminCount} (Protected - will NOT be modified)`);
  console.log(`- Students      : ${studentCount} (Will be reset to "${TARGET_PASSWORD}")`);

  if (studentCount === 0) {
    console.log("⚠️ No students found to update.");
    return;
  }

  // 2. Generate secure bcrypt hash
  console.log(`\n⏳ Generating secure Bcrypt hash...`);
  const passwordHash = await bcrypt.hash(TARGET_PASSWORD, BCRYPT_ROUNDS);

  // Self-verification check
  const isHashValid = await bcrypt.compare(TARGET_PASSWORD, passwordHash);
  if (!isHashValid) {
    throw new Error("Self-verification check failed for generated hash!");
  }
  console.log(`✅ Hash generated & verified successfully: ${passwordHash.substring(0, 15)}...`);

  // 3. Perform bulk update only for students
  console.log(`\n🚀 Updating ${studentCount} student records in database...`);
  const result = await prisma.user.updateMany({
    where: {
      role: "STUDENT",
    },
    data: {
      passwordHash,
    },
  });

  console.log(`✅ Update complete! Total students updated: ${result.count}`);

  // 4. Sample verification of a student record
  console.log(`\n🔍 Verifying sample student login...`);
  const sampleStudent = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    select: { studentId: true, name: true, email: true, passwordHash: true },
  });

  if (sampleStudent) {
    const cleanHash = sampleStudent.passwordHash.replace(/^\$wp\$/, "");
    const testMatch = await bcrypt.compare(TARGET_PASSWORD, cleanHash);
    console.log(`- Student: ${sampleStudent.name} (${sampleStudent.studentId || sampleStudent.email})`);
    console.log(`- Login Check with "${TARGET_PASSWORD}": ${testMatch ? "✅ SUCCESS" : "❌ FAILED"}`);
  }

  // Also verify Tharushi specifically if present
  const tharushi = await prisma.user.findFirst({
    where: { email: "tharushithathsarani1211@gmail.com" },
    select: { studentId: true, name: true, email: true, passwordHash: true },
  });
  if (tharushi) {
    const cleanHash = tharushi.passwordHash.replace(/^\$wp\$/, "");
    const testMatch = await bcrypt.compare(TARGET_PASSWORD, cleanHash);
    console.log(`- Student Tharushi (${tharushi.email}): ${testMatch ? "✅ SUCCESS" : "❌ FAILED"}`);
  }

  console.log("\n=========================================================================");
  console.log(" 🎉 ALL STUDENT PASSWORDS HAVE BEEN RESET TO: " + TARGET_PASSWORD);
  console.log("=========================================================================\n");
}

resetAllStudentsPassword()
  .catch((e) => {
    console.error("❌ Error resetting passwords:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
