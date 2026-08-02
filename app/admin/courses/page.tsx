import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  BookOpen, Plus, Edit3, Eye, FileText, CheckCircle2, XCircle,
  Users, Layers, ArrowRight, ShieldCheck, Sparkles
} from "lucide-react";

export const metadata = {
  title: "Course Manager — IMHS Admin",
};

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalLessons = courses.reduce(
    (acc, c) => acc + c.chapters.reduce((s, ch) => s + ch.lessons.length, 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-5">
        <div>
          <span className="font-mono text-xs text-chart-red uppercase font-semibold tracking-wider">
            CURRICULUM MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink mt-0.5">
            Course Manager & Syllabus Builder
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Manage course publishing status, video module links, PDF downloads, and pricing.
          </p>
        </div>

        <Link href="/admin/courses/new">
          <Button className="gap-2 font-semibold text-xs bg-chart-red hover:bg-chart-red-hover text-white border-0 shadow-md">
            <Plus className="w-4 h-4" /> Create New Course
          </Button>
        </Link>
      </div>

      {/* ── Overview Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-chart-grid rounded-card p-4 flex items-center gap-3 shadow-paper">
          <div className="w-9 h-9 bg-clinical-teal/10 border border-clinical-teal/20 rounded flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-clinical-teal" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-ink">{courses.length}</div>
            <div className="text-[10px] font-mono text-sage uppercase">Total Courses</div>
          </div>
        </div>

        <div className="bg-surface border border-chart-grid rounded-card p-4 flex items-center gap-3 shadow-paper">
          <div className="w-9 h-9 bg-clinical-teal/10 border border-clinical-teal/20 rounded flex items-center justify-center">
            <Layers className="w-4 h-4 text-clinical-teal" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-ink">{totalLessons}</div>
            <div className="text-[10px] font-mono text-sage uppercase">Video & Case Lessons</div>
          </div>
        </div>

        <div className="bg-surface border border-chart-grid rounded-card p-4 flex items-center gap-3 shadow-paper">
          <div className="w-9 h-9 bg-clinical-teal/10 border border-clinical-teal/20 rounded flex items-center justify-center">
            <Users className="w-4 h-4 text-clinical-teal" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-ink">
              {courses.reduce((acc, c) => acc + c._count.enrollments, 0)}
            </div>
            <div className="text-[10px] font-mono text-sage uppercase">Total Active Enrollments</div>
          </div>
        </div>
      </div>

      {/* ── Courses Table ── */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-chart-grid bg-linen/50 text-sage uppercase font-mono text-[10px]">
                <th className="p-4">Course Program & Code</th>
                <th className="p-4">Publishing Status</th>
                <th className="p-4">Enrollment Fee</th>
                <th className="p-4">Syllabus Structure</th>
                <th className="p-4">Enrolled Students</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chart-grid/60">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sage font-mono space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto text-sage/50" />
                    <div>No courses created yet. Click &ldquo;Create New Course&rdquo; above.</div>
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const lessonsCount = course.chapters.reduce(
                    (acc, ch) => acc + ch.lessons.length,
                    0
                  );
                  const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();

                  return (
                    <tr key={course.id} className="hover:bg-linen/30 transition-colors group">
                      <td className="p-4 font-semibold text-ink">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/20 px-2 py-0.5 rounded font-bold">
                            {courseCode}
                          </span>
                          <span className="truncate max-w-xs text-sm">{course.title}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {course.published ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-green-600" /> Published Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-chart-red/10 text-chart-red border border-chart-red/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                            <XCircle className="w-3 h-3 text-chart-red" /> Draft Mode
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-clinical-teal text-sm">
                        {formatCurrency(course.price)}
                      </td>

                      <td className="p-4 font-mono text-ink-muted">
                        <span className="font-bold text-ink">{course.chapters.length}</span> chapters · <span className="font-bold text-ink">{lessonsCount}</span> lessons
                      </td>

                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5 text-ink font-bold">
                          <Users className="w-3.5 h-3.5 text-sage" />
                          <span>{course._count.enrollments}</span>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Button size="sm" className="h-7 px-2.5 text-[11px] gap-1 font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0">
                              <Edit3 className="w-3 h-3" /> Syllabus Builder
                            </Button>
                          </Link>

                          <Link href={`/courses/${course.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1 text-sage">
                              <Eye className="w-3 h-3" /> Preview
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
