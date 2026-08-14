"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MODULE_QUESTIONS } from "@/data/moduleQuestions";

export interface CourseQuestionInput {
  id?: string;
  question: string;
  isTrue: boolean;
  explanation?: string;
}

/**
 * Fetch questions assigned to a specific course.
 * If 0 questions assigned in DB, returns default seed question pool.
 */
export async function getCourseAssessmentQuestions(courseId: string) {
  try {
    const dbQuestions: any[] = await prisma.$queryRaw`
      SELECT id, question, isTrue, explanation FROM ModuleAssessmentQuestion WHERE courseId = ${courseId} ORDER BY createdAt ASC
    `;

    if (dbQuestions && dbQuestions.length > 0) {
      return dbQuestions.map((q) => ({
        id: q.id,
        moduleId: courseId,
        statement: q.question,
        answer: Boolean(q.isTrue),
        explanation: q.explanation || undefined,
        topic: "Course Assessment",
      }));
    }

    // Fallback to default questions if course has no custom DB questions
    return MODULE_QUESTIONS.map((q) => ({
      id: q.id,
      moduleId: courseId,
      statement: q.statement,
      answer: q.answer,
      explanation: q.explanation,
      topic: q.topic || "General Pharmacology",
    }));
  } catch (error) {
    console.error("Error fetching course assessment questions:", error);
    return MODULE_QUESTIONS;
  }
}

/**
 * Legacy helper for general assessment questions
 */
export async function getAssessmentQuestions(moduleId?: string) {
  if (moduleId) {
    return getCourseAssessmentQuestions(moduleId);
  }
  return MODULE_QUESTIONS.map((q) => ({
    id: q.id,
    statement: q.statement,
    answer: q.answer,
    explanation: q.explanation,
    topic: q.topic || "General Pharmacology",
  }));
}

/**
 * Legacy helper for fetching modules
 */
export async function getModules() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: "asc" },
    });
    return modules;
  } catch {
    return [
      { id: "mod-01", code: "MOD-01", title: "Pharmacology Module 01" },
    ];
  }
}

/**
 * Legacy helper for bulk importing assessment questions
 */
export async function bulkImportAssessmentQuestions(
  questions: Array<{ moduleId?: string; question: string; isTrue: boolean; explanation?: string }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  try {
    for (const q of questions) {
      const qId = `maq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await prisma.$executeRaw`
        INSERT INTO ModuleAssessmentQuestion (id, question, isTrue, explanation, createdAt, updatedAt)
        VALUES (${qId}, ${q.question}, ${q.isTrue ? 1 : 0}, ${q.explanation || null}, NOW(), NOW())
      `;
    }
    return { success: true, count: questions.length };
  } catch (error: any) {
    console.error("Error bulk importing questions:", error);
    return { success: false, error: error.message || "Failed to import questions" };
  }
}

/**
 * Admin Action: Save / Assign questions to a course.
 */
export async function saveCourseAssessmentQuestions(
  courseId: string,
  questions: CourseQuestionInput[]
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const targetQuestions = questions.slice(0, 100);

    // Delete existing questions for this course
    await prisma.$executeRaw`DELETE FROM ModuleAssessmentQuestion WHERE courseId = ${courseId}`;

    if (targetQuestions.length === 0) {
      return { success: true, count: 0 };
    }

    // Build single bulk INSERT query for high performance and zero connection leaks
    const values: string[] = [];
    targetQuestions.forEach((q) => {
      const qId = q.id || `cqu_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const escapedQuestion = (q.question || "").replace(/'/g, "''").replace(/\\/g, "\\\\");
      const escapedExplanation = q.explanation
        ? `'${q.explanation.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`
        : "NULL";
      const isTrueVal = q.isTrue ? 1 : 0;
      values.push(
        `('${qId}', '${courseId}', '${escapedQuestion}', ${isTrueVal}, ${escapedExplanation}, NOW(), NOW())`
      );
    });

    const bulkSql = `
      INSERT INTO ModuleAssessmentQuestion (id, courseId, question, isTrue, explanation, createdAt, updatedAt)
      VALUES ${values.join(", ")}
    `;

    await prisma.$executeRawUnsafe(bulkSql);

    return { success: true, count: targetQuestions.length };
  } catch (error: any) {
    console.error("Error saving course assessment questions:", error);
    throw new Error("Failed to save course assessment questions: " + (error.message || ""));
  }
}

/**
 * Fetch a student's course assessment result if completed.
 */
export async function getCourseAssessmentResult(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  try {
    const results: any[] = await prisma.$queryRaw`
      SELECT * FROM CourseAssessmentResult WHERE userId = ${session.user.id} AND courseId = ${courseId} LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error fetching course assessment result:", error);
    return null;
  }
}

/**
 * Submit student assessment score for a course.
 */
export async function submitCourseAssessmentResult(
  courseId: string,
  score: number,
  maxScore: number
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = percentage >= 60;

  try {
    const resId = `car_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await prisma.$executeRaw`
      INSERT INTO CourseAssessmentResult (id, userId, courseId, score, maxScore, percentage, passed, completedAt)
      VALUES (${resId}, ${userId}, ${courseId}, ${score}, ${maxScore}, ${percentage}, ${passed ? 1 : 0}, NOW())
      ON DUPLICATE KEY UPDATE
        score = VALUES(score),
        maxScore = VALUES(maxScore),
        percentage = VALUES(percentage),
        passed = VALUES(passed),
        completedAt = NOW()
    `;

    // Also log activity in StudentActivityLog
    const logId = `sal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await prisma.$executeRaw`
      INSERT INTO StudentActivityLog (id, studentId, activityType, referenceId, score, maxScore, completedAt)
      VALUES (${logId}, ${userId}, 'COURSE_ASSESSMENT', ${courseId}, ${Math.round(percentage)}, 100, NOW())
    `;

    return { success: true, result: { score, maxScore, percentage, passed } };
  } catch (error: any) {
    console.error("Error submitting course assessment result:", error);
    throw new Error("Failed to save assessment result.");
  }
}
