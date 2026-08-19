import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bulkImportAssessmentQuestions } from "@/actions/assessment-actions";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const importQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      moduleCode: z.string().max(50).optional().default("GEN-101"),
      question: z.string().min(1, "Question cannot be empty").max(2000, "Question too long"),
      isTrue: z.union([z.boolean(), z.string(), z.number()]),
      explanation: z.string().max(2000).optional().nullable(),
    })
  ).min(1, "At least one question is required").max(500, "Maximum 500 questions per import"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `csv_import:${session.user.id || clientIp}`,
      RATE_LIMITS.CSV_IMPORT.maxAttempts,
      RATE_LIMITS.CSV_IMPORT.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "CSV import rate limit reached. Please wait a few minutes.");
    }

    const body = await req.json();
    const parsed = importQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload format." }, { status: 400 });
    }

    const formatted = parsed.data.questions.map((q) => ({
      moduleCode: sanitizeIdentifier(q.moduleCode, 50) || "GEN-101",
      question: sanitizeString(q.question, 2000),
      isTrue: String(q.isTrue).toLowerCase() === "true" || q.isTrue === true || String(q.isTrue) === "1",
      explanation: q.explanation ? sanitizeString(q.explanation, 2000) : undefined,
    })).filter((q) => q.question.length > 0);

    if (formatted.length === 0) {
      return NextResponse.json({ error: "No valid questions found after sanitization." }, { status: 400 });
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
