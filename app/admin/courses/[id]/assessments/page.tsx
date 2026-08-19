import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseAssessmentEditor } from "@/components/admin/CourseAssessmentEditor";

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

  return (
    <div className="p-6">
      <CourseAssessmentEditor
        courseId={course.id}
        courseTitle={course.title}
        initialQuestions={formattedQuestions}
      />
    </div>
  );
}
