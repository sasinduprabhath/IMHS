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
  isPublished?: boolean;
}

/**
 * Fetch questions assigned to a specific course.
 * If includeUnpublished is false (default for students), only active/published questions are returned.
 * If 0 questions assigned in DB, returns empty array ([]).
 */
export async function getCourseAssessmentQuestions(courseId: string, includeUnpublished = false) {
  try {
    const cleanCourseId = sanitizeIdentifier(courseId, 100);
    const whereClause: any = { courseId: cleanCourseId };
    if (!includeUnpublished) {
      whereClause.isPublished = true;
    }

    let dbQuestions: any[] = [];
    try {
      dbQuestions = await prisma.moduleAssessmentQuestion.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        select: { id: true, question: true, isTrue: true, explanation: true, isPublished: true },
      });
    } catch (queryErr: any) {
      console.warn("isPublished not recognized in Prisma client or DB, falling back:", queryErr?.message);
      dbQuestions = await prisma.moduleAssessmentQuestion.findMany({
        where: { courseId: cleanCourseId },
        orderBy: { createdAt: "asc" },
        select: { id: true, question: true, isTrue: true, explanation: true },
      });
    }

    if (dbQuestions && dbQuestions.length > 0) {
      return dbQuestions.map((q) => ({
        id: q.id,
        moduleId: cleanCourseId,
        statement: q.question,
        answer: Boolean(q.isTrue),
        explanation: q.explanation || undefined,
        topic: "Course Assessment",
        isPublished: q.isPublished !== undefined ? Boolean(q.isPublished) : true,
      }));
    }

    // No questions configured in DB for this course
    return [];
  } catch (error) {
    console.error("Error fetching course assessment questions:", error);
    return [];
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
    isPublished: true,
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
  questions: Array<{ moduleId?: string; question: string; isTrue: boolean; explanation?: string; isPublished?: boolean }>
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
        isPublished: q.isPublished !== false,
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
    const MAX_COURSE_QUESTIONS = 200;
    const targetQuestions = (questions || []).slice(0, MAX_COURSE_QUESTIONS);

    // Delete existing questions for this course
    await prisma.moduleAssessmentQuestion.deleteMany({
      where: { courseId: cleanCourseId },
    });

    if (targetQuestions.length === 0) {
      return { success: true, count: 0 };
    }

    let created;
    try {
      created = await prisma.moduleAssessmentQuestion.createMany({
        data: targetQuestions.map((q) => ({
          courseId: cleanCourseId,
          question: sanitizeString(q.question, 2000),
          isTrue: Boolean(q.isTrue),
          explanation: q.explanation ? sanitizeString(q.explanation, 2000) : null,
          isPublished: q.isPublished !== false,
        })),
      });
    } catch (saveErr: any) {
      if (saveErr?.message?.includes("isPublished") || saveErr?.name === "PrismaClientValidationError") {
        console.warn("isPublished not supported in DB/client, saving without it:", saveErr?.message);
        created = await prisma.moduleAssessmentQuestion.createMany({
          data: targetQuestions.map((q) => ({
            courseId: cleanCourseId,
            question: sanitizeString(q.question, 2000),
            isTrue: Boolean(q.isTrue),
            explanation: q.explanation ? sanitizeString(q.explanation, 2000) : null,
          })),
        });
      } else {
        throw saveErr;
      }
    }

    return { success: true, count: created.count };
  } catch (error: any) {
    console.error("Error saving course assessment questions:", error);
    throw new Error("Failed to save course assessment questions: " + (error.message || ""));
  }
}

/**
 * Admin Action: Quick 1-click toggle publication status of an existing question in DB
 */
export async function toggleCourseQuestionPublish(questionId: string, isPublished: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const cleanId = sanitizeIdentifier(questionId, 100);
    const updated = await prisma.moduleAssessmentQuestion.update({
      where: { id: cleanId },
      data: { isPublished: Boolean(isPublished) },
    });
    return { success: true, isPublished: updated.isPublished };
  } catch (error: any) {
    console.error("Error toggling question publish status:", error);
    if (error?.message?.includes("isPublished") || error?.name === "PrismaClientValidationError") {
      throw new Error("Database schema needs update. Please run 'npx prisma db push' on the server.");
    }
    throw new Error("Failed to update question status: " + (error.message || ""));
  }
}

/**
 * Admin Action: Quick bulk publish or disable all questions for a course in DB
 */
export async function setAllCourseQuestionsPublish(courseId: string, isPublished: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const cleanCourseId = sanitizeIdentifier(courseId, 100);
    const result = await prisma.moduleAssessmentQuestion.updateMany({
      where: { courseId: cleanCourseId },
      data: { isPublished: Boolean(isPublished) },
    });
    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Error setting all questions publish status:", error);
    if (error?.message?.includes("isPublished") || error?.name === "PrismaClientValidationError") {
      throw new Error("Database schema needs update. Please run 'npx prisma db push' on the server.");
    }
    throw new Error("Failed to update questions: " + (error.message || ""));
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
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    await prisma.studentActivityLog.create({
      data: {
        studentId: userId,
        activityType: "COURSE_ASSESSMENT",
        referenceId: course?.title || courseId,
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

/**
 * Admin Action: Fetch all student assessment results for a specific course.
 */
export async function getCourseAssessmentResults(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const cleanCourseId = sanitizeIdentifier(courseId, 100);
    const results = await prisma.courseAssessmentResult.findMany({
      where: { courseId: cleanCourseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    return results;
  } catch (error: any) {
    console.error("Error fetching course assessment results:", error);
    return [];
  }
}

/**
 * Admin Action: Reset / Delete an assessment result so a student can retake the exam.
 */
export async function deleteCourseAssessmentResult(resultId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  try {
    await prisma.courseAssessmentResult.delete({
      where: { id: resultId },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting course assessment result:", error);
    return { success: false, error: error.message || "Failed to reset assessment result." };
  }
}

/**
 * Admin Action: Fetch all student assessment results across all courses for the platform-wide view.
 */
export async function getAllPlatformAssessmentResults(filterCourseId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    const where: any = {};
    if (filterCourseId && filterCourseId !== "all") {
      where.courseId = filterCourseId;
    }

    const results = await prisma.courseAssessmentResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    return results;
  } catch (error: any) {
    console.error("Error fetching all platform assessment results:", error);
    return [];
  }
}

