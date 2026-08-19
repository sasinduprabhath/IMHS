"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MODULE_QUESTIONS } from "@/data/moduleQuestions";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";

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
    const cleanCourseId = sanitizeIdentifier(courseId, 100);
    const dbQuestions = await prisma.moduleAssessmentQuestion.findMany({
      where: { courseId: cleanCourseId },
      orderBy: { createdAt: "asc" },
      select: { id: true, question: true, isTrue: true, explanation: true },
    });

    if (dbQuestions && dbQuestions.length > 0) {
      return dbQuestions.map((q) => ({
        id: q.id,
        moduleId: cleanCourseId,
        statement: q.question,
        answer: Boolean(q.isTrue),
        explanation: q.explanation || undefined,
        topic: "Course Assessment",
      }));
    }

    // Fallback to default questions if course has no custom DB questions
    return MODULE_QUESTIONS.map((q) => ({
      id: q.id,
      moduleId: cleanCourseId,
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
    moduleId: "gen-assessment",
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
 * Helper for bulk importing assessment questions
 */
export async function bulkImportAssessmentQuestions(
  questions: Array<{ moduleId?: string; question: string; isTrue: boolean; explanation?: string }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  try {
    const result = await prisma.moduleAssessmentQuestion.createMany({
      data: questions.map((q) => ({
        moduleId: q.moduleId ? sanitizeIdentifier(q.moduleId, 100) : null,
        question: sanitizeString(q.question, 2000),
        isTrue: Boolean(q.isTrue),
        explanation: q.explanation ? sanitizeString(q.explanation, 2000) : null,
      })),
    });
    return { success: true, count: result.count };
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
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const cleanCourseId = sanitizeIdentifier(courseId, 100);
    const targetQuestions = (questions || []).slice(0, 100);

    // Delete existing questions for this course
    await prisma.moduleAssessmentQuestion.deleteMany({
      where: { courseId: cleanCourseId },
    });

    if (targetQuestions.length === 0) {
      return { success: true, count: 0 };
    }

    const created = await prisma.moduleAssessmentQuestion.createMany({
      data: targetQuestions.map((q) => ({
        courseId: cleanCourseId,
        question: sanitizeString(q.question, 2000),
        isTrue: Boolean(q.isTrue),
        explanation: q.explanation ? sanitizeString(q.explanation, 2000) : null,
      })),
    });

    return { success: true, count: created.count };
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
    const result = await prisma.courseAssessmentResult.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });
    return result;
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
  const numericScore = Number(score) || 0;
  const numericMaxScore = Number(maxScore) || 100;
  const percentage = numericMaxScore > 0 ? (numericScore / numericMaxScore) * 100 : 0;
  const passed = percentage >= 60;

  try {
    const assessmentResult = await prisma.courseAssessmentResult.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {
        score: numericScore,
        maxScore: numericMaxScore,
        percentage,
        passed,
        completedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        score: numericScore,
        maxScore: numericMaxScore,
        percentage,
        passed,
        completedAt: new Date(),
      },
    });

    // Also log activity in StudentActivityLog
    await prisma.studentActivityLog.create({
      data: {
        studentId: userId,
        activityType: "COURSE_ASSESSMENT",
        referenceId: courseId,
        score: Math.round(percentage),
        maxScore: 100,
      },
    });

    return { success: true, result: assessmentResult };
  } catch (error: any) {
    console.error("Error submitting course assessment result:", error);
    throw new Error("Failed to save assessment result.");
  }
}
