import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LearningHubAssessmentsClient } from "@/components/admin/LearningHubAssessmentsClient";

export const metadata = {
  title: "Examination & Assessment Hub - IMHS Admin",
};

export const revalidate = 0;

export default async function AdminLearningHubAssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all courses with their assessment questions and results counts
  const coursesData = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      published: true,
      _count: {
        select: {
          assessmentQuestions: true,
          assessmentResults: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courses = coursesData.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    category: c.category,
    published: c.published,
    questionCount: c._count.assessmentQuestions || 0,
    resultCount: c._count.assessmentResults || 0,
  }));

  // Fetch all completed student exam results across the academy
  const rawResults = await prisma.courseAssessmentResult.findMany({
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
    course: {
      id: r.course.id,
      title: r.course.title,
      slug: r.course.slug,
      category: r.course.category,
    },
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Learning Hub CMS
          </span>
          <span className="text-xs font-mono text-white/70">
            {courses.length} Active Courses · {formattedResults.length} Total Submissions
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Course Examination &amp; Assessment Hub
        </h1>
        <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
          Manage True/False exam question banks and monitor student exam performance across all academic courses.
        </p>
      </div>

      {/* Main Interactive Client Component */}
      <LearningHubAssessmentsClient
        courses={courses}
        initialResults={formattedResults}
      />
    </div>
  );
}
