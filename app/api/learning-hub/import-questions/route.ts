import { NextResponse } from "next/server";
import { bulkImportAssessmentQuestions } from "@/actions/assessment-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Invalid payload. Expected non-empty questions array." }, { status: 400 });
    }

    const formatted = questions.map((q: any) => ({
      moduleCode: String(q.moduleCode || "GEN-101").trim(),
      question: String(q.question || "").trim(),
      isTrue: String(q.isTrue).toLowerCase() === "true" || q.isTrue === true || String(q.isTrue) === "1",
      explanation: q.explanation ? String(q.explanation).trim() : undefined,
    })).filter((q) => q.question.length > 0);

    if (formatted.length === 0) {
      return NextResponse.json({ error: "No valid questions found after formatting." }, { status: 400 });
    }

    const result = await bulkImportAssessmentQuestions(formatted);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("API /api/learning-hub/import-questions error:", error);
    return NextResponse.json({ error: error.message || "Failed to import questions" }, { status: 500 });
  }
}
