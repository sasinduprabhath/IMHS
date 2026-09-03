import { prisma } from "../lib/prisma";

async function main() {
  console.log("Updating Dr. Isuru Wijesinghe in MySQL database...");

  await prisma.facultyMember.updateMany({
    where: { name: { contains: "Isuru" } },
    data: {
      name: "Dr. Isuru Wijesinghe, Ph.D.",
      title: "Senior Lecturer & Executive Director",
      bio: "Dr. Isuru Wijesinghe is an academic and researcher with a Ph.D. and MSc in Pharmaceutical Sciences and a B.Pharm (Special) degree. He brings extensive experience in pharmacy education, pharmaceutical research, and the pharmaceutical industry, with a strong commitment to academic excellence and professional development.",
    },
  });

  const updated = await prisma.facultyMember.findMany({
    where: { name: { contains: "Isuru" } },
  });

  console.log("Updated Faculty Member in DB:", updated);
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
