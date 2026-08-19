import type { Drug } from "@/types/pharmacology";

// ─── IMHS Drug Database ───────────────────────────────────────────────────────
// Seed data - expand with clinical staff input.
// Amlodipine is the fully-worked example from the spec (all 10 Rush rounds verified).

export const DRUGS: Drug[] = [
  // ─── 01. AMLODIPINE ──────────────────────────────────────────────────────
  {
    id: "amlodipine",
    genericName: "Amlodipine",
    brandNames: ["Norvasc", "Amlip"],
    drugClass: "Calcium Channel Blocker",
    mechanismOfAction: "Blocks calcium channels in vascular smooth muscle and cardiac cells, reducing peripheral vascular resistance and blood pressure",
    mainIndications: ["Hypertension", "Chronic stable angina", "Vasospastic angina"],
    commonStrengths: ["2.5 mg", "5 mg", "10 mg"],
    dosageForms: ["Tablet"],
    administration: "Once daily",
    commonSideEffects: [
      "Ankle oedema / peripheral oedema",
      "Flushing",
      "Headache",
      "Dizziness",
      "Palpitations",
      "Fatigue",
    ],
    keyInteractions: [
      "Simvastatin (increased statin levels - limit simvastatin dose)",
      "Cyclosporin (increased cyclosporin levels)",
      "CYP3A4 inhibitors (e.g., clarithromycin - increase amlodipine levels)",
      "CYP3A4 inducers (e.g., rifampicin - reduce amlodipine levels)",
    ],
    contraindicationsPrecautions: [
      "Severe aortic stenosis",
      "Cardiogenic shock",
      "Pregnancy (use with caution)",
      "Monitor blood pressure regularly",
      "Caution in hepatic impairment (metabolised by liver)",
    ],
    counsellingPoints: [
      "Take regularly as prescribed, even when feeling well",
      "Do not stop suddenly without doctor advice",
      "Report ankle swelling to your doctor or pharmacist",
      "Avoid grapefruit juice (may increase drug levels)",
      "Change positions slowly to avoid dizziness",
      "Contact your doctor if chest pain occurs",
    ],
    antidote: undefined, // No specific antidote - calcium gluconate for CCB overdose is supportive, not specific reversal
    quickDecisionScenario: {
      scenario: "Patient reports troublesome ankle swelling while on Amlodipine. Best pharmacist action?",
      options: [
        "Ignore it - ankle swelling is not a medication issue",
        "Double the dose for better blood pressure control",
        "Seek pharmacist/doctor review - ankle oedema is a common Amlodipine side effect that may need dose adjustment or drug change",
        "Stop all medicines permanently",
      ],
      correctIndex: 2,
    },
  },

  // ─── 02. METFORMIN ───────────────────────────────────────────────────────
  {
    id: "metformin",
    genericName: "Metformin",
    brandNames: ["Glucophage", "Riomet"],
    drugClass: "Biguanide Antidiabetic",
    mechanismOfAction: "Reduces hepatic glucose production, increases peripheral glucose uptake, and decreases intestinal glucose absorption",
    mainIndications: ["Type 2 Diabetes Mellitus", "Polycystic Ovary Syndrome (PCOS)", "Pre-diabetes (prevention)"],
    commonStrengths: ["500 mg", "850 mg", "1000 mg"],
    dosageForms: ["Tablet", "Modified-release tablet", "Oral solution"],
    administration: "Twice or three times daily with meals (immediate release); Once daily with evening meal (extended release)",
    commonSideEffects: [
      "Nausea",
      "Vomiting",
      "Diarrhoea",
      "Abdominal discomfort",
      "Metallic taste",
      "Rarely: Lactic acidosis (serious)",
    ],
    keyInteractions: [
      "Iodinated contrast media (hold 48h before/after - risk of renal impairment and lactic acidosis)",
      "Alcohol (increased risk of lactic acidosis)",
      "ACE inhibitors (enhanced hypoglycaemic effect)",
      "Corticosteroids (antagonise glucose-lowering effect)",
    ],
    contraindicationsPrecautions: [
      "eGFR < 30 mL/min (contraindicated)",
      "Severe hepatic impairment",
      "Hold before surgery or contrast procedures",
      "Avoid excessive alcohol",
      "Monitor renal function annually",
    ],
    counsellingPoints: [
      "Take with food to reduce GI side effects",
      "Do not crush modified-release tablets",
      "Monitor blood glucose as advised",
      "Report muscle pain or weakness (may indicate lactic acidosis)",
      "Inform your doctor before any scan requiring contrast dye",
      "Maintain a healthy diet and exercise routine alongside medication",
    ],
    antidote: undefined,
    quickDecisionScenario: {
      scenario: "Patient is scheduled for a CT scan with contrast dye tomorrow. They are on Metformin. Best action?",
      options: [
        "Continue Metformin as normal",
        "Double the Metformin dose to ensure stable glucose control",
        "Advise patient to withhold Metformin before and 48h after contrast - refer to doctor",
        "Discontinue Metformin permanently",
      ],
      correctIndex: 2,
    },
  },

  // ─── 03. ATORVASTATIN ────────────────────────────────────────────────────
  {
    id: "atorvastatin",
    genericName: "Atorvastatin",
    brandNames: ["Lipitor", "Torvast"],
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    mechanismOfAction: "Competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in hepatic cholesterol synthesis, reducing LDL-C and triglycerides",
    mainIndications: ["Hypercholesterolaemia", "Cardiovascular risk reduction", "Prevention of atherosclerotic disease"],
    commonStrengths: ["10 mg", "20 mg", "40 mg", "80 mg"],
    dosageForms: ["Tablet"],
    administration: "Once daily (any time of day, consistently)",
    commonSideEffects: [
      "Myalgia (muscle pain)",
      "Elevated liver enzymes",
      "Headache",
      "Nausea",
      "Rarely: Rhabdomyolysis (serious)",
      "Rarely: New-onset diabetes",
    ],
    keyInteractions: [
      "Clarithromycin / Erythromycin (CYP3A4 inhibitors - increase statin levels → myopathy risk)",
      "Amlodipine (limit simvastatin; atorvastatin interaction less severe)",
      "Cyclosporin (markedly increased statin levels)",
      "Grapefruit juice (increases statin exposure)",
      "Fibrates e.g. gemfibrozil (increased myopathy risk)",
    ],
    contraindicationsPrecautions: [
      "Active liver disease",
      "Pregnancy and breastfeeding (contraindicated)",
      "Monitor liver function tests",
      "Monitor for muscle symptoms",
      "Use with caution in renal impairment",
    ],
    counsellingPoints: [
      "Take at the same time each day",
      "Avoid grapefruit and grapefruit juice",
      "Report unexplained muscle pain, tenderness or weakness immediately",
      "Do not stop without consulting your doctor - long-term therapy is important",
      "This medicine does not replace a healthy diet",
      "Alcohol in moderation only - alcohol increases liver risk",
    ],
    antidote: undefined,
    quickDecisionScenario: {
      scenario: "Patient on Atorvastatin 40 mg reports severe muscle pain and dark urine. Best action?",
      options: [
        "Reassure patient - muscle aches are always mild with statins",
        "Increase the dose to improve cholesterol control",
        "Stop Atorvastatin immediately and refer to doctor urgently - possible rhabdomyolysis",
        "Advise the patient to take paracetamol and continue the statin",
      ],
      correctIndex: 2,
    },
  },

  // ─── 04. AMOXICILLIN ─────────────────────────────────────────────────────
  {
    id: "amoxicillin",
    genericName: "Amoxicillin",
    brandNames: ["Amoxil", "Trimox"],
    drugClass: "Aminopenicillin (Beta-lactam Antibiotic)",
    mechanismOfAction: "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs), leading to cell lysis and death",
    mainIndications: ["Respiratory tract infections", "Urinary tract infections", "Skin and soft tissue infections", "H. pylori eradication (with other agents)", "Otitis media"],
    commonStrengths: ["250 mg", "500 mg", "875 mg"],
    dosageForms: ["Capsule", "Tablet", "Oral suspension", "Injection"],
    administration: "Three times daily (or twice daily for high-dose regimens), with or without food",
    commonSideEffects: [
      "Diarrhoea",
      "Nausea",
      "Skin rash",
      "Allergic reactions (urticaria, anaphylaxis - rare)",
      "Oral/vaginal candidiasis",
    ],
    keyInteractions: [
      "Warfarin (may enhance anticoagulant effect - monitor INR)",
      "Oral contraceptives (may reduce efficacy - controversial, advise additional contraception)",
      "Methotrexate (increased methotrexate toxicity)",
      "Probenecid (increases amoxicillin levels by reducing renal excretion)",
    ],
    contraindicationsPrecautions: [
      "Known hypersensitivity to penicillins or cephalosporins (cross-reactivity ~1–2%)",
      "Mononucleosis (infectious mono) - high risk of rash",
      "Use with caution in renal impairment (dose adjust)",
      "History of severe allergy (anaphylaxis) - contraindicated",
    ],
    counsellingPoints: [
      "Complete the full course even if symptoms improve",
      "Report rash, difficulty breathing or swelling immediately",
      "Can be taken with or without food",
      "Shake oral suspension well before each dose",
      "Store suspension in refrigerator and discard after 14 days",
      "Do not use leftover antibiotics or share with others",
    ],
    antidote: undefined,
    quickDecisionScenario: {
      scenario: "Patient requests Amoxicillin for a viral cold. Best pharmacist action?",
      options: [
        "Dispense Amoxicillin - antibiotics are always helpful for colds",
        "Advise that antibiotics are not effective for viral infections - recommend supportive care and refer to doctor if symptoms worsen",
        "Dispense a higher dose for faster effect",
        "Refer immediately to hospital emergency",
      ],
      correctIndex: 1,
    },
  },

  // ─── 05. OMEPRAZOLE ──────────────────────────────────────────────────────
  {
    id: "omeprazole",
    genericName: "Omeprazole",
    brandNames: ["Losec", "Prilosec", "Omez"],
    drugClass: "Proton Pump Inhibitor (PPI)",
    mechanismOfAction: "Irreversibly inhibits the H+/K+ ATPase proton pump in gastric parietal cells, suppressing basal and stimulated gastric acid secretion",
    mainIndications: [
      "Gastro-oesophageal reflux disease (GORD/GERD)",
      "Peptic ulcer disease",
      "H. pylori eradication (with antibiotics)",
      "Zollinger-Ellison syndrome",
      "Prevention of NSAID-induced ulcers",
    ],
    commonStrengths: ["10 mg", "20 mg", "40 mg"],
    dosageForms: ["Capsule", "Tablet", "IV injection"],
    administration: "Once daily, 30 minutes before breakfast (for best effect)",
    commonSideEffects: [
      "Headache",
      "Nausea",
      "Diarrhoea",
      "Abdominal pain",
      "Long-term: Hypomagnesaemia, risk of C. difficile infection, reduced calcium absorption",
      "Long-term: Vitamin B12 deficiency",
    ],
    keyInteractions: [
      "Clopidogrel (PPIs may reduce antiplatelet effect - use pantoprazole instead)",
      "Methotrexate (PPIs may increase methotrexate levels)",
      "Warfarin (may increase INR - monitor)",
      "Iron and Vitamin B12 supplements (reduced absorption - separate timing)",
      "Atazanavir (reduced HIV drug absorption - avoid combination)",
    ],
    contraindicationsPrecautions: [
      "Use at the lowest effective dose for shortest duration",
      "Monitor magnesium if on long-term therapy",
      "Consider calcium/Vitamin D supplementation for long-term users",
      "Do not crush enteric-coated capsules",
    ],
    counsellingPoints: [
      "Take 30 minutes before breakfast for maximum effect",
      "Swallow capsule whole - do not crush or chew (enteric-coated)",
      "Do not use long-term without doctor review",
      "Report persistent diarrhoea - may indicate C. difficile",
      "Tell your pharmacist about all other medicines including herbals",
      "Lifestyle changes (avoid fatty foods, elevate head of bed) alongside medication",
    ],
    antidote: undefined,
    quickDecisionScenario: {
      scenario: "A patient on long-term Omeprazole presents with muscle cramps and twitching. Most likely cause?",
      options: [
        "Amlodipine side effect",
        "Vitamin C deficiency from PPI use",
        "Hypomagnesaemia - a recognised long-term PPI complication",
        "Omeprazole allergy reaction",
      ],
      correctIndex: 2,
    },
  },
];

// Quick lookup by id
export function getDrugById(id: string): Drug | undefined {
  return DRUGS.find((d) => d.id === id);
}

// Default drug for demos
export const DEFAULT_DRUG_ID = "amlodipine";
