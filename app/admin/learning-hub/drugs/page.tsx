import React from "react";
import { getDrugKnowledgeList } from "@/actions/drug-actions";
import { DrugKnowledgeEditor } from "@/components/admin/DrugKnowledgeEditor";
import { DRUGS } from "@/data/drugs";

export const metadata = {
  title: "Drug Knowledge Base Manager — Admin CMS",
};

export default async function AdminDrugsPage() {
  const dbDrugs = await getDrugKnowledgeList();
  const initialDrugs = dbDrugs.length > 0 ? dbDrugs : (DRUGS as any);

  return <DrugKnowledgeEditor initialDrugs={initialDrugs} />;
}
