"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  RotateCcw,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { deleteCourseAssessmentResult } from "@/actions/assessment-actions";

export interface AssessmentResultItem {
  id: string;
  userId: string;
  courseId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string | Date;
  user: {
    id: string;
    name: string;
    studentId: string | null;
    email: string;
    phone: string;
  };
}

interface CourseAssessmentResultsClientProps {
  courseId: string;
  courseTitle: string;
  initialResults: AssessmentResultItem[];
}

export function CourseAssessmentResultsClient({
  courseId,
  courseTitle,
  initialResults,
}: CourseAssessmentResultsClientProps) {
  const [results, setResults] = useState<AssessmentResultItem[]>(initialResults);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">("ALL");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "score-desc" | "score-asc">("date-desc");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // ── KPI Computations ────────────────────────────────────────────────────────
  const total = results.length;
  const passedCount = useMemo(() => results.filter((r) => r.passed).length, [results]);
  const failedCount = total - passedCount;
  const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const avgScore = total > 0 ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / total) : 0;
  const highestScore = total > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

  // ── Filtered & Sorted Results ───────────────────────────────────────────────
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        if (statusFilter === "PASSED" && !r.passed) return false;
        if (statusFilter === "FAILED" && r.passed) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = r.user.name.toLowerCase().includes(q);
          const matchStudentId = (r.user.studentId || "").toLowerCase().includes(q);
          const matchEmail = r.user.email.toLowerCase().includes(q);
          const matchPhone = r.user.phone.toLowerCase().includes(q);
          if (!matchName && !matchStudentId && !matchEmail && !matchPhone) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        }
        if (sortBy === "score-desc") {
          return b.percentage - a.percentage;
        }
        if (sortBy === "score-asc") {
          return a.percentage - b.percentage;
        }
        return 0;
      });
  }, [results, statusFilter, searchQuery, sortBy]);

  // ── Reset / Retake Action ──────────────────────────────────────────────────
  const handleResetAttempt = async (result: AssessmentResultItem) => {
    const studentLabel = result.user.studentId ? `${result.user.name} (${result.user.studentId})` : result.user.name;
    const confirmed = confirm(
      `Allow ${studentLabel} to retake this course exam?\n\nThis will clear their previous score of ${result.score}/${result.maxScore} (${Math.round(result.percentage)}%) and allow them to take the exam again from their student portal.`
    );
    if (!confirmed) return;

    setResettingId(result.id);
    setActionNotice(null);
    try {
      const res = await deleteCourseAssessmentResult(result.id);
      if (res.success) {
        setResults((prev) => prev.filter((r) => r.id !== result.id));
        setActionNotice(`Exam attempt for ${studentLabel} was successfully reset. The student can now re-take the exam.`);
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

  // ── Export to CSV ──────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = ["Student ID", "Full Name", "Email", "Phone", "Score", "Max Score", "Percentage", "Status", "Date Completed"];
    const rows = results.map((r) => [
      `"${r.user.studentId || ""}"`,
      `"${r.user.name.replace(/"/g, '""')}"`,
      `"${r.user.email}"`,
      `"${r.user.phone}"`,
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
    const sanitizedTitle = courseTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.setAttribute("download", `${sanitizedTitle}_exam_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-[#0E57A4] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Submissions</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-0.5">
              {total} <span className="text-xs font-mono font-normal text-slate-400">students</span>
            </p>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Pass Rate (≥60%)</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-emerald-600 mt-0.5">
              {passRate}%{" "}
              <span className="text-xs font-mono font-normal text-slate-400">
                ({passedCount}/{total})
              </span>
            </p>
          </div>
        </div>

        {/* Average Score */}
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

        {/* Top Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase text-slate-400">Highest Score</p>
            <p className="text-xl sm:text-2xl font-display font-extrabold text-amber-600 mt-0.5">
              {highestScore}%
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

      {/* Filter & Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, ID (IWPH...), or email..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#0E57A4] outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0E57A4]" /> Status:
            </span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-[#0E57A4] text-white border-[#0E57A4]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setStatusFilter("PASSED")}
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition cursor-pointer ${
                statusFilter === "PASSED"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50"
              }`}
            >
              Passed ({passedCount})
            </button>
            <button
              onClick={() => setStatusFilter("FAILED")}
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition cursor-pointer ${
                statusFilter === "FAILED"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-rose-700 border-slate-200 hover:bg-rose-50"
              }`}
            >
              Failed ({failedCount})
            </button>
          </div>

          {/* Sort & Export Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                aria-label="Sort results"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs font-mono font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 outline-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
              </select>
            </div>

            <button
              type="button"
              onClick={exportToCSV}
              disabled={results.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
              title="Download results as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Table / Cards */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-base font-display font-bold text-slate-800">
            {total === 0 ? "No Student Exam Submissions Yet" : "No Results Match Your Filter"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {total === 0
              ? `When enrolled students complete all curriculum lessons and submit the end-of-course True/False examination, their scores, percentage, and completion timestamps will appear here automatically.`
              : "Try clearing your search query or switching the status filter to see other student results."}
          </p>
          {total > 0 && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-mono font-bold text-[#0E57A4] hover:underline pt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Student</th>
                  <th className="py-3.5 px-4 font-bold">Contact</th>
                  <th className="py-3.5 px-4 font-bold text-center">Score</th>
                  <th className="py-3.5 px-4 font-bold text-center">Percentage</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold">Date Completed</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((item) => {
                  const isResetting = resettingId === item.id;
                  const pct = Math.round(item.percentage);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
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
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 truncate max-w-xs" title={item.user.email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.user.email}</span>
                          </div>
                          {item.user.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.user.phone}</span>
                            </div>
                          )}
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
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`font-mono font-extrabold text-sm ${
                            item.passed ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {pct}%
                          </span>
                        </div>
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

                      {/* Date Completed */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(item.completedAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            ·{" "}
                            {new Date(item.completedAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
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
                          title="Reset student's score and allow a re-take"
                        >
                          {isResetting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>Allow Retake</span>
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
  );
}
