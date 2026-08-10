import { PrescriptionReviewActivity } from "@/components/student/practice/PrescriptionReviewActivity";
import { getPrescriptionCaseById, DEFAULT_CASE_ID } from "@/data/prescriptionCases";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Prescription Review Challenge — IMHS Practice Hub",
  description: "Review a prescription step-by-step and make an appropriate dispensing decision.",
};

interface Props {
  searchParams?: Promise<{ case?: string }>;
}

export default async function PrescriptionReviewPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const caseId = params.case || DEFAULT_CASE_ID;
  const prescriptionCase = getPrescriptionCaseById(caseId);
  if (!prescriptionCase) notFound();

  return <PrescriptionReviewActivity prescriptionCase={prescriptionCase} />;
}
