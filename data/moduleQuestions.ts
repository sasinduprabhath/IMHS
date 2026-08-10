import type { QuizQuestion } from "@/types/pharmacology";

// ─── Module Assessment — Question Bank ────────────────────────────────────────
// True/False questions for Module Assessment (Activity 03).
// Expand to 100 per module with clinical content team input.
// Each question tagged with a `topic` for grouped review in results screen.

export const MODULE_QUESTIONS: QuizQuestion[] = [
  // ── CARDIOVASCULAR ────────────────────────────────────────────────────────
  {
    id: "cv-01",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Amlodipine is classified as a Calcium Channel Blocker.",
    answer: true,
    explanation: "Amlodipine belongs to the dihydropyridine subclass of Calcium Channel Blockers (CCBs).",
  },
  {
    id: "cv-02",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Amlodipine is primarily used to treat asthma.",
    answer: false,
    explanation: "Amlodipine is used for hypertension and angina — not asthma. Beta-2 agonists are used for asthma.",
  },
  {
    id: "cv-03",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Ankle oedema is a recognised side effect of Amlodipine.",
    answer: true,
    explanation: "Peripheral/ankle oedema occurs due to arteriolar dilation and increased capillary filtration.",
  },
  {
    id: "cv-04",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Amlodipine can be safely taken with grapefruit juice without any concern.",
    answer: false,
    explanation: "Grapefruit juice inhibits CYP3A4, increasing Amlodipine plasma levels and risk of side effects.",
  },
  {
    id: "cv-05",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "The standard maximum daily dose of Amlodipine is 10 mg.",
    answer: true,
    explanation: "10 mg once daily is the maximum recommended dose for Amlodipine in adults.",
  },
  {
    id: "cv-06",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Amlodipine should be abruptly stopped when blood pressure normalises.",
    answer: false,
    explanation: "Antihypertensives must not be stopped abruptly — this can cause rebound hypertension. Continue until instructed by the prescriber.",
  },

  // ── DIABETES DRUGS ────────────────────────────────────────────────────────
  {
    id: "dm-01",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Metformin belongs to the Biguanide class of antidiabetic drugs.",
    answer: true,
    explanation: "Metformin is the prototype Biguanide and the first-line oral antidiabetic for Type 2 Diabetes.",
  },
  {
    id: "dm-02",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Metformin is contraindicated in patients with an eGFR below 30 mL/min.",
    answer: true,
    explanation: "In severe renal impairment, Metformin accumulates and increases the risk of lactic acidosis.",
  },
  {
    id: "dm-03",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Metformin should be taken on an empty stomach for best absorption.",
    answer: false,
    explanation: "Metformin should be taken with meals to reduce gastrointestinal side effects (nausea, diarrhoea).",
  },
  {
    id: "dm-04",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Lactic acidosis is a rare but serious adverse effect of Metformin.",
    answer: true,
    explanation: "Lactic acidosis is a potentially fatal but rare complication, more likely in renal/hepatic impairment or with iodinated contrast media.",
  },
  {
    id: "dm-05",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Metformin should be held 48 hours before and after a CT scan with contrast dye.",
    answer: true,
    explanation: "Contrast-induced nephropathy can cause renal failure, leading to Metformin accumulation and lactic acidosis risk.",
  },
  {
    id: "dm-06",
    moduleId: "pharmacology-01",
    topic: "Antidiabetic Drugs",
    statement: "Metformin commonly causes hypoglycaemia as a primary side effect.",
    answer: false,
    explanation: "Metformin does not cause hypoglycaemia when used alone. It does not stimulate insulin secretion.",
  },

  // ── STATINS ───────────────────────────────────────────────────────────────
  {
    id: "st-01",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Atorvastatin inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol synthesis.",
    answer: true,
    explanation: "All statins work by competitively inhibiting HMG-CoA reductase, reducing hepatic cholesterol production.",
  },
  {
    id: "st-02",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Atorvastatin is safe to use in pregnancy.",
    answer: false,
    explanation: "Statins are contraindicated in pregnancy — they may cause congenital abnormalities. Pregnancy must be excluded before starting a statin.",
  },
  {
    id: "st-03",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Unexplained muscle pain while on Atorvastatin should be reported to a doctor.",
    answer: true,
    explanation: "Myalgia/rhabdomyolysis is a serious statin side effect. CK (creatine kinase) should be checked if muscle symptoms occur.",
  },
  {
    id: "st-04",
    moduleId: "pharmacology-01",
    topic: "Cardiovascular Drugs",
    statement: "Clarithromycin is safe to combine with high-dose Atorvastatin.",
    answer: false,
    explanation: "Clarithromycin inhibits CYP3A4, significantly increasing statin blood levels and risk of myopathy/rhabdomyolysis.",
  },

  // ── ANTIBIOTICS ───────────────────────────────────────────────────────────
  {
    id: "ab-01",
    moduleId: "pharmacology-01",
    topic: "Antibiotics",
    statement: "Amoxicillin is effective against viral infections such as the common cold.",
    answer: false,
    explanation: "Antibiotics are ineffective against viruses. Prescribing antibiotics for viral infections contributes to antimicrobial resistance.",
  },
  {
    id: "ab-02",
    moduleId: "pharmacology-01",
    topic: "Antibiotics",
    statement: "Patients with penicillin allergy may also react to cephalosporins.",
    answer: true,
    explanation: "Cross-reactivity between penicillins and cephalosporins occurs in approximately 1–2% of penicillin-allergic patients.",
  },
  {
    id: "ab-03",
    moduleId: "pharmacology-01",
    topic: "Antibiotics",
    statement: "The full antibiotic course must be completed even if the patient feels better.",
    answer: true,
    explanation: "Stopping antibiotics early can lead to incomplete eradication of the bacteria and development of resistance.",
  },
  {
    id: "ab-04",
    moduleId: "pharmacology-01",
    topic: "Antibiotics",
    statement: "Amoxicillin can cause a skin rash particularly in patients with infectious mononucleosis.",
    answer: true,
    explanation: "Amoxicillin causes a characteristic maculopapular rash in virtually all patients with acute EBV (glandular fever/mono).",
  },

  // ── GI DRUGS ─────────────────────────────────────────────────────────────
  {
    id: "gi-01",
    moduleId: "pharmacology-01",
    topic: "Gastrointestinal Drugs",
    statement: "Omeprazole is a Proton Pump Inhibitor (PPI) that reduces gastric acid secretion.",
    answer: true,
    explanation: "PPIs irreversibly inhibit the H+/K+ ATPase proton pump in gastric parietal cells.",
  },
  {
    id: "gi-02",
    moduleId: "pharmacology-01",
    topic: "Gastrointestinal Drugs",
    statement: "Omeprazole should be taken 30 minutes before breakfast for maximum effect.",
    answer: true,
    explanation: "PPIs work best when proton pumps are actively secreting acid — i.e., at meal stimulation. Pre-breakfast dosing is optimal.",
  },
  {
    id: "gi-03",
    moduleId: "pharmacology-01",
    topic: "Gastrointestinal Drugs",
    statement: "Long-term PPI use may cause hypomagnesaemia.",
    answer: true,
    explanation: "PPIs reduce magnesium absorption from the gut. Serum magnesium should be monitored in long-term PPI users.",
  },
  {
    id: "gi-04",
    moduleId: "pharmacology-01",
    topic: "Gastrointestinal Drugs",
    statement: "Omeprazole capsules should be crushed before swallowing for faster absorption.",
    answer: false,
    explanation: "Omeprazole capsules are enteric-coated — crushing destroys the coating, exposing the drug to gastric acid before it reaches the small intestine.",
  },
];

export function getQuestionsByModule(moduleId: string): QuizQuestion[] {
  return MODULE_QUESTIONS.filter((q) => q.moduleId === moduleId);
}

export const DEFAULT_MODULE_ID = "pharmacology-01";
