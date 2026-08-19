import { ModuleAssessmentActivity } from "@/components/student/practice/ModuleAssessmentActivity";
import { getCourseAssessmentQuestions } from "@/actions/assessment-actions";
import { getQuestionsByModule, DEFAULT_MODULE_ID } from "@/data/moduleQuestions";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Module Assessment - IMHS Practice Hub",
  description: "True/False module assessment - test your pharmacology knowledge.",
};

interface Props {
  searchParams?: Promise<{ moduleId?: string }>;
}

export default async function ModuleAssessmentPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const moduleId = params.moduleId || DEFAULT_MODULE_ID;

  let questions = await getCourseAssessmentQuestions(moduleId);
  if (!questions || questions.length === 0) {
    questions = getQuestionsByModule(moduleId);
  }
  if (!questions || !questions.length) notFound();

  const moduleTitle =
    moduleId === "pharmacology-01" ? "Pharmacology Module 01" : `Module ${moduleId}`;

  return (
    <ModuleAssessmentActivity
      questions={questions as any}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
    />
  );
}
