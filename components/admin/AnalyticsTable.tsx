"use client";

import React, { useState } from "react";
import { Download, Search, Trophy, Clock, User, Filter, CheckCircle2 } from "lucide-react";

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4">
      {/* Header controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "logs" ? "bg-[#0E57A4] text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            Activity Logs ({filteredLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "leaderboard" ? "bg-[#F16726] text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Pharmacy Rush Leaderboard ({leaderboard.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0E57A4]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {activeTab === "logs" && (
            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {activeTab === "logs" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-mono text-[10px] uppercase text-ink-muted border-b">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Activity</th>
                <th className="p-3">Reference / Medicine</th>
                <th className="p-3">Score</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const pct = log.maxScore > 0 ? Math.round((log.score / log.maxScore) * 100) : 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-semibold text-ink">{log.student?.name || "Learner"}</div>
                      <div className="text-[10px] font-mono text-ink-muted">{log.student?.email} {log.student?.studentId ? `(${log.student.studentId})` : ""}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-[#0E57A4] border border-slate-200">
                        {log.activityType}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-ink-muted">{log.referenceId || "—"}</td>
                    <td className="p-3 font-mono font-bold text-ink">
                      {log.score} / {log.maxScore}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={pct >= 80 ? "text-[#4A8B7A]" : pct >= 50 ? "text-[#0E57A4]" : "text-clinical-red"}>
                        {pct}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-ink-muted text-[11px]">
                      {new Date(log.completedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted font-sans">
                    No student logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Pharmacy Rush Leaderboard Tab */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-mono text-[10px] uppercase text-ink-muted border-b">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Student</th>
                <th className="p-3">Medicine</th>
                <th className="p-3">Score</th>
                <th className="p-3">Time Taken</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((entry, idx) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">
                    {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-ink">{entry.student?.name || "Learner"}</div>
                    <div className="text-[10px] font-mono text-ink-muted">{entry.student?.email}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#F16726]">{entry.medicineName}</td>
                  <td className="p-3 font-mono font-bold text-lg text-ink">{entry.score}/100</td>
                  <td className="p-3 font-mono text-ink-muted">{entry.timeTakenSec} seconds</td>
                  <td className="p-3 font-mono text-ink-muted text-[11px]">
                    {new Date(entry.playedAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-muted font-sans">
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
