import { DrugClassificationActivity } from "@/components/student/practice/DrugClassificationActivity";
import { getDrugKnowledgeList, getDrugKnowledgeById } from "@/actions/drug-actions";
import { DRUGS, DEFAULT_DRUG_ID, getDrugById } from "@/data/drugs";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Drug Classification Challenge — IMHS Practice Hub",
  description: "Identify and classify pharmacological properties of a medicine step-by-step.",
};

interface Props {
  searchParams?: Promise<{ drug?: string }>;
}

export default async function DrugClassificationPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const drugId = params.drug || DEFAULT_DRUG_ID;

  let dbDrug = await getDrugKnowledgeById(drugId);
  if (!dbDrug) {
    const allDb = await getDrugKnowledgeList();
    const match = allDb.find(
      (d) => d.id === drugId || d.genericName.toLowerCase() === drugId.toLowerCase()
    );
    if (match) dbDrug = match;
  }

  const drug = dbDrug
    ? {
        id: dbDrug.id,
        genericName: dbDrug.genericName,
        drugClass: dbDrug.drugClass,
        drugClassOptions: (dbDrug.drugClassOptions as string[]) || [dbDrug.drugClass, "ACE Inhibitor", "Beta Blocker", "CCB"],
        mechanismOfAction: dbDrug.mechanismOfAction,
        moaOptions: (dbDrug.moaOptions as string[]) || [dbDrug.mechanismOfAction, "Inhibits cell wall synthesis"],
        commonSideEffects: (dbDrug.sideEffects as string[]) || ["Nausea"],
        sideEffectOptions: (dbDrug.sideEffectOptions as string[]) || (dbDrug.sideEffects as string[]) || ["Nausea", "Headache"],
        keyInteractions: (dbDrug.interactions as string[]) || ["CYP3A4 Inhibitors"],
        interactionOptions: (dbDrug.interactionOptions as string[]) || (dbDrug.interactions as string[]) || ["CYP3A4 Inhibitors", "NSAIDs"],
        antidote: dbDrug.antidote || "None / Symptomatic Support",
        antidoteOptions: (dbDrug.antidoteOptions as string[]) || [dbDrug.antidote || "None / Symptomatic Support", "Naloxone"],
      }
    : getDrugById(drugId);

  if (!drug) notFound();

  return <DrugClassificationActivity drug={drug as any} />;
}
