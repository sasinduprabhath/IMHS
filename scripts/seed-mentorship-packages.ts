import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const INITIAL_MENTORSHIP_PACKAGES = [
  {
    packageKey: "STUDY_PLANNING_GUIDANCE",
    number: 1,
    title: "Study Planning and Academic Guidance",
    duration: "30 Minutes",
    durationMins: 30,
    priceLkr: 3500,
    category: "Examination Planning",
    tag: "Examination Planning",
    colorTheme: "teal",
    icon: "GraduationCap",
    description:
      "Personalised guidance on subject priorities, study schedules, revision methods, and preparation based on your current level.",
    order: 1,
    isActive: true,
  },
  {
    packageKey: "MCQ_SEQ_STRATEGIES",
    number: 2,
    title: "MCQ and SEQ Answering Strategies",
    duration: "45 Minutes",
    durationMins: 45,
    priceLkr: 5000,
    category: "Written Examination Preparation",
    tag: "Written Examination Preparation",
    colorTheme: "blue",
    icon: "Stethoscope",
    description:
      "Focused guidance on answering MCQs and SEQs, managing examination time, identifying key points, and improving answer structure.",
    order: 2,
    isActive: true,
  },
  {
    packageKey: "MOCK_VIVA_OSPE_COACHING",
    number: 3,
    title: "Mock Viva and OSPE Coaching",
    duration: "60 Minutes",
    durationMins: 60,
    priceLkr: 7500,
    category: "Practical and Oral Examination Preparation",
    tag: "Practical and Oral Examination Preparation",
    colorTheme: "orange",
    icon: "MessageSquare",
    description:
      "Individual mock viva and OSPE practice with examination-style questions, practical scenarios, immediate feedback, and correction of weaknesses.",
    order: 3,
    isActive: true,
  },
];

async function seedMentorshipPackages() {
  console.log("=========================================================================");
  console.log(" 🩺 SEEDING DR. ISURU MENTORSHIP & CONSULTATION PACKAGES");
  console.log("=========================================================================");

  let count = 0;
  for (const pkg of INITIAL_MENTORSHIP_PACKAGES) {
    const existing = await (prisma as any).mentorshipPackage.findUnique({
      where: { packageKey: pkg.packageKey },
    });

    if (!existing) {
      await (prisma as any).mentorshipPackage.create({
        data: pkg,
      });
      console.log(`+ Created: [${pkg.number}] ${pkg.title} (${pkg.duration} - LKR ${pkg.priceLkr.toLocaleString()})`);
      count++;
    } else {
      console.log(`= Existing: [${pkg.number}] ${pkg.title}`);
    }
  }

  console.log(`\n✅ Seeding complete! ${count} packages added.`);
}

seedMentorshipPackages()
  .catch((e) => {
    console.error("Error seeding mentorship packages:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
