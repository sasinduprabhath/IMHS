import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseAssessmentHubClient } from "@/components/admin/CourseAssessmentHubClient";

export const revalidate = 0;

export default async function AdminCourseAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!course) {
    notFound();
  }

  // Fetch True/False questions for this course
  const assessmentQuestions = await prisma.moduleAssessmentQuestion.findMany({
    where: { courseId: course.id },
    select: { id: true, question: true, isTrue: true, explanation: true },
    orderBy: { createdAt: "asc" },
  });

  const formattedQuestions = assessmentQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    isTrue: Boolean(q.isTrue),
    explanation: q.explanation || "",
  }));

  // Fetch student exam results for this course
  const rawResults = await prisma.courseAssessmentResult.findMany({
    where: { courseId: course.id },
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

  const formattedResults = rawResults.map((r) => ({
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    score: r.score,
    maxScore: r.maxScore,
    percentage: r.percentage,
    passed: r.passed,
    completedAt: r.completedAt.toISOString(),
    user: {
      id: r.user.id,
      name: r.user.name,
      studentId: r.user.studentId,
      email: r.user.email,
      phone: r.user.phone,
    },
  }));

  return (
    <div className="p-6">
      <CourseAssessmentHubClient
        courseId={course.id}
        courseTitle={course.title}
        courseSlug={course.slug}
        initialQuestions={formattedQuestions}
        initialResults={formattedResults}
      />
    </div>
  );
}
