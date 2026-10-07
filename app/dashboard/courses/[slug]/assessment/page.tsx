import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseAssessmentQuestions } from "@/actions/assessment-actions";
import { ModuleAssessmentActivity } from "@/components/student/practice/ModuleAssessmentActivity";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return {
    title: course ? `${course.title} - End-of-Course Assessment` : "End-of-Course Assessment",
  };
}

export default async function CourseAssessmentFullPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;
  const userId = session.user.id;

  // Fetch course with chapters and lessons
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      chapters: {
        include: {
          lessons: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  if (!course.published && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (!enrollment || enrollment.status === "FROZEN") {
      redirect("/dashboard");
    }
  }

  // Fetch questions assigned to this course
  const questions = await getCourseAssessmentQuestions(course.id);

  return (
    <div className="w-full space-y-6">
      <ModuleAssessmentActivity
        moduleId={course.id}
        moduleTitle={`${course.title} - End-of-Course Assessment`}
        questions={questions}
      />
    </div>
  );
}
