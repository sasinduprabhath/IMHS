"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  Edit3,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Sparkles,
  GraduationCap,
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  published: boolean;
  chapters: { lessons: { id: string; type?: string; title?: string }[] }[];
  _count: { enrollments: number; assessmentResults?: number };
}

const ITEMS_PER_PAGE = 10;

export function AdminCoursesClient({ initialCourses }: { initialCourses: CourseItem[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && c.published) ||
      (statusFilter === "DRAFT" && !c.published);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const totalLessons = courses.reduce(
    (acc, c) => acc + c.chapters.reduce((s, ch) => s + ch.lessons.length, 0),
    0
  );

  const totalEnrollments = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);

  return (
    <div className="space-y-6 max-w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-[#F16726] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest inline-block">
            Curriculum Management
          </span>
          <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
            Course Programs &amp; Syllabus Manager
          </h1>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Manage course publishing states, video lecture streaming, module structure, and pricing.
          </p>
        </div>

        <Link href="/admin/courses/new" className="shrink-0">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-xs text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:opacity-95 min-h-[42px]"
            style={{
              background: "linear-gradient(135deg, #F16726 0%, #D95316 100%)",
              boxShadow: "0 4px 14px rgba(241,103,38,.28)",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </Link>
      </div>

      {/* ── Overview Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#0E57A4]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{courses.length}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Total Programs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{totalLessons}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Curriculum Lessons</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all">
          <div className="w-11 h-11 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#F16726]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{totalEnrollments}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Total Active Students</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Ribbon ── */}
      <div className="bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, code, or topic..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[40px] font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: `All (${courses.length})` },
            { id: "PUBLISHED", label: `Live (${courses.filter((c) => c.published).length})` },
            { id: "DRAFT", label: `Draft (${courses.filter((c) => !c.published).length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setStatusFilter(f.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap min-h-[36px] ${
                statusFilter === f.id
                  ? "bg-[#0E57A4] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Courses Container ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* 📱 Mobile Card View (screens < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedCourses.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-mono space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs">No courses matched &ldquo;{search}&rdquo;.</div>
            </div>
          ) : (
            paginatedCourses.map((course) => {
              const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();
              const allItems = course.chapters.flatMap((ch) => ch.lessons);
              const qCount = allItems.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
              const lCount = allItems.length - qCount;

              return (
                <div
                  key={course.id}
                  className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/60 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {course.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {course.published ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" /> Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/70 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Tuition Fee</span>
                      <span className="font-bold text-[#0E57A4]">{formatCurrency(course.price)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Syllabus</span>
                      <span className="font-bold text-slate-800">
                        {course.chapters.length} ch &bull; {lCount} les
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Enrollments</span>
                      <span className="font-bold text-slate-800">{course._count.enrollments}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <Link href={`/admin/courses/${course.id}/edit`} className="flex-1 sm:flex-initial">
                      <Button size="sm" className="w-full h-8 text-[11px] gap-1 font-semibold bg-[#0E57A4] hover:bg-[#0A4482] text-white border-0 shadow-xs active:scale-[0.98] transition-all">
                        <Edit3 className="w-3 h-3" /> Syllabus Builder
                      </Button>
                    </Link>

                    <Link href={`/admin/courses/${course.id}/assessments`}>
                      <Button size="sm" variant="outline" className="h-8 px-3 text-[11px] gap-1.5 bg-blue-50 text-[#0E57A4] border-blue-200 hover:bg-[#0E57A4] hover:text-white hover:border-[#0E57A4] font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer">
                        <ClipboardList className="w-3 h-3" />
                        <span>Exam Qs</span>
                        {typeof course._count?.assessmentResults === "number" && course._count.assessmentResults > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-[#0E57A4] text-white px-1.5 py-0.5 rounded-full leading-none">
                            {course._count.assessmentResults}
                          </span>
                        )}
                      </Button>
                    </Link>

                    <Link href={`/courses/${course.slug}`} target="_blank">
                      <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px] gap-1 bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-xs active:scale-[0.98] transition-all">
                        <Eye className="w-3 h-3" /> Preview
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 💻 Desktop Table View (screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500 uppercase font-mono text-[10px]">
                <th className="py-3.5 px-4 pl-6 text-left w-auto min-w-[320px]">Course / Programme Name</th>
                <th className="py-3.5 px-3 text-left whitespace-nowrap w-36">Publishing Status</th>
                <th className="py-3.5 px-3 text-left whitespace-nowrap w-32">Tuition Fee</th>
                <th className="py-3.5 px-3 text-left whitespace-nowrap w-44">Syllabus Structure</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-28">Enrolled</th>
                <th className="py-3.5 px-4 pr-6 text-right whitespace-nowrap w-64">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-mono space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                    <div>No courses matched &ldquo;{search}&rdquo;.</div>
                  </td>
                </tr>
              ) : (
                paginatedCourses.map((course) => {
                  const allItems = course.chapters.flatMap((ch) => ch.lessons);
                  const questionsCount = allItems.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                  const lessonsCount = allItems.length - questionsCount;

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/70 transition-all duration-150 group"
                    >
                      <td className="py-4 px-4 pl-6 align-middle">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="text-sm font-sans font-bold text-slate-900 group-hover:text-[#0E57A4] hover:underline transition-colors leading-snug block"
                        >
                          {course.title}
                        </Link>
                      </td>

                      <td className="py-4 px-3 align-middle whitespace-nowrap">
                        {course.published ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Published Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold">
                            <XCircle className="w-3 h-3 text-rose-600 shrink-0" /> Draft Mode
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-3 align-middle whitespace-nowrap font-mono font-bold text-[#0E57A4] text-sm">
                        {formatCurrency(course.price)}
                      </td>

                      <td className="py-4 px-3 align-middle whitespace-nowrap font-mono text-slate-600">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900">{course.chapters.length}</span>{" "}
                          {course.chapters.length === 1 ? "chapter" : "chapters"} &bull;{" "}
                          <span className="font-bold text-slate-900">{lessonsCount}</span>{" "}
                          {lessonsCount === 1 ? "lesson" : "lessons"}
                        </div>
                        {questionsCount > 0 && (
                          <div className="font-bold text-[#0E57A4] text-[11px] mt-0.5">
                            + {questionsCount} practice questions
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-3 align-middle text-center whitespace-nowrap font-mono">
                        <div className="inline-flex items-center justify-center gap-1.5 text-slate-900 font-bold bg-slate-100/70 border border-slate-200/60 px-2.5 py-1 rounded-lg text-xs">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{course._count.enrollments}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 pr-6 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Button size="sm" className="h-8 px-2.5 text-[11px] gap-1 font-semibold bg-[#0E57A4] hover:bg-[#0A4482] text-white border-0 shadow-xs active:scale-[0.98] transition-all cursor-pointer">
                              <Edit3 className="w-3 h-3" /> Syllabus
                            </Button>
                          </Link>

                          <Link href={`/admin/courses/${course.id}/assessments`}>
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px] gap-1.5 bg-blue-50 text-[#0E57A4] border-blue-200 hover:bg-[#0E57A4] hover:text-white hover:border-[#0E57A4] font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer">
                              <ClipboardList className="w-3 h-3" />
                              <span>Exam Qs</span>
                              {typeof course._count?.assessmentResults === "number" && course._count.assessmentResults > 0 && (
                                <span className="text-[9px] font-mono font-bold bg-[#0E57A4] text-white px-1.5 py-0.5 rounded-full leading-none">
                                  {course._count.assessmentResults}
                                </span>
                              )}
                            </Button>
                          </Link>

                          <Link href={`/courses/${course.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-[11px] gap-1 bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-xs active:scale-[0.98] transition-all cursor-pointer">
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

        {/* ── Pagination Controls ── */}
        {filteredCourses.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="text-slate-500 text-[11px]">
              Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-slate-900">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredCourses.length)}
              </strong>{" "}
              of <strong className="text-slate-900">{filteredCourses.length}</strong> programs
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="h-8 w-8 p-0"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs shadow-2xs">
                Page {validPage} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
