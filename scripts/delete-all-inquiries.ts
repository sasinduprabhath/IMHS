import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllInquiries() {
  console.log("=========================================================================");
  console.log(" 🧹 DELETING ALL CONTACT INQUIRIES FROM DATABASE");
  console.log("=========================================================================");

  const deleted = await prisma.contactInquiry.deleteMany({});

  console.log(`✅ Successfully deleted ${deleted.count} inquiries from database.`);
}

deleteAllInquiries()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
