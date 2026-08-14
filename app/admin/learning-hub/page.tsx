import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText, FlaskConical, ClipboardList, Zap,
  BarChart3, Settings, Plus, ArrowRight, ShieldCheck
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Learning Hub Admin CMS — IMHS Portal",
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
      subtitle: "Activity 01 Content",
      count: prescriptionCount,
      label: "Cases Configured",
      href: "/admin/learning-hub/prescriptions",
      icon: FileText,
      color: "#0E57A4",
      bg: "rgba(14,87,164,.08)",
      desc: "Add/edit prescription images, patient details, problem options, and dispensing rules.",
    },
    {
      title: "Drug Knowledge Base",
      subtitle: "Activity 02 Content",
      count: drugCount,
      label: "Drugs Seeded",
      href: "/admin/learning-hub/drugs",
      icon: FlaskConical,
      color: "#4A8B7A",
      bg: "rgba(74,139,122,.08)",
      desc: "Manage generic drug names, classes, MOAs, side effect options, and antidotes.",
    },
    {
      title: "Module Assessment Questions",
      subtitle: "Activity 03 Content",
      count: questionCount,
      label: "T/F Questions",
      href: "/admin/learning-hub/assessments",
      icon: ClipboardList,
      color: "#6366F1",
      bg: "rgba(99,102,241,.08)",
      desc: "Create questions or upload 100+ True/False exam suites via bulk CSV/Excel parser.",
    },
    {
      title: "Pharmacy Rush Configurator",
      subtitle: "Activity 04 Arcade",
      count: rushConfigCount,
      label: "Game Configs",
      href: "/admin/learning-hub/pharmacy-rush",
      icon: Zap,
      color: "#F16726",
      bg: "rgba(241,103,38,.08)",
      desc: "Set featured medicine, 10-round questions, 15-second countdown timer, and options.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
              Admin CMS Console
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-ink mt-1">
            Learning Hub Content Manager
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Complete CRUD controls, question bank uploads, game parameters, and student analytics.
          </p>
        </div>

        <Link
          href="/admin/learning-hub/analytics"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E57A4] text-white text-xs font-bold hover:bg-[#0A4482] transition-colors shadow-xs shrink-0"
        >
          <BarChart3 className="w-4 h-4" /> View Student Gradebook ({totalAttempts} Logs)
        </Link>
      </div>

      {/* Grid of Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-card hover:border-slate-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: card.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase" style={{ color: card.color }}>
                        {card.subtitle}
                      </span>
                      <h2 className="text-base font-display font-bold text-ink">{card.title}</h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-ink">{card.count}</div>
                    <div className="text-[9px] font-mono text-ink-muted uppercase">{card.label}</div>
                  </div>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed">{card.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E57A4] hover:underline"
                >
                  Manage Content <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
