import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      studentId: true,
      email: true,
      passwordHash: true,
    },
  });

  console.log(`Total users in DB: ${users.length}`);

  const counts: Record<string, number> = {
    "Bcrypt ($2a / $2b / $2y)": 0,
    "WordPress Bcrypt ($wp$2y / $wp$2a)": 0,
    "WordPress phpass ($P$)": 0,
    "Empty / Null": 0,
    "Other": 0,
  };

  const sampleFormats: Record<string, string> = {};

  for (const u of users) {
    const hash = u.passwordHash;
    if (!hash) {
      counts["Empty / Null"]++;
      continue;
    }

    if (hash.startsWith("$wp$2y$") || hash.startsWith("$wp$2a$")) {
      counts["WordPress Bcrypt ($wp$2y / $wp$2a)"]++;
      if (!sampleFormats["WordPress Bcrypt"]) {
        sampleFormats["WordPress Bcrypt"] = hash.substring(0, 12) + "... (len: " + hash.length + ")";
      }
    } else if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
      counts["Bcrypt ($2a / $2b / $2y)"]++;
      if (!sampleFormats["Bcrypt"]) {
        sampleFormats["Bcrypt"] = hash.substring(0, 7) + "... (len: " + hash.length + ")";
      }
    } else if (hash.startsWith("$P$")) {
      counts["WordPress phpass ($P$)"]++;
      if (!sampleFormats["WordPress phpass"]) {
        sampleFormats["WordPress phpass"] = hash.substring(0, 6) + "... (len: " + hash.length + ")";
      }
    } else {
      counts["Other"]++;
      if (!sampleFormats["Other"]) {
        sampleFormats["Other"] = hash.substring(0, 10) + "... (len: " + hash.length + ")";
      }
    }
  }

  console.log("\n📊 Password Hash Distribution in Database:");
  console.table(counts);

  console.log("\n🔍 Sample Formats Detected:");
  console.log(sampleFormats);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
