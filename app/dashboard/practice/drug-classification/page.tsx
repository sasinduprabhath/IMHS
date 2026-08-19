import { DrugClassificationActivity } from "@/components/student/practice/DrugClassificationActivity";
import { DrugClassificationPicker } from "@/components/student/practice/DrugClassificationPicker";
import { getDrugKnowledgeList, getDrugKnowledgeById } from "@/actions/drug-actions";
import { notFound } from "next/navigation";
import type { Drug } from "@/types/pharmacology";

export const metadata = {
  title: "Drug Classification Challenge — IMHS Practice Hub",
  description: "Identify and classify pharmacological properties of a medicine step-by-step.",
};

interface Props {
  searchParams?: Promise<{ drug?: string }>;
}

export default async function DrugClassificationPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const drugId = params.drug;

  // 1. Fetch all real DB drugs
  const allDb = await getDrugKnowledgeList();

  if (!allDb || allDb.length === 0) {
    notFound();
  }

  const formattedAllDrugs: Drug[] = allDb.map((d: any) => {
    const sideEffects = Array.isArray(d.sideEffects) ? d.sideEffects : (d.sideEffects ? [d.sideEffects] : ["Nausea"]);
    const interactions = Array.isArray(d.interactions) ? d.interactions : (d.interactions ? [d.interactions] : ["CYP3A4 Inhibitors"]);

    return {
      id: d.id,
      genericName: d.genericName,
      brandNames: [d.genericName],
      drugClass: d.drugClass,
      drugClassOptions: (d.drugClassOptions as string[]) || [d.drugClass, "ACE Inhibitor", "Beta Blocker", "CCB"],
      mechanismOfAction: d.mechanismOfAction,
      moaOptions: (d.moaOptions as string[]) || [d.mechanismOfAction, "Inhibits cell wall synthesis"],
      mainIndications: [d.drugClass],
      commonStrengths: ["Standard Dose"],
      dosageForms: ["Oral Tablet / Capsule"],
      administration: "As directed",
      commonSideEffects: sideEffects,
      sideEffectOptions: (d.sideEffectOptions as string[]) || sideEffects,
      keyInteractions: interactions,
      interactionOptions: (d.interactionOptions as string[]) || interactions,
      contraindicationsPrecautions: ["Hypersensitivity"],
      counsellingPoints: ["Take at prescribed dose only"],
      antidote: d.antidote || "None / Symptomatic Support",
      antidoteOptions: (d.antidoteOptions as string[]) || [d.antidote || "None / Symptomatic Support", "Naloxone"],
    };
  });

  // ── If no drug query is specified, show Medicine Selection Lobby ─────────
  if (!drugId) {
    return <DrugClassificationPicker drugs={formattedAllDrugs} />;
  }

  // ── If a drug is selected, load the simulation from real DB data ──────────
  let targetDrug = formattedAllDrugs.find(
    (d) => d.id === drugId || d.genericName.toLowerCase() === drugId.toLowerCase()
  );

  if (!targetDrug) {
    return <DrugClassificationPicker drugs={formattedAllDrugs} />;
  }

  return <DrugClassificationActivity drug={targetDrug} />;
}
