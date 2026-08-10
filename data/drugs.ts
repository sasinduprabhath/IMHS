import { Drug } from "@/types/pharmacology";

export const SAMPLE_DRUGS: Drug[] = [
  {
    id: "amlodipine",
    genericName: "Amlodipine Besylate",
    brandNames: ["Norvasc", "Amlod", "Amcard"],
    drugClass: "Dihydropyridine Calcium Channel Blocker (CCB)",
    mechanismOfAction: "Selectively inhibits transmembrane influx of calcium ions into vascular smooth muscle and cardiac muscle, causing arterial vasodilation and reducing peripheral vascular resistance.",
    mainIndications: [
      "Essential Hypertension",
      "Chronic Stable Angina",
      "Vasospastic (Prinzmetal's) Angina"
    ],
    commonStrengths: ["2.5 mg", "5 mg", "10 mg"],
    dosageForms: ["Oral Tablet"],
    administration: "Usually taken once daily, with or without food. Consistent daily timing recommended.",
    commonSideEffects: [
      "Peripheral ankle oedema",
      "Flushing & sensation of warmth",
      "Headache",
      "Dizziness",
      "Palpitations"
    ],
    keyInteractions: [
      "Simvastatin (max 20 mg simvastatin daily when co-administered)",
      "Strong CYP3A4 inhibitors (Ketoconazole, Itraconazole, Ritonavir)",
      "Grapefruit juice (may increase bioavailability)",
      "Diltiazem (increases amlodipine exposure)"
    ],
    contraindicationsPrecautions: [
      "Severe hypotension or cardiogenic shock",
      "Severe aortic stenosis",
      "Hepatic impairment (start at 2.5 mg daily)",
      "Heart failure (monitor closely)"
    ],
    counsellingPoints: [
      "Take regularly every day even when blood pressure feels normal.",
      "Report troublesome ankle or lower leg swelling to your pharmacist or doctor.",
      "Avoid sudden posture changes if feeling lightheaded when standing.",
      "Do not double the next dose if a daily dose is missed."
    ],
    antidote: undefined // No specific antidote; IV Calcium Gluconate / Vasopressors used for severe overdose
  },
  {
    id: "metformin",
    genericName: "Metformin Hydrochloride",
    brandNames: ["Glucophage", "Metfor", "Diabex"],
    drugClass: "Biguanide Antidiabetic Agent",
    mechanismOfAction: "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.",
    mainIndications: [
      "Type 2 Diabetes Mellitus",
      "Polycystic Ovary Syndrome (PCOS - off-label)",
      "Prediabetes / Insulin Resistance"
    ],
    commonStrengths: ["500 mg", "850 mg", "1000 mg"],
    dosageForms: ["Oral Immediate-Release Tablet", "Extended-Release (XR) Tablet"],
    administration: "Take with or immediately after meals to reduce GI adverse effects.",
    commonSideEffects: [
      "Nausea & abdominal cramping",
      "Diarrhoea & flatulence",
      "Metallic taste in mouth",
      "Vitamin B12 deficiency (long-term use)"
    ],
    keyInteractions: [
      "Iodinated Radiocontrast Media (hold 48h before/after procedure due to acute renal risk)",
      "Alcohol (increased risk of lactic acidosis)",
      "Cimetidine (increases metformin concentrations)",
      "Diuretics & NSAIDs (monitor renal function)"
    ],
    contraindicationsPrecautions: [
      "Severe renal impairment (eGFR < 30 mL/min/1.73m²)",
      "Acute or chronic metabolic acidosis / Lactic acidosis risk",
      "Severe hepatic impairment or severe hypoxemia",
      "Acute dehydration or severe infection"
    ],
    counsellingPoints: [
      "Take with meals to minimise stomach upset.",
      "Swallow extended-release (XR) tablets whole; do not crush or chew.",
      "Avoid heavy alcohol intake while taking metformin.",
      "Seek urgent medical attention if experiencing severe fatigue, muscle pain, or difficulty breathing."
    ],
    antidote: undefined // Haemodialysis used to clear metformin in lactic acidosis
  },
  {
    id: "paracetamol",
    genericName: "Paracetamol (Acetaminophen)",
    brandNames: ["Panadol", "Tylenol", "Calpol"],
    drugClass: "Analgesic and Antipyretic Agent",
    mechanismOfAction: "Inhibits central prostaglandin synthesis via COX enzyme inhibition and acts on central serotonergic pathways to raise pain threshold and reduce fever.",
    mainIndications: [
      "Mild to Moderate Pain",
      "Pyrexia (Fever) Reduction",
      "Osteoarthritis Pain Management"
    ],
    commonStrengths: ["120 mg/5 mL", "250 mg/5 mL", "500 mg", "650 mg", "1000 mg"],
    dosageForms: ["Oral Tablet", "Syrup/Suspension", "Suppository", "IV Infusion"],
    administration: "Every 4 to 6 hours as needed. Maximum adult daily dose is 4,000 mg (4 g).",
    commonSideEffects: [
      "Nausea (rare at therapeutic doses)",
      "Hepatotoxicity (at toxic overdose levels)",
      "Hypersensitivity rash (very rare)"
    ],
    keyInteractions: [
      "Warfarin (chronic high-dose paracetamol increases INR)",
      "Flucloxacillin (risk of high anion gap metabolic acidosis)",
      "Enzyme inducers (Rifampicin, Carbamazepine - increase toxic metabolite NAPQI)"
    ],
    contraindicationsPrecautions: [
      "Severe hepatic impairment or active liver failure",
      "Chronic alcoholism or malnutrition",
      "Do not combine with other paracetamol-containing combination products"
    ],
    counsellingPoints: [
      "Do not exceed 8 x 500 mg tablets in 24 hours.",
      "Check ingredients of cold and flu products to prevent accidental overdose.",
      "Keep out of reach of children and measure liquid doses accurately with a syringe."
    ],
    antidote: "N-acetylcysteine (NAC)" // Specific antidote available!
  },
  {
    id: "atorvastatin",
    genericName: "Atorvastatin Calcium",
    brandNames: ["Lipitor", "Atorva", "Lipvas"],
    drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
    mechanismOfAction: "Competitively inhibits 3-hydroxy-3-methylglutaryl-coenzyme A (HMG-CoA) reductase, preventing conversion to mevalonate and upregulating hepatic LDL receptors.",
    mainIndications: [
      "Hypercholesterolaemia & Mixed Dyslipidaemia",
      "Primary & Secondary Cardiovascular Disease Prevention",
      "Acute Coronary Syndrome Management"
    ],
    commonStrengths: ["10 mg", "20 mg", "40 mg", "80 mg"],
    dosageForms: ["Oral Tablet"],
    administration: "Taken once daily at any time of day, with or without food.",
    commonSideEffects: [
      "Myalgia & muscle discomfort",
      "Elevated hepatic transaminases",
      "Dyspepsia & constipation",
      "Headache"
    ],
    keyInteractions: [
      "Clarithromycin / Erythromycin (significantly increases statin toxicity)",
      "Grapefruit juice (> 1.2 litres daily increases statin plasma levels)",
      "Cyclosporine & Gemfibrozil (increased risk of rhabdomyolysis)"
    ],
    contraindicationsPrecautions: [
      "Active liver disease or unexplained persistent transaminase elevations",
      "Pregnancy and breastfeeding (Category X)",
      "Unexplained muscle pain or weakness (check CK levels)"
    ],
    counsellingPoints: [
      "Report unexplained muscle pain, tenderness, or weakness immediately.",
      "Avoid excessive grapefruit juice intake while taking atorvastatin.",
      "Maintain a heart-healthy diet alongside medication."
    ],
    antidote: undefined
  },
  {
    id: "amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    brandNames: ["Amoxil", "Mox", "Moxypen"],
    drugClass: "Moderate-Spectrum Aminopenicillin Antibiotic",
    mechanismOfAction: "Binds to penicillin-binding proteins (PBPs) in bacterial cell walls, inhibiting transpeptidation and causing cell wall autolysis and bacterial lysis.",
    mainIndications: [
      "Acute Otitis Media & Sinusitis",
      "Community-Acquired Pneumonia",
      "Streptococcal Pharyngitis / Tonsillitis",
      "Helicobacter pylori Eradication"
    ],
    commonStrengths: ["125 mg/5 mL", "250 mg", "500 mg", "875 mg"],
    dosageForms: ["Oral Capsule", "Oral Suspension", "Dispersible Tablet"],
    administration: "Taken every 8 hours (or 12 hours depending on dose), with or without food.",
    commonSideEffects: [
      "Diarrhoea & loose stools",
      "Nausea & vomiting",
      "Maculopapular skin rash",
      "Oral/vaginal candidiasis"
    ],
    keyInteractions: [
      "Allopurinol (substantially increases frequency of skin rash)",
      "Oral Anticoagulants / Warfarin (may increase prothrombin time)",
      "Methotrexate (decreases methotrexate clearance)"
    ],
    contraindicationsPrecautions: [
      "History of severe hypersensitivity / anaphylaxis to Penicillins or Beta-lactams",
      "Infectious Mononucleosis (glandular fever - high risk of non-allergic rash)",
      "Renal impairment (adjust dosage interval)"
    ],
    counsellingPoints: [
      "Complete the entire prescribed course even if symptoms resolve earlier.",
      "Shake liquid suspensions thoroughly before measuring each dose.",
      "Store reconstituted liquid in refrigerator and discard unused portion after 14 days."
    ],
    antidote: undefined
  }
];
