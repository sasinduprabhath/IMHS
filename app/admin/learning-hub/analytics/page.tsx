import React from "react";
import Link from "next/link";
import { getStudentAnalyticsLogs, getPharmacyRushLeaderboard } from "@/actions/pharmacy-rush-actions";
import { AnalyticsTable } from "@/components/admin/AnalyticsTable";
import { ArrowLeft, BarChart3, Trophy, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Student Analytics & Gradebook - Admin CMS",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [logs, leaderboard] = await Promise.all([
    getStudentAnalyticsLogs(),
    getPharmacyRushLeaderboard(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/admin/learning-hub"
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS Overview
          </Link>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0E57A4]" /> Student Analytics & Gradebook
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Monitor student activity completion, accuracy scores, Pharmacy Rush leaderboard, and export CSV logs.
          </p>
        </div>
      </div>

      {/* Analytics Table Component */}
      <AnalyticsTable logs={logs} leaderboard={leaderboard} />
    </div>
  );
}
