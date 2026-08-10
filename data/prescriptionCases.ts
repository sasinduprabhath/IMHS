import { PrescriptionCase } from "@/types/pharmacology";

export const SAMPLE_PRESCRIPTION_CASES: PrescriptionCase[] = [
  {
    id: "case-01-amlodipine-dosing",
    title: "Case 01: Hypertensive Elderly Patient (Dosing Audit)",
    imageUrl: "/prescriptions/case-01-prescription.svg",
    patient: {
      name: "Mrs. K. L. Gunawardena",
      age: 72,
      sex: "Female",
      date: "14/08/2026",
      weightKg: 58,
      diagnosis: "Essential Hypertension & Mild Ankle Swelling"
    },
    medicines: [
      {
        id: "m1",
        name: "Amlodipine Besylate",
        strength: "20 mg",
        dose: "1 tablet",
        frequency: "Once daily (Morning)",
        duration: "30 Days"
      },
      {
        id: "m2",
        name: "Losartan Potassium",
        strength: "50 mg",
        dose: "1 tablet",
        frequency: "Once daily (Morning)",
        duration: "30 Days"
      }
    ],
    hasProblem: true,
    problemCategory: "Dosing Error",
    problemDescription: "Amlodipine prescribed at 20 mg daily exceeds the maximum recommended daily dose (10 mg/day). High dose significantly increases risk of severe peripheral oedema and reflex tachycardia.",
    problemOptions: [
      "Subtherapeutic dose of Amlodipine",
      "Amlodipine dose (20 mg daily) exceeds maximum recommended daily limit of 10 mg",
      "Severe drug interaction between Amlodipine and Losartan",
      "Incorrect patient age stated on prescription",
      "Incomplete prescription missing duration"
    ],
    expectedAction: "do_not_dispense",
    actionReason: "Hold dispensing and contact the prescribing physician immediately to recommend reducing Amlodipine to 5 mg or 10 mg once daily.",
    expectedCounsellingPoints: [
      "Explain to patient that prescription is being verified with doctor regarding dose optimization.",
      "Advise patient to continue monitoring blood pressure regularly at home.",
      "Educate patient on recognizing signs of lower leg/ankle swelling.",
      "Reinforce daily morning administration with water."
    ]
  },
  {
    id: "case-02-metformin-contraindication",
    title: "Case 02: Type 2 Diabetic with Advanced Renal Impairment",
    imageUrl: "/prescriptions/case-02-prescription.svg",
    patient: {
      name: "Mr. S. Perera",
      age: 68,
      sex: "Male",
      date: "14/08/2026",
      weightKg: 72,
      diagnosis: "T2DM with CKD Stage 4 (eGFR 22 mL/min)"
    },
    medicines: [
      {
        id: "m1",
        name: "Metformin HCl (Glucophage)",
        strength: "1000 mg",
        dose: "1 tablet",
        frequency: "Twice daily with meals",
        duration: "30 Days"
      },
      {
        id: "m2",
        name: "Linagliptin",
        strength: "5 mg",
        dose: "1 tablet",
        frequency: "Once daily",
        duration: "30 Days"
      }
    ],
    hasProblem: true,
    problemCategory: "Contraindication",
    problemDescription: "Metformin is strictly contraindicated in patients with eGFR < 30 mL/min/1.73m² due to high risk of fatal Lactic Acidosis.",
    problemOptions: [
      "Metformin is contraindicated due to eGFR < 30 mL/min (Risk of Lactic Acidosis)",
      "Linagliptin dose is too high for renal function",
      "Metformin should be taken on an empty stomach",
      "Patient age requires pediatric dosage formulation",
      "Prescription is expired by more than 1 year"
    ],
    expectedAction: "do_not_dispense",
    actionReason: "Do not dispense Metformin. Contact doctor to discontinue Metformin and consider alternative renal-safe glycemic agents (e.g. Linagliptin mono or Insulin).",
    expectedCounsellingPoints: [
      "Inform patient that metformin requires doctor review due to recent kidney function blood results.",
      "Advise patient not to start metformin until consulting their nephrologist/physician.",
      "Educate on symptoms of lactic acidosis (deep rapid breathing, muscle aches, extreme fatigue).",
      "Ensure patient maintains adequate hydration."
    ]
  },
  {
    id: "case-03-valid-paracetamol",
    title: "Case 03: Post-Operative Mild Pain Relief (Valid Prescription)",
    imageUrl: "/prescriptions/case-03-prescription.svg",
    patient: {
      name: "Miss N. Fernando",
      age: 29,
      sex: "Female",
      date: "14/08/2026",
      weightKg: 54,
      diagnosis: "Post Dental Extraction Pain"
    },
    medicines: [
      {
        id: "m1",
        name: "Paracetamol",
        strength: "500 mg",
        dose: "2 tablets (1000 mg)",
        frequency: "Every 6 hours as needed for pain",
        duration: "5 Days"
      },
      {
        id: "m2",
        name: "Amoxicillin",
        strength: "500 mg",
        dose: "1 capsule",
        frequency: "Every 8 hours",
        duration: "5 Days"
      }
    ],
    hasProblem: false,
    problemCategory: "None",
    problemDescription: "Prescription is clinically appropriate and within standard therapeutic parameters.",
    problemOptions: [
      "Paracetamol dose exceeds maximum daily limit",
      "Amoxicillin duration is dangerously long",
      "Severe allergy interaction between Paracetamol and Amoxicillin",
      "No clinical problem identified - Prescription is valid"
    ],
    expectedAction: "dispense",
    actionReason: "Dispense prescription as written. Verify patient has no known penicillin allergies before dispensing Amoxicillin.",
    expectedCounsellingPoints: [
      "Take 2 paracetamol tablets every 6 hours only as needed for pain.",
      "Do not exceed 8 paracetamol tablets (4,000 mg) in 24 hours.",
      "Complete the full 5-day course of Amoxicillin antibiotics every 8 hours even if pain subsides.",
      "Check other over-the-counter cough/cold products to ensure they do not contain paracetamol."
    ]
  }
];
