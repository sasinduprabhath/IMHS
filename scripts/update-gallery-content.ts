import { prisma } from "../lib/prisma";

async function main() {
  console.log("Updating gallery items in MySQL database...");

  // Ceylon Pharma Video to order 4
  await prisma.galleryItem.updateMany({
    where: { title: { contains: "Ceylon Pharma" } },
    data: { order: 4 },
  });

  // Update Video 01
  await prisma.galleryItem.updateMany({
    where: { title: { contains: "Practical" } },
    data: {
      title: "Practical and Clinical Training Sessions",
      description: "Watch practical demonstrations of pharmaceutical dispensing and essential clinical techniques.",
      order: 1,
    },
  });

  // Update Video 02
  await prisma.galleryItem.updateMany({
    where: { title: { contains: "Convocation" } },
    data: {
      title: "Student Convocation and Award Ceremony",
      description: "Highlights from the IMHS General Convocation and student award presentations.",
      order: 2,
    },
  });

  // Update Video 03
  await prisma.galleryItem.updateMany({
    where: { title: { contains: "Campus Lecture" } },
    data: {
      title: "Academic Lectures and Interactive Workshops",
      description: "Highlights from academic lectures, examination preparation sessions, interactive workshops, and student activities.",
      order: 3,
    },
  });

  const updated = await prisma.galleryItem.findMany({
    where: { type: "VIDEO" },
    orderBy: { order: "asc" },
  });

  console.log("Updated Videos in DB:");
  for (const v of updated) {
    console.log(`- [Order ${v.order}] ${v.title} -> ${v.description}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
