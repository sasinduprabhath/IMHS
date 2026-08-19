import { PrescriptionSideBySideWizard } from "@/components/hub/PrescriptionSideBySideWizard";
import { PrescriptionCasePicker, PrescriptionCaseSummary } from "@/components/hub/PrescriptionCasePicker";
import { getPrescriptionCaseById as getDbCaseById, getPrescriptionCases } from "@/actions/prescription-actions";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Prescription Review Challenge — IMHS Practice Hub",
  description: "Side-by-side interactive prescription review wizard and dispensing decision tool.",
};

interface Props {
  searchParams?: Promise<{ case?: string }>;
}

export default async function PrescriptionReviewPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const caseParam = params.case;

  // 1. Fetch all real DB cases
  const dbCases = await getPrescriptionCases();

  if (!dbCases || dbCases.length === 0) {
    notFound();
  }

  // Create clean numbered case references (no answer spoilers)
  const caseSummaries: PrescriptionCaseSummary[] = dbCases.map((c: any, index: number) => ({
    id: c.id,
    caseNumber: index + 1,
    difficulty: "Standard" as const,
  }));

  // ── If no case is selected in URL, show Case Selection Lobby ────────────
  if (!caseParam) {
    return <PrescriptionCasePicker cases={caseSummaries} />;
  }

  // ── Resolve clean case param (e.g. "?case=1" -> 1st case, or by ID) ──────
  let targetId = caseParam;
  let caseIndex = 0;

  const parsedNumber = parseInt(caseParam, 10);
  if (!isNaN(parsedNumber) && parsedNumber >= 1 && parsedNumber <= caseSummaries.length) {
    targetId = caseSummaries[parsedNumber - 1].id;
    caseIndex = parsedNumber - 1;
  } else {
    const foundIndex = caseSummaries.findIndex((c) => c.id === caseParam);
    if (foundIndex >= 0) {
      caseIndex = foundIndex;
    }
  }

  // ── Load the real DB case data ──────────────────────────────────────────
  const dbCase = await getDbCaseById(targetId);
  if (!dbCase) {
    return <PrescriptionCasePicker cases={caseSummaries} />;
  }

  const patient = (dbCase.patientDetails as any) || {};
  const rawMedicines = Array.isArray(dbCase.medicineDetails) ? dbCase.medicineDetails : [];
  const medicines = rawMedicines.length > 0
    ? rawMedicines.map((m: any) => ({
        name: String(m.name || "Prescribed Drug"),
        strength: String(m.strength || "Standard Dose"),
        dose: String(m.dose || "1 tablet"),
        frequency: String(m.frequency || "Daily"),
        duration: String(m.duration || "30 days"),
      }))
    : [
        { name: "Prescribed Drug", strength: "Standard Dose", dose: "1 tablet", frequency: "Daily", duration: "30 days" }
      ];

  const rawCounselling = Array.isArray(dbCase.counsellingPoints) ? dbCase.counsellingPoints : [];
  const counsellingPoints = rawCounselling.length > 0
    ? rawCounselling.map((c: any) => String(c))
    : [
        "Take at prescribed dose only",
        "Take with meals",
        "Report side effects to doctor"
      ];

  const caseData = {
    id: String(caseIndex + 1),
    title: `Clinical Prescription Review #${caseIndex + 1}`,
    imageUrl: dbCase.imageUrl || "/practice/prescriptions/case-01.png",
    groundTruth: {
      patientName: patient.name || "Patient",
      patientAge: patient.age || 58,
      patientGender: patient.sex || "Female",
      rxDate: patient.date || "2024-01-15",
      medicines,
      hasProblem: Boolean(dbCase.hasProblem),
      shouldDispense: Boolean(dbCase.shouldDispense),
      dispenseReason: dbCase.dispenseReason || "",
      counsellingPoints,
    },
  };

  return <PrescriptionSideBySideWizard caseData={caseData} />;
}
