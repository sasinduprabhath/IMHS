import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courseImageMappings: Record<string, string> = {
  "med-101-modern-pharmacy": "/courses/Blue-and-White-Modern-Pharmacy-Lab-Poster-13.png",
  "med-104-lab-technology": "/courses/Moder-Pharmacy-7.png",
  "imhs-modern-pharmacy-batch-09": "/courses/Copy-of-Moder-Pharmacy-1.png",
  "imhs-modern-pharmacy-batch-10": "/courses/WhatsApp-Image-2026-04-16-at-8.36.36-AM.jpeg",
  "advanced-certificate-pharma-manufacturing": "/courses/Blue-and-White-Modern-Pharmacy-Lab-Poster-3.png",
};

async function main() {
  console.log("Updating Prisma Course records with extracted coverImage URLs from SQL dump...");

  const courses = await prisma.course.findMany();

  for (const course of courses) {
    const imageUrl = courseImageMappings[course.slug] || courseImageMappings["med-101-modern-pharmacy"];
    
    await prisma.course.update({
      where: { id: course.id },
      data: { coverImage: imageUrl },
    });

    console.log(`✅ Updated course "${course.title}" (${course.slug}) with coverImage: ${imageUrl}`);
  }

  console.log("\nAll courses successfully updated!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
