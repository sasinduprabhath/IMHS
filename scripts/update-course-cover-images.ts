import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courseImageMappings: Record<string, string> = {
  "med-101-modern-pharmacy": "https://imhsedu.com/wp-content/uploads/2025/09/Blue-and-White-Modern-Pharmacy-Lab-Poster-13.png",
  "med-104-lab-technology": "https://imhsedu.com/wp-content/uploads/2025/09/Moder-Pharmacy-7.png",
  "imhs-modern-pharmacy-batch-09": "https://imhsedu.com/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-08-at-10.45.19-AM.jpeg",
  "imhs-modern-pharmacy-batch-10": "https://imhsedu.com/wp-content/uploads/2026/07/WhatsApp-Image-2026-07-01-at-10.46.45-AM.jpeg",
  "advanced-certificate-pharma-manufacturing": "https://imhsedu.com/wp-content/uploads/2025/12/Blue-and-White-Modern-Pharmacy-Lab-Poster-3.png",
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
