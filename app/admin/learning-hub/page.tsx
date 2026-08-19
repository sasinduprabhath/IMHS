import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  FlaskConical,
  ClipboardList,
  Zap,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Learning Hub Admin CMS - IMHS Console",
};

export default async function AdminLearningHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let prescriptionCount = 0;
  let drugCount = 0;
  let questionCount = 0;
  let rushConfigCount = 0;
  let totalAttempts = 0;

  try {
    const [p, d, q, r, t] = await Promise.all([
      prisma.prescriptionCase?.count() ?? 0,
      prisma.drugKnowledge?.count() ?? 0,
      prisma.moduleAssessmentQuestion?.count() ?? 0,
      prisma.pharmacyRushConfig?.count() ?? 0,
      prisma.studentActivityLog?.count() ?? 0,
    ]);
    prescriptionCount = p;
    drugCount = d;
    questionCount = q;
    rushConfigCount = r;
    totalAttempts = t;
  } catch (error) {
    console.error("Error fetching learning hub counts:", error);
  }

  const cards = [
    {
      title: "Prescription Case Manager",
      activityCode: "ACTIVITY 01",
      count: prescriptionCount,
      label: "Cases Configured",
      href: "/admin/learning-hub/prescriptions",
      icon: FileText,
      color: "#0E57A4",
      gradient: "from-[#0E57A4] to-[#2563EB]",
      bg: "bg-blue-50/70 border-blue-200/60 text-[#0E57A4]",
      desc: "Upload prescription slip scans, configure clinical patient details, define dosing errors, and set dispensing rules with Gemini AI.",
      tag: "AI Powered Generator",
    },
    {
      title: "Drug Knowledge Base",
      activityCode: "ACTIVITY 02",
      count: drugCount,
      label: "Drugs Seeded",
      href: "/admin/learning-hub/drugs",
      icon: FlaskConical,
      color: "#059669",
      gradient: "from-[#059669] to-[#10B981]",
      bg: "bg-emerald-50/70 border-emerald-200/60 text-emerald-700",
      desc: "Manage generic medicine database, therapeutic drug classes, mechanisms of action, side effect options, and antidotes.",
      tag: "1-Click AI Auto-Fill",
    },
    {
      title: "Module Assessment Exam Suites",
      activityCode: "ACTIVITY 03",
      count: questionCount,
      label: "T/F Questions",
      href: "/admin/courses",
      icon: ClipboardList,
      color: "#6366F1",
      gradient: "from-[#6366F1] to-[#8B5CF6]",
      bg: "bg-indigo-50/70 border-indigo-200/60 text-indigo-700",
      desc: "Configure course final assessments, edit True/False clinical rationales, or upload 100+ questions via bulk CSV parser.",
      tag: "100-Q Bulk CSV Engine",
    },
    {
      title: "Pharmacy Rush Configurator",
      activityCode: "ACTIVITY 04",
      count: rushConfigCount,
      label: "Arcade Configurations",
      href: "/admin/learning-hub/pharmacy-rush",
      icon: Zap,
      color: "#F16726",
      gradient: "from-[#F16726] to-[#FB923C]",
      bg: "bg-orange-50/70 border-orange-200/60 text-[#F16726]",
      desc: "Configure 10-round arcade countdown challenge, parameterize 15-second countdown timers, and manage student leaderboards.",
      tag: "AI 10-Round Generator",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full">
      {/* ── Executive CMS Hero Header ── */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-8 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #0A1628 0%, #0C1A30 50%, #0E223D 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 90% 10%, rgba(14,87,164,.25) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 10% 90%, rgba(241,103,38,.15) 0%, transparent 50%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#F16726] via-[#0E57A4] to-[#10B981]" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-amber-300 border border-amber-300/30 bg-amber-300/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" /> Interactive Clinical Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-display font-bold text-white leading-tight">
              Learning Hub Content Management Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 font-sans max-w-2xl leading-relaxed">
              Configure curriculum simulation activities, seed pharmacology knowledge bases, auto-generate clinical test cases with AI, and monitor student gradebooks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/admin/learning-hub/analytics"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E57A4] to-[#1D4ED8] hover:from-[#0A4482] hover:to-[#1E40AF] text-white text-xs font-mono font-bold transition-all shadow-md min-h-[42px]"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Student Gradebook ({totalAttempts} Logs)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Grid of Admin CMS Activity Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${card.bg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                          {card.activityCode}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {card.tag}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 group-hover:text-[#0E57A4] transition-colors leading-snug">
                        {card.title}
                      </h2>
                    </div>
                  </div>

                  {/* Stat Counter */}
                  <div className="text-right shrink-0 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                    <div className="text-lg sm:text-xl font-mono font-bold text-slate-900">
                      {card.count}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                      {card.label}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* Card Footer Link */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Full CRUD &amp; AI Integration
                </span>
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E57A4] group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Configure Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
