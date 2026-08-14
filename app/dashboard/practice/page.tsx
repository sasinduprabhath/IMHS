import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FlaskConical, Zap, ClipboardList, FileText,
  ChevronRight, Lock, Flame, BookOpen, Star, Sparkles,
  ShieldCheck, ArrowUpRight, Award, Layers, Clock
} from "lucide-react";
import { DRUGS } from "@/data/drugs";
import { getDrugKnowledgeList } from "@/actions/drug-actions";

export const metadata = {
  title: "Practice Hub — IMHS Interactive Learning",
  description: "Luxury interactive clinical practice hub for prescription analysis, drug classification, timed challenges, and exams.",
};

const ACTIVITIES = [
  {
    id: "prescription-review",
    number: "01",
    title: "Prescription Review Challenge",
    subtitle: "Clinical Decision Making",
    description: "Evaluate a real prescription step-by-step — verify patient details, detect dosing/contraindication errors, and provide patient counselling.",
    icon: FileText,
    color: "#0E57A4",
    bg: "rgba(14,87,164,.08)",
    border: "rgba(14,87,164,.22)",
    gradient: "linear-gradient(135deg, #0A2540 0%, #0E57A4 100%)",
    href: "/dashboard/practice/prescription-review",
    steps: ["Prescription Image", "Patient Details", "Medicines", "Problem ID", "Action", "Counselling"],
    badge: "Clinical Simulation",
    badgeColor: "#0E57A4",
    duration: "6-8 min",
    difficulty: "Case Review",
  },
  {
    id: "drug-classification",
    number: "02",
    title: "Drug Classification Challenge",
    subtitle: "Pharmacology & Therapeutics",
    description: "Identify a medicine's drug class, mechanism of action, common side effects, key interactions, and antidote in a 6-step guided wizard.",
    icon: FlaskConical,
    color: "#4A8B7A",
    bg: "rgba(74,139,122,.08)",
    border: "rgba(74,139,122,.22)",
    gradient: "linear-gradient(135deg, #2d6655 0%, #4A8B7A 100%)",
    href: "/dashboard/practice/drug-classification",
    steps: ["Identify", "Drug Class", "MOA", "Side Effects", "Interactions", "Antidote"],
    badge: "6-Step Wizard",
    badgeColor: "#4A8B7A",
    duration: "4-5 min",
    difficulty: "Pharmacology",
  },
  {
    id: "pharmacy-rush",
    number: "03",
    title: "Pharmacy Rush Arcade",
    subtitle: "Timed Speed Challenge",
    description: "Beat the 15-second clock across 10 rapid-fire rounds — test Drug Class, Indications, MOA, Side Effects, and fast decision-making!",
    icon: Zap,
    color: "#F16726",
    bg: "rgba(241,103,38,.08)",
    border: "rgba(241,103,38,.22)",
    gradient: "linear-gradient(135deg, #D95316 0%, #F16726 100%)",
    href: "/dashboard/practice/pharmacy-rush",
    steps: ["Class", "Indication", "MOA", "Strength", "Form", "Side FX", "Precaution", "Counselling", "Decision", "Leaderboard"],
    badge: "15s Rush Clock",
    badgeColor: "#F16726",
    duration: "3-4 min",
    difficulty: "Arcade Speed",
  },
];

