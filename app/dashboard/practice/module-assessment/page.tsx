import { ModuleAssessmentActivity } from "@/components/student/practice/ModuleAssessmentActivity";
import { getQuestionsByModule, DEFAULT_MODULE_ID } from "@/data/moduleQuestions";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Module Assessment — IMHS Practice Hub",
  description: "True/False module assessment — test your pharmacology knowledge.",
};

interface Props {
  searchParams?: Promise<{ moduleId?: string }>;
}

export default async function ModuleAssessmentPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const moduleId = params.moduleId || DEFAULT_MODULE_ID;
  const questions = getQuestionsByModule(moduleId);
  if (!questions.length) notFound();

  const moduleTitle =
    moduleId === "pharmacology-01" ? "Pharmacology Module 01" : `Module ${moduleId}`;

  return (
    <ModuleAssessmentActivity
      questions={questions}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
    />
  );
}
