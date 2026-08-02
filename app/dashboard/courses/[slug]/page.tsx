import React from "react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoursePlayerClient } from "@/components/student/CoursePlayerClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return {
    title: course ? `${course.title} - Player` : "Course Player",
  };
}

export default async function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;
  const userId = session.user.id;

  // Fetch course details with chapters and lessons
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      announcements: {
        orderBy: { createdAt: "desc" },
      },
      instructors: {
        include: {
          facultyMember: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Security Check: Verify user has an ACTIVE Enrollment record for this course (unless ADMIN)
  if (session.user.role !== "ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (user?.status === "FROZEN") {
      redirect("/dashboard");
    }

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

  // Fetch completed lessons for this student
  const progressRecords = await prisma.lessonProgress.findMany({
    where: { userId },
    select: { lessonId: true },
  });

  const completedLessonIds = progressRecords.map((p) => p.lessonId);

  return (
    <CoursePlayerClient
      course={course}
      initialCompletedLessonIds={completedLessonIds}
    />
  );
}
