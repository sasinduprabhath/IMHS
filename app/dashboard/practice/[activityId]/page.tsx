import React from "react";
import { notFound } from "next/navigation";
import { PrescriptionReviewClient } from "@/components/student/practice/PrescriptionReviewClient";
import { DrugClassificationClient } from "@/components/student/practice/DrugClassificationClient";
import { ModuleAssessmentClient } from "@/components/student/practice/ModuleAssessmentClient";
import { PharmacyRushClient } from "@/components/student/practice/PharmacyRushClient";

export async function generateMetadata({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params;
  const titles: Record<string, string> = {
    "prescription-review": "Prescription Review Challenge — IMHS Practice Hub",
    "drug-classification": "Drug Classification Challenge — IMHS Practice Hub",
    "module-assessment": "Module Assessment Evaluation — IMHS Practice Hub",
    "pharmacy-rush": "IMHS Pharmacy Rush Game — IMHS Practice Hub",
  };

  return {
    title: titles[activityId] || "Interactive Activity — IMHS Learning Hub",
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = await params;

  if (activityId === "prescription-review") {
    return <PrescriptionReviewClient />;
  }

  if (activityId === "drug-classification") {
    return <DrugClassificationClient />;
  }

  if (activityId === "module-assessment") {
    return <ModuleAssessmentClient />;
  }

  if (activityId === "pharmacy-rush") {
    return <PharmacyRushClient />;
  }

  notFound();
}
