import type { PrescriptionCase } from "@/types/pharmacology";

// ─── IMHS Prescription Cases ─────────────────────────────────────────────────
// Activity 01: Prescription Review Challenge content.
// Real clinical cases + images to be authored by clinical staff.
// The UI is data-driven - replace these with real cases when available.

export const PRESCRIPTION_CASES: PrescriptionCase[] = [
  {
    id: "case-01",
    imageUrl: "/practice/prescriptions/case-01.png",
    patient: {
      name: "Kumari Perera",
      age: 58,
      sex: "Female",
      date: "2024-01-15",
    },
    medicines: [
      {
        name: "Amlodipine",
        strength: "10 mg",
        dose: "1 tablet",
        frequency: "Twice daily",
        duration: "30 days",
      },
      {
        name: "Metformin",
        strength: "500 mg",
        dose: "1 tablet",
        frequency: "Twice daily with meals",
        duration: "30 days",
      },
    ],
    hasProblem: true,
    problemOptions: [
      { id: "wrong-dose", label: "Wrong/excessive dose" },
      { id: "drug-interaction", label: "Drug interaction" },
      { id: "contraindication", label: "Contraindication" },
      { id: "incomplete-info", label: "Incomplete prescription information" },
      { id: "illegible", label: "Illegible/unclear writing" },
      { id: "duplicate", label: "Duplicate therapy" },
      { id: "other", label: "Other concern" },
    ],
    correctProblemIds: ["wrong-dose"],
    // Amlodipine 10 mg twice daily = 20 mg/day - exceeds maximum recommended dose (10 mg/day)
    expectedAction: "do_not_dispense",
    dispensingReason: "Amlodipine is prescribed at 10 mg TWICE daily (20 mg/day total), which exceeds the maximum recommended dose of 10 mg/day. Pharmacist should contact the prescriber for clarification before dispensing.",
    expectedCounsellingPoints: [
      "Take Amlodipine at the correct prescribed dose - do not take more than instructed",
      "Take Metformin with meals to reduce stomach upset",
      "Monitor blood pressure and blood glucose regularly",
      "Report ankle swelling or muscle cramping to your healthcare provider",
      "Do not stop any medicines without consulting your doctor",
      "Store medicines at room temperature away from moisture and heat",
    ],
  },
  {
    id: "case-02",
    imageUrl: "/practice/prescriptions/case-02.png",
    patient: {
      name: "Saman Rajapaksa",
      age: 42,
      sex: "Male",
      date: "2024-02-08",
    },
    medicines: [
      {
        name: "Amoxicillin",
        strength: "500 mg",
        dose: "1 capsule",
        frequency: "Three times daily",
        duration: "7 days",
      },
    ],
    hasProblem: false,
    expectedAction: "dispense",
    dispensingReason: "Prescription is complete, dose is within normal range (500 mg TDS for 7 days - standard for many bacterial infections). Safe to dispense.",
    expectedCounsellingPoints: [
      "Complete the full 7-day course even if you feel better",
      "Take with or without food",
      "Report any rash, difficulty breathing or swelling immediately - these could indicate an allergic reaction",
      "Do not share this medicine with others",
      "Store at room temperature away from moisture",
      "If you experience severe diarrhoea, contact your doctor",
    ],
  },
];

export function getPrescriptionCaseById(id: string): PrescriptionCase | undefined {
  return PRESCRIPTION_CASES.find((c) => c.id === id);
}

export const DEFAULT_CASE_ID = "case-01";
