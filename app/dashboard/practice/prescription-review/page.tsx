import { PrescriptionSideBySideWizard } from "@/components/hub/PrescriptionSideBySideWizard";
import { getPrescriptionCaseById as getDbCaseById } from "@/actions/prescription-actions";
import { getPrescriptionCaseById as getStaticCaseById, DEFAULT_CASE_ID } from "@/data/prescriptionCases";

export const metadata = {
  title: "Prescription Review Challenge — IMHS Practice Hub",
  description: "Side-by-side interactive prescription review wizard and dispensing decision tool.",
};

interface Props {
  searchParams?: Promise<{ case?: string }>;
}

export default async function PrescriptionReviewPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const caseId = params.case || DEFAULT_CASE_ID;

  let caseData: any = null;

  // 1. Try DB lookup first (for custom cases created by admin)
  if (caseId) {
    try {
      const dbCase = await getDbCaseById(caseId);
      if (dbCase) {
        const patient = (dbCase.patientDetails as any) || {};
        const medicines = Array.isArray(dbCase.medicineDetails) ? dbCase.medicineDetails : [];
        const counsellingPoints = Array.isArray(dbCase.counsellingPoints) ? dbCase.counsellingPoints : [];

        caseData = {
          id: dbCase.id,
          title: dbCase.title || "Prescription Case Review",
          imageUrl: dbCase.imageUrl || "/practice/prescriptions/case-01.png",
          groundTruth: {
            patientName: patient.name || "Patient",
            patientAge: patient.age || 58,
            patientGender: patient.sex || "Female",
            rxDate: patient.date || "2024-01-15",
            medicines: medicines.length > 0 ? medicines : [
              { name: "Amlodipine", strength: "10 mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days" }
            ],
            hasProblem: dbCase.hasProblem,
            shouldDispense: dbCase.shouldDispense,
            dispenseReason: dbCase.dispenseReason,
            counsellingPoints: counsellingPoints.length > 0 ? counsellingPoints : [
              "Take at prescribed dose only",
              "Take with meals",
              "Report side effects to doctor"
            ],
          },
        };
      }
    } catch (e) {
      console.error("DB case lookup failed:", e);
    }
  }

  // 2. Fallback to static seed data if not found in DB
  if (!caseData) {
    const staticCase = getStaticCaseById(caseId) || getStaticCaseById(DEFAULT_CASE_ID);
    if (staticCase) {
      caseData = {
        id: staticCase.id,
        title: `Case Review: ${staticCase.patient.name}`,
        imageUrl: staticCase.imageUrl,
        groundTruth: {
          patientName: staticCase.patient.name,
          patientAge: staticCase.patient.age,
          patientGender: staticCase.patient.sex,
          rxDate: staticCase.patient.date,
          medicines: staticCase.medicines,
          hasProblem: staticCase.hasProblem,
          shouldDispense: staticCase.expectedAction === "dispense",
          dispenseReason: staticCase.dispensingReason,
          counsellingPoints: staticCase.expectedCounsellingPoints,
        },
      };
    }
  }

  // Final emergency fallback to ensure page NEVER throws 404
  if (!caseData) {
    caseData = {
      id: "case-01",
      title: "Prescription Case Review #1",
      imageUrl: "/practice/prescriptions/case-01.png",
      groundTruth: {
        patientName: "Kumari Perera",
        patientAge: 58,
        patientGender: "Female",
        rxDate: "2024-01-15",
        medicines: [
          { name: "Amlodipine", strength: "10 mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days" }
        ],
        hasProblem: true,
        shouldDispense: false,
        dispenseReason: "Amlodipine 10 mg BD exceeds maximum recommended daily dose (10 mg/day).",
        counsellingPoints: ["Take at prescribed dose only", "Report side effects"],
      },
    };
  }

  return <PrescriptionSideBySideWizard caseData={caseData} />;
}
