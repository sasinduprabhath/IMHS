"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Trophy,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Filter,
  Download,
  RotateCcw,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Users,
  Loader2,
} from "lucide-react";
import { deleteCourseAssessmentResult } from "@/actions/assessment-actions";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  questionCount: number;
  resultCount: number;
}

interface PlatformResultItem {
  id: string;
  userId: string;
  courseId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  user: {
    id: string;
    name: string;
    studentId: string | null;
    email: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
  };
}

interface LearningHubAssessmentsClientProps {
  courses: CourseItem[];
  initialResults: PlatformResultItem[];
}

export function LearningHubAssessmentsClient({
  courses,
  initialResults,
}: LearningHubAssessmentsClientProps) {
  const [activeTab, setActiveTab] = useState<"pools" | "results">("pools");
  const [results, setResults] = useState<PlatformResultItem[]>(initialResults);

  // Filters for results tab
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // KPI computations across all platform results
  const total = results.length;
  const passedCount = useMemo(() => results.filter((r) => r.passed).length, [results]);
  const failedCount = total - passedCount;
  const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const avgScore = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / total) : 0;

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (selectedCourseFilter !== "all" && r.courseId !== selectedCourseFilter) return false;
      if (statusFilter === "PASSED" && !r.passed) return false;
      if (statusFilter === "FAILED" && r.passed) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.user.name.toLowerCase().includes(q);
        const matchStudentId = (r.user.studentId || "").toLowerCase().includes(q);
        const matchEmail = r.user.email.toLowerCase().includes(q);
        const matchCourse = r.course.title.toLowerCase().includes(q);
        if (!matchName && !matchStudentId && !matchEmail && !matchCourse) return false;
      }

      return true;
    });
  }, [results, selectedCourseFilter, statusFilter, searchQuery]);

  // Reset / Retake
  const handleResetAttempt = async (result: PlatformResultItem) => {
    const studentLabel = result.user.studentId ? `${result.user.name} (${result.user.studentId})` : result.user.name;
    const confirmed = confirm(
      `Allow ${studentLabel} to retake the exam for "${result.course.title}"?\n\nThis will clear their score of ${result.score}/${result.maxScore} (${Math.round(result.percentage)}%).`
    );
    if (!confirmed) return;

    setResettingId(result.id);
    setActionNotice(null);
    try {
      const res = await deleteCourseAssessmentResult(result.id);
      if (res.success) {
        setResults((prev) => prev.filter((r) => r.id !== result.id));
        setActionNotice(`Exam attempt for ${studentLabel} on "${result.course.title}" was successfully reset.`);
        setTimeout(() => setActionNotice(null), 5000);
      } else {
        alert(res.error || "Failed to reset exam attempt.");
      }
    } catch {
      alert("Network error while resetting exam attempt.");
    } finally {
      setResettingId(null);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredResults.length === 0) return;

    const headers = ["Student ID", "Full Name", "Email", "Phone", "Course", "Score", "Max Score", "Percentage", "Status", "Date Completed"];
    const rows = filteredResults.map((r) => [
      `"${r.user.studentId || ""}"`,
      `"${r.user.name.replace(/"/g, '""')}"`,
      `"${r.user.email}"`,
      `"${r.user.phone}"`,
      `"${r.course.title.replace(/"/g, '""')}"`,
      r.score,
      r.maxScore,
      `${Math.round(r.percentage)}%`,
      r.passed ? "PASSED" : "FAILED",
      `"${new Date(r.completedAt).toLocaleString("en-GB")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `imhs_all_exam_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Tab Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pools")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "pools"
                ? "bg-[#0E57A4] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Course Question Banks</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === "pools" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}>
              {courses.length} Courses
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "results"
                ? "bg-[#0E57A4] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>All Exam Results</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === "results" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
            }`}>
              {results.length} Submissions
            </span>
          </button>
        </div>

        {activeTab === "results" && (
          <button
            type="button"
            onClick={exportToCSV}
            disabled={filteredResults.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export Filtered CSV
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: COURSE QUESTION POOLS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "pools" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0E57A4]" />
              Select Course to Manage Questions or View Results
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500">
              Showing {courses.length} Courses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const qCount = course.questionCount;
              const rCount = course.resultCount;
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
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Questions</span>
                        <span className={`font-bold ${qCount > 0 ? "text-[#0E57A4]" : "text-amber-600"}`}>
                          {qCount} / 100 Qs
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block uppercase font-bold">Exam Results</span>
                        <span className={`font-bold ${rCount > 0 ? "text-emerald-700" : "text-slate-500"}`}>
                          {rCount} Submissions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/courses/${course.id}/assessments`}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Manage Qs</span>
                      </Link>

                      <Link
                        href={`/admin/courses/${course.id}/assessments?tab=results`}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                          rCount > 0
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 font-bold"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>View Results ({rCount})</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: ALL PLATFORM EXAM RESULTS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "results" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-[#0E57A4] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Attempts</p>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-0.5">
                  {total} <span className="text-xs font-mono font-normal text-slate-400">students</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Platform Pass Rate</p>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-emerald-600 mt-0.5">
                  {passRate}%{" "}
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({passedCount}/{total})
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Average Score</p>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-0.5">
                  {avgScore}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Failed Attempts</p>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-rose-600 mt-0.5">
                  {failedCount} <span className="text-xs font-mono font-normal text-slate-400">students</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Notice Alert */}
          {actionNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Course Selector */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Filter by Course
                </label>
                <select
                  aria-label="Filter by Course"
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Courses ({results.length} total results)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.resultCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Search Student / ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Student name, ID (IWPH...), or email..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#0E57A4] outline-none font-sans"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`flex-1 text-xs font-mono font-bold py-1.5 rounded-xl border transition cursor-pointer ${
                      statusFilter === "ALL"
                        ? "bg-[#0E57A4] text-white border-[#0E57A4]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("PASSED")}
                    className={`flex-1 text-xs font-mono font-bold py-1.5 rounded-xl border transition cursor-pointer ${
                      statusFilter === "PASSED"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50"
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("FAILED")}
                    className={`flex-1 text-xs font-mono font-bold py-1.5 rounded-xl border transition cursor-pointer ${
                      statusFilter === "FAILED"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-rose-700 border-slate-200 hover:bg-rose-50"
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-display font-bold text-slate-800">
                {total === 0 ? "No Student Exam Submissions Yet" : "No Results Match Your Filters"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {total === 0
                  ? "When students complete all lessons in an enrolled course and take the True/False examination, their scores and results will appear here."
                  : "Try clearing your filters or selecting a different course."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Student</th>
                      <th className="py-3.5 px-4 font-bold">Course</th>
                      <th className="py-3.5 px-4 font-bold text-center">Score</th>
                      <th className="py-3.5 px-4 font-bold text-center">Percentage</th>
                      <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      <th className="py-3.5 px-4 font-bold">Completed At</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((item) => {
                      const isResetting = resettingId === item.id;
                      const pct = Math.round(item.percentage);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Student */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {item.user.name}
                                </span>
                                {item.user.studentId && (
                                  <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                    {item.user.studentId}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-500">{item.user.email}</p>
                            </div>
                          </td>

                          {/* Course */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 max-w-xs">
                              <p className="font-bold text-slate-900 truncate" title={item.course.title}>
                                {item.course.title}
                              </p>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.course.category}
                              </span>
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-extrabold text-sm text-slate-900">
                              {item.score}{" "}
                              <span className="text-slate-400 font-normal text-xs">/ {item.maxScore}</span>
                            </span>
                          </td>

                          {/* Percentage */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-mono font-extrabold text-sm ${
                              item.passed ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {pct}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              item.passed
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {item.passed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Passed
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" /> Failed
                                </>
                              )}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {new Date(item.completedAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              disabled={isResetting}
                              onClick={() => handleResetAttempt(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-40"
                              title="Reset student's score and allow a retake"
                            >
                              {isResetting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              <span>Reset</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
