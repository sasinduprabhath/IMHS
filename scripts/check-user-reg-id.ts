import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUserRegId() {
  console.log("=========================================================================");
  console.log(" 🔍 CHECKING USER REGISTRATION ID IN DATABASE");
  console.log("=========================================================================");

  const user = await prisma.user.findFirst({
    where: {
      email: "tehanhewage25@gmail.com",
    },
  });

  console.log("User record found:");
  console.log(`- ID: ${user?.id}`);
  console.log(`- Name: ${user?.name}`);
  console.log(`- Email: ${user?.email}`);
  console.log(`- Student ID (Reg ID): ${user?.studentId || "NULL"}`);
  console.log(`- Role: ${user?.role}`);

  // Let's also check sample student IDs from migrated DB
  const sampleWithRegId = await prisma.user.findMany({
    where: {
      studentId: { not: null },
    },
    take: 5,
    select: { email: true, name: true, studentId: true },
  });

  console.log("\nSample Students with Registration IDs:");
  for (const s of sampleWithRegId) {
    console.log(`- ${s.name} (${s.email}) -> Reg ID: ${s.studentId}`);
  }
}

checkUserRegId()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
