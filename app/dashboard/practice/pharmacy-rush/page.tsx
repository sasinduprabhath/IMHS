import { PharmacyRushActivity } from "@/components/student/practice/PharmacyRushActivity";
import { getDrugById, DEFAULT_DRUG_ID } from "@/data/drugs";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Pharmacy Rush — IMHS Practice Hub",
  description: "Beat the clock: 10 rounds of pharmacology knowledge for one medicine.",
};

interface Props {
  searchParams?: Promise<{ drug?: string }>;
}

export default async function PharmacyRushPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const drugId = params.drug || DEFAULT_DRUG_ID;
  const drug = getDrugById(drugId);
  if (!drug) notFound();

  return <PharmacyRushActivity drug={drug} />;
}
