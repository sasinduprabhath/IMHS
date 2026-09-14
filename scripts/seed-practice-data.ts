import { PrismaClient } from "@prisma/client";
import { DRUGS } from "../data/drugs";
import { PRESCRIPTION_CASES } from "../data/prescriptionCases";

const prisma = new PrismaClient();

async function seedPracticeData() {
  console.log("=========================================================================");
  console.log(" 🧪 SEEDING PHARMACOLOGY DRUGS & CLINICAL PRESCRIPTION CASES");
  console.log("=========================================================================");

  // 1. Seed Drug Knowledge
  console.log("\n💊 [1/2] Seeding Drug Knowledge formulary records...");
  let drugsAdded = 0;
  for (const d of DRUGS) {
    const existing = await prisma.drugKnowledge.findUnique({
      where: { genericName: d.genericName },
    });

    const sideEffects = d.commonSideEffects || ["Nausea", "Headache"];
    const interactions = d.keyInteractions || ["CYP3A4 Inhibitors"];
    const classOptions = d.drugClassOptions || [
      d.drugClass,
      "ACE Inhibitor",
      "Beta Blocker (β-blocker)",
      "Biguanide Antidiabetic",
      "Proton Pump Inhibitor (PPI)",
    ];
    const moaOptions = d.moaOptions || [
      d.mechanismOfAction,
      "Competitively inhibits HMG-CoA reductase",
      "Inhibits bacterial cell wall synthesis",
      "Stimulates beta-2 adrenergic receptors",
    ];
    const antidoteOptions = d.antidoteOptions || [
      d.antidote || "None / Symptomatic Support",
      "Naloxone",
      "Flumazenil",
      "Atropine",
      "Acetylcysteine",
    ];

    if (!existing) {
      await prisma.drugKnowledge.create({
        data: {
          genericName: d.genericName,
          drugClass: d.drugClass,
          drugClassOptions: classOptions,
          mechanismOfAction: d.mechanismOfAction,
          moaOptions: moaOptions,
          sideEffects: sideEffects,
          sideEffectOptions: d.sideEffectOptions || sideEffects,
          interactions: interactions,
          interactionOptions: d.interactionOptions || interactions,
          antidote: d.antidote || "None / Symptomatic Support",
          antidoteOptions: antidoteOptions,
          isPublished: true,
        },
      });
      drugsAdded++;
    }
  }
  console.log(`   ✅ Seeded ${drugsAdded} new drugs into DrugKnowledge.`);

  // 2. Seed Prescription Cases
  console.log("\n📋 [2/2] Seeding Clinical Prescription Cases...");
  let casesAdded = 0;
  for (const pc of PRESCRIPTION_CASES) {
    const title = `Clinical Prescription Review Case: ${pc.patient.name}`;
    const existing = await prisma.prescriptionCase.findFirst({
      where: { title },
    });

    if (!existing) {
      await prisma.prescriptionCase.create({
        data: {
          title,
          imageUrl: pc.imageUrl || "/practice/prescriptions/case-01.png",
          patientDetails: pc.patient,
          medicineDetails: pc.medicines,
          hasProblem: pc.hasProblem,
          problemOptions: pc.problemOptions || [],
          correctProblem: (pc as any).correctProblemIds?.join(", ") || (pc as any).correctProblem || "Review prescribed dose and frequency.",
          shouldDispense: (pc as any).expectedAction ? (pc as any).expectedAction === "dispense" : true,
          dispenseReason: (pc as any).dispensingReason || (pc as any).dispenseReason || "Pharmacist clinical review required.",
          counsellingPoints: (pc as any).expectedCounsellingPoints || (pc as any).counsellingPoints || ["Take at prescribed dose only"],
          isPublished: true,
        },
      });
      casesAdded++;
    }
  }
  console.log(`   ✅ Seeded ${casesAdded} new clinical cases into PrescriptionCase.`);

  console.log("=========================================================================");
  console.log(" 🎉 PRACTICE DATA SEEDING COMPLETE!");
  console.log("=========================================================================");
}

seedPracticeData()
  .catch((e) => {
    console.error("❌ Error seeding practice data:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
