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

  const courses: any[] = await prisma.$queryRaw`
    SELECT id, title, slug FROM Course WHERE id = ${id} LIMIT 1
  `;

  if (!courses || courses.length === 0) {
    notFound();
  }

  const course = courses[0];

  const assessmentQuestions: any[] = await prisma.$queryRaw`
    SELECT id, question, isTrue, explanation FROM ModuleAssessmentQuestion WHERE courseId = ${course.id} ORDER BY createdAt ASC
  `;

  const formattedQuestions = (assessmentQuestions || []).map((q: any) => ({
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
