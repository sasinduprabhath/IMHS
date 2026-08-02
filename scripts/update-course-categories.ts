import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Prisma Course categories with official category names from SQL dump...");

  const courses = await prisma.course.findMany();

  for (const course of courses) {
    let categoryName = "Pharmacy Practice"; // Default fallback
    const t = course.title.toLowerCase();
    const s = course.slug.toLowerCase();

    if (t.includes("manufacturing") || s.includes("manufacturing")) {
      categoryName = "Pharmaceutical Manufacturing";
    } else if (t.includes("forensic") || s.includes("forensic")) {
      categoryName = "Forensic Pharmacy";
    } else if (t.includes("pharmacology") || s.includes("pharmacology")) {
      categoryName = "Pharmacology";
    } else if (t.includes("pharmaceutics") || s.includes("pharmaceutics")) {
      categoryName = "Pharmaceutics";
    } else if (t.includes("revision") || t.includes("fast track") || s.includes("revision")) {
      categoryName = "SLMC Exam Revision";
    } else if (t.includes("foundation") || s.includes("foundation")) {
      categoryName = "Foundation in Pharmaceutical Science";
    } else if (t.includes("laboratory") || t.includes("lab") || s.includes("lab")) {
      categoryName = "Medical Laboratory Technology";
    } else if (t.includes("modern pharmacy") || t.includes("slmc") || s.includes("modern-pharmacy")) {
      categoryName = "Modern Pharmacy (SLMC Registration)";
    }

    await prisma.course.update({
      where: { id: course.id },
      data: { category: categoryName },
    });

    console.log(`✅ [${course.id}] "${course.title}" ➔ Category: "${categoryName}"`);
  }

  console.log("\nAll course categories updated in database!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
