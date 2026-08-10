import { DrugClassificationActivity } from "@/components/student/practice/DrugClassificationActivity";
import { DRUGS, DEFAULT_DRUG_ID, getDrugById } from "@/data/drugs";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Drug Classification Challenge — IMHS Practice Hub",
  description: "Identify and classify pharmacological properties of a medicine step-by-step.",
};

interface Props {
  searchParams?: Promise<{ drug?: string }>;
}

export default async function DrugClassificationPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const drugId = params.drug || DEFAULT_DRUG_ID;
  const drug = getDrugById(drugId);
  if (!drug) notFound();

  return <DrugClassificationActivity drug={drug} />;
}