export default async function PracticeHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const studentFirstName = session.user.name?.split(" ")[0] || "Learner";

  const dbDrugs = await getDrugKnowledgeList();
  const activeDrugs: any[] =
    dbDrugs.length > 0
      ? dbDrugs.map((d: any) => ({
          id: d.id,
          genericName: d.genericName,
          drugClass: d.drugClass,
          brandNames: [d.genericName],
        }))
      : (DRUGS as any[]);

  return (
    <div className="space-y-8 pb-10">

      {/* ── Luxury Hero Header ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] p-8 sm:p-10 text-white">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F16726]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Top Pill Badge */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                IMHS Interactive Clinical Hub
              </span>
            </div>

            {/* Metrics Counter Pill */}
            <div className="flex items-center gap-4 bg-black/20 border border-white/15 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-mono text-white/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>4 Activities</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-blue-300" />
                <span>{activeDrugs.length} Medicines</span>
              </div>
            </div>
          </div>

          {/* Hero Heading & Subtitle */}
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight tracking-tight">
              Train Like a Pharmacist, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-amber-300">{studentFirstName}</span>.
            </h1>
            <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed font-sans pt-1">
              Master clinical decision-making across 4 interactive modules — from reviewing handwritten prescriptions to high-speed pharmacology arcade challenges.
            </p>
          </div>
        </div>
      </div>

      {/* ── Featured Medicine Quick Switcher Bar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#0E57A4]" />
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Select Medicine Profile:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {activeDrugs.map((drug) => (
            <Link
              key={drug.id}
              href={`/dashboard/practice/drug-classification?drug=${drug.id}`}
              className="shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#EBF3FA] hover:border-[#0E57A4]/40 transition text-xs font-semibold text-slate-800 flex items-center gap-1.5 group"
            >
              <span>{drug.genericName}</span>
              <span className="text-[9px] font-mono text-slate-400 group-hover:text-[#0E57A4] font-bold">
                {drug.drugClass.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Luxury Activity Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACTIVITIES.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Top Gradient Stripe */}
              <div className="h-2 w-full" style={{ background: act.gradient }} />

              <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Header Row */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Icon Box */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs"
                        style={{ background: act.bg, border: `1px solid ${act.border}` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: act.color }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest block" style={{ color: act.color }}>
                          Activity {act.number} · {act.subtitle}
                        </span>
                        <h2 className="text-lg font-display font-extrabold text-slate-900 leading-snug mt-0.5 group-hover:text-[#0E57A4] transition-colors">
                          {act.title}
                        </h2>
                      </div>
                    </div>

                    {/* Metadata Badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                        style={{
                          color: act.badgeColor,
                          background: `${act.badgeColor}12`,
                          borderColor: `${act.badgeColor}30`,
                        }}
                      >
                        {act.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {act.duration}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {act.description}
                  </p>

                  {/* Step Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {act.steps.map((step, j) => (
                      <span
                        key={step}
                        className="text-[9px] font-mono font-bold px-2 py-1 rounded-md bg-slate-100/80 text-slate-600 border border-slate-200/60 transition-colors group-hover:bg-[#EBF3FA]/60 group-hover:text-[#0E57A4]"
                      >
                        {act.id === "pharmacy-rush" ? `R${j + 1}` : `${j + 1}`}. {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={act.href}
                    className="flex items-center justify-between w-full px-5 py-3 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-lg active:scale-95 shadow-xs group-hover:brightness-110"
                    style={{ background: act.gradient }}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Start Activity {act.number}
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Medicine Library Showcase ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A8B7A]/10 border border-[#4A8B7A]/20 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-[#4A8B7A]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">
                Core Pharmacology Medicine Library
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Select any medicine to launch Activity 02 or Activity 04 directly:
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#4A8B7A] bg-[#4A8B7A]/10 px-3 py-1 rounded-full border border-[#4A8B7A]/20">
            {activeDrugs.length} Active Medicines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {activeDrugs.map((drug) => (
            <div
              key={drug.id}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all duration-200 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-display font-bold text-slate-900">{drug.genericName}</h4>
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    {drug.drugClass.split(" ")[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                  {drug.brandNames?.join(" · ") || "Clinical Drug"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-mono">
                <Link
                  href={`/dashboard/practice/drug-classification?drug=${drug.id}`}
                  className="text-[10px] font-bold text-[#4A8B7A] hover:underline flex items-center gap-0.5"
                >
                  <span>Classify</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
                <Link
                  href={`/dashboard/practice/pharmacy-rush?drug=${drug.id}`}
                  className="text-[10px] font-bold text-[#F16726] hover:underline flex items-center gap-0.5"
                >
                  <span>Rush Game</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
