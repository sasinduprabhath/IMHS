import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ClipboardList, BookOpen, ChevronRight, HelpCircle, CheckCircle2, XCircle, ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Module Assessment Question Bank — IMHS Admin",
};

export const revalidate = 0;

export default async function AdminLearningHubAssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all courses
  const courses: any[] = await prisma.$queryRaw`
    SELECT id, title, slug, category, published FROM Course ORDER BY createdAt DESC
  `;

  // Count assigned questions per course
  const countsRaw: any[] = await prisma.$queryRaw`
    SELECT courseId, COUNT(*) as questionCount FROM ModuleAssessmentQuestion WHERE courseId IS NOT NULL GROUP BY courseId
  `;

  const countMap = new Map<string, number>();
  (countsRaw || []).forEach((row: any) => {
    countMap.set(row.courseId, Number(row.questionCount || 0));
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Learning Hub CMS
          </span>
          <span className="text-xs font-mono text-white/70">
            {courses.length} Active Courses
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
          Module Assessment Question Bank
        </h1>
        <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
          Manage 100-question assessment pools categorized by course. Select any course below to add, edit, bulk upload, or configure its End-of-Course True/False questions.
        </p>
      </div>

      {/* Course Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0E57A4]" />
            Select Course to Manage Assessment Questions
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500">
            Showing {courses.length} Courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const qCount = countMap.get(course.id) || 0;
            const isPublished = Boolean(course.published);

            return (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs hover:shadow-lg hover:border-[#0E57A4]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">
                      {course.category || "Pharmacy Program"}
                    </span>

                    {isPublished ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        <XCircle className="w-3 h-3 text-red-500" /> Draft
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-display font-bold text-slate-900 group-hover:text-[#0E57A4] transition-colors leading-snug">
                    {course.title}
                  </h3>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#0E57A4]" /> Assessment Pool:
                    </span>
                    <span className={`font-bold px-2.5 py-1 rounded-xl border ${
                      qCount > 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {qCount} / 100 Questions Assigned
                    </span>
                  </div>

                  <Link
                    href={`/admin/courses/${course.id}/assessments`}
                    className="w-full py-3 px-4 rounded-2xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                  >
                    <span>Manage Course Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
