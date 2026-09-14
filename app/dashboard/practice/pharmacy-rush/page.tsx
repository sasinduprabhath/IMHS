import { PharmacyRushActivity } from "@/components/student/practice/PharmacyRushActivity";
import { getDrugKnowledgeList } from "@/actions/drug-actions";
import { DRUGS } from "@/data/drugs";
import type { Drug } from "@/types/pharmacology";

export const metadata = {
  title: "Pharmacy Rush — IMHS Practice Hub",
  description: "Beat the clock: 10 rounds of pharmacology knowledge for one medicine.",
};

interface Props {
  searchParams?: Promise<{ drug?: string }>;
}

export default async function PharmacyRushPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const drugId = params.drug;

  // 1. Fetch all real DB drugs, falling back to curated DRUGS if DB is empty
  const dbDrugs = await getDrugKnowledgeList();

  // 2. Format all real DB drugs into standard Drug interface
  const formattedAvailableDrugs: Drug[] = (dbDrugs && dbDrugs.length > 0)
    ? dbDrugs.map((d: any) => {
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
      commonStrengths: ["Standard therapeutic dose"],
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
  })
: DRUGS;

  // 3. Find the selected DB drug, or default to the FIRST real DB drug
  let selectedDrug = formattedAvailableDrugs[0];
  if (drugId) {
    const match = formattedAvailableDrugs.find(
      (d) => d.id === drugId || d.genericName.toLowerCase() === drugId.toLowerCase()
    );
    if (match) {
      selectedDrug = match;
    }
  }

  return (
    <PharmacyRushActivity
      drug={selectedDrug}
      availableDrugs={formattedAvailableDrugs}
    />
  );
}
