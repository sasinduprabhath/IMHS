"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, Search, Trophy, Clock, User, Filter, CheckCircle2, Award, Zap, FileSpreadsheet } from "lucide-react";

interface LogEntry {
  id: string;
  studentId: string;
  student?: {
    name: string;
    email: string;
    studentId: string | null;
  };
  activityType: string;
  referenceId: string | null;
  score: number;
  maxScore: number;
  completedAt: string | Date;
}

interface AnalyticsTableProps {
  logs: LogEntry[];
  leaderboard?: any[];
}

export function AnalyticsTable({ logs, leaderboard = [] }: AnalyticsTableProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "leaderboard">("logs");
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const studentName = log.student?.name || "";
    const studentEmail = log.student?.email || "";
    const studentReg = log.student?.studentId || "";
    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      studentReg.toLowerCase().includes(search.toLowerCase());

    const matchesActivity = activityFilter === "ALL" || log.activityType === activityFilter;
    return matchesSearch && matchesActivity;
  });

  const exportToCSV = () => {
    const headers = ["Log ID", "Student Name", "Student Email", "Student Reg ID", "Activity", "Ref ID", "Score", "Max Score", "Date"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.student?.name || "Unknown",
      l.student?.email || "",
      l.student?.studentId || "",
      l.activityType,
      l.referenceId || "",
      l.score,
      l.maxScore,
      new Date(l.completedAt).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((x) => `"${x}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `imhs_student_analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 max-w-full">
      {/* ── Header Controls Ribbon ── */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap min-h-[36px] ${activeTab === "logs"
                ? "bg-[#0E57A4] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            Activity Logs ({filteredLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[36px] ${activeTab === "leaderboard"
                ? "bg-[#F16726] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Pharmacy Rush Arcade ({leaderboard.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[38px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {activeTab === "logs" && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "logs" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Student &amp; Reg ID</th>
                <th className="p-4">Activity Module</th>
                <th className="p-4">Reference / Case</th>
                <th className="p-4">Raw Score</th>
                <th className="p-4">Accuracy</th>
                <th className="p-4 pr-6">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const pct = log.maxScore > 0 ? Math.round((log.score / log.maxScore) * 100) : 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900">{log.student?.name || "Learner"}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {log.student?.email} {log.student?.studentId ? `(${log.student.studentId})` : ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border",
                          log.activityType === "COURSE_ASSESSMENT"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : log.activityType === "PHARMACY_RUSH"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : log.activityType.includes("PRESCRIPTION")
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-[#0E57A4] border-blue-200"
                        )}
                      >
                        {log.activityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-800 break-words line-clamp-2 max-w-xs">
                        {log.referenceId || "General Practice"}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {log.score} / {log.maxScore}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${pct >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : pct >= 50
                              ? "bg-blue-50 text-[#0E57A4] border border-blue-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="p-4 pr-6 font-mono text-slate-400 text-[11px]">
                      {new Date(log.completedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-mono">
                    No student activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Pharmacy Rush Leaderboard Tab */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">Medicine Case</th>
                <th className="p-4">Final Score</th>
                <th className="p-4">Time Taken</th>
                <th className="p-4 pr-6">Played At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((entry, idx) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold ${idx === 0
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : idx === 1
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : idx === 2
                              ? "bg-orange-100 text-orange-900 border border-orange-300"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}
                    >
                      {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{entry.student?.name || "Learner"}</div>
                    <div className="text-[11px] font-mono text-slate-400">{entry.student?.email}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#F16726]">
                    <span className="bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                      {entry.medicineName}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-sm text-slate-900">
                    {entry.score}/100
                  </td>
                  <td className="p-4 font-mono text-slate-600">{entry.timeTakenSec} seconds</td>
                  <td className="p-4 pr-6 font-mono text-slate-400 text-[11px]">
                    {new Date(entry.playedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}

              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-mono">
                    No arcade scores recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
