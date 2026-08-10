import { ModuleQuestion } from "@/types/pharmacology";

export const SAMPLE_MODULE_QUESTIONS: ModuleQuestion[] = [
  {
    id: "q1",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Pharmacokinetics",
    statement: "Amlodipine undergoes extensive first-pass hepatic metabolism primarily mediated by CYP3A4 enzymes.",
    isTrue: true,
    explanation: "True. Amlodipine is extensively metabolized by the liver via CYP3A4 into inactive metabolites, with absolute bioavailability around 64-90%."
  },
  {
    id: "q2",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Posology & Dosing",
    statement: "The maximum recommended daily oral dose of Amlodipine in adults is 20 mg once daily.",
    isTrue: false,
    explanation: "False. The maximum standard daily dose of Amlodipine is 10 mg once daily. Exceeding 10 mg dramatically increases adverse vascular effects like peripheral oedema."
  },
  {
    id: "q3",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Renal Clearance",
    statement: "Metformin is excreted unchanged in the urine via glomerular filtration and tubular secretion without hepatic metabolism.",
    isTrue: true,
    explanation: "True. Metformin is not metabolized by the liver and is eliminated >90% unchanged in urine within 24 hours."
  },
  {
    id: "q4",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Renal Impairment",
    statement: "Metformin can be safely initiated at full dose in patients with an eGFR of 25 mL/min/1.73m².",
    isTrue: false,
    explanation: "False. Metformin is strictly contraindicated when eGFR is below 30 mL/min/1.73m² due to high risk of fatal metformin-associated lactic acidosis."
  },
  {
    id: "q5",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Drug Interactions",
    statement: "Co-administration of Amlodipine with Simvastatin requires limiting the daily dose of Simvastatin to a maximum of 20 mg.",
    isTrue: true,
    explanation: "True. Amlodipine inhibits CYP3A4 metabolism of simvastatin, increasing simvastatin plasma concentrations and rhabdomyolysis risk. Maximum recommended simvastatin dose is 20 mg/day with amlodipine."
  },
  {
    id: "q6",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Toxicology & Antidotes",
    statement: "N-acetylcysteine (NAC) functions as an effective antidote for paracetamol overdose by replenishing hepatic glutathione stores.",
    isTrue: true,
    explanation: "True. NAC provides sulfhydryl groups that detoxify NAPQI (the reactive toxic metabolite of paracetamol) and restore hepatic glutathione levels."
  },
  {
    id: "q7",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Adverse Effects",
    statement: "Ankle oedema caused by Amlodipine is primarily due to sodium and fluid retention by the kidneys.",
    isTrue: false,
    explanation: "False. Amlodipine-induced ankle swelling is non-cardiogenic and caused by preferential precapillary arteriolar vasodilation, increasing capillary hydrostatic pressure."
  },
  {
    id: "q8",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Dispensing Safety",
    statement: "Extended-release (XR) formulations of Metformin may be crushed or broken in half to assist elderly patients with swallowing difficulties.",
    isTrue: false,
    explanation: "False. Crushing or chewing extended-release tablets destroys the matrix delivery mechanism, leading to rapid drug release ('dose dumping') and severe GI distress."
  },
  {
    id: "q9",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Pharmacodynamics",
    statement: "Atorvastatin works primarily by inhibiting HMG-CoA reductase, thereby blocking hepatic synthesis of mevalonate.",
    isTrue: true,
    explanation: "True. Inhibiting HMG-CoA reductase reduces intracellular cholesterol synthesis, upregulating cell-surface LDL receptors and lowering plasma LDL-C."
  },
  {
    id: "q10",
    moduleId: "mod-01",
    moduleTitle: "Module 01: Clinical Pharmacokinetics & Posology",
    topic: "Antibiotic Stewardship",
    statement: "Amoxicillin is a bactericidal antibiotic that acts by inhibiting bacterial cell wall synthesis during active multiplication.",
    isTrue: true,
    explanation: "True. Amoxicillin binds to penicillin-binding proteins (PBPs) in the cell wall, inhibiting peptidoglycan synthesis and causing bacterial cell lysis."
  }
];
