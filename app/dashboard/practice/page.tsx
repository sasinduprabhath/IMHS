import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FlaskConical, Zap, FileText,
  ChevronRight, Sparkles, ShieldCheck,
  Clock, BookOpen, CheckCircle2
} from "lucide-react";
import { getDrugKnowledgeList } from "@/actions/drug-actions";

export const metadata = {
  title: "Practice Hub — IMHS Interactive Learning",
  description: "Interactive clinical practice hub for prescription analysis, drug classification, and timed arcade challenges.",
};

const ACTIVITIES = [
  {
    id: "prescription-review",
    number: "01",
    title: "Prescription Review",
    subtitle: "Clinical Decision Making",
    description: "Audit handwritten doctor prescriptions in the PACS viewer — verify patient details, detect dosage errors, and decide whether to dispense.",
    icon: FileText,
    color: "#0E57A4",
    bg: "rgba(14,87,164,.08)",
    border: "rgba(14,87,164,.2)",
    gradient: "linear-gradient(135deg, #0A2540 0%, #0E57A4 100%)",
    href: "/dashboard/practice/prescription-review",
    highlights: ["PACS Digital Viewer", "Dosage Safety Audit", "Dispensing Decision"],
    badge: "Clinical Simulation",
    badgeColor: "#0E57A4",
    duration: "6-8 min",
  },
  {
    id: "drug-classification",
    number: "02",
    title: "Drug Classification",
    subtitle: "Pharmacology & Therapeutics",
    description: "Classify formulary agents across 5 guided steps — identify pharmacological class, mechanism of action, side effects, interactions, and antidotes.",
    icon: FlaskConical,
    color: "#059669",
    bg: "rgba(5,150,105,.08)",
    border: "rgba(5,150,105,.2)",
    gradient: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
    href: "/dashboard/practice/drug-classification",
    highlights: ["Therapeutic Class & MOA", "Adverse Reactions", "Specific Antidotes"],
    badge: "5-Step Wizard",
    badgeColor: "#059669",
    duration: "4-5 min",
  },
  {
    id: "pharmacy-rush",
    number: "03",
    title: "Pharmacy Rush Arcade",
    subtitle: "Timed Speed Challenge",
    description: "Beat the 15-second clock across 10 rapid-fire rounds — test rapid drug class recall, indications, mechanisms, and speed decision-making.",
    icon: Zap,
    color: "#F16726",
    bg: "rgba(241,103,38,.08)",
    border: "rgba(241,103,38,.2)",
    gradient: "linear-gradient(135deg, #D95316 0%, #F16726 100%)",
    href: "/dashboard/practice/pharmacy-rush",
    highlights: ["15s Rapid Countdown", "Streak Multipliers", "Live Leaderboard"],
    badge: "Arcade Mode",
    badgeColor: "#F16726",
    duration: "3-4 min",
  },
];

export default async function PracticeHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const studentFirstName = session.user.name?.split(" ")[0] || "Learner";

  const dbDrugs = await getDrugKnowledgeList();
  const activeDrugs: any[] = dbDrugs.map((d: any) => ({
    id: d.id,
    genericName: d.genericName,
    drugClass: d.drugClass,
    brandNames: [d.genericName],
  }));

  return (
    <div className="space-y-8 pb-12">

      {/* ── Luxury Hero Header ────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-xl bg-gradient-to-br from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] p-7 sm:p-9 text-white">

        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F16726]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Top Pill Badge */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
                Interactive Practical Hub
              </span>
            </div>

            {/* Metrics Counter Pill */}
            <div className="flex items-center gap-3 bg-black/25 border border-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-2xl text-xs font-mono text-white/90">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>3 Clinical Simulations</span>
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue-300" />
                <span>{activeDrugs.length} Active Medicines</span>
              </div>
            </div>
          </div>

          {/* Hero Heading & Subtitle */}
          <div className="max-w-2xl space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight tracking-tight">
              Train Like a Pharmacist, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-amber-300">{studentFirstName}</span>.
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
              Master clinical decision-making across 3 interactive simulation activities — from reviewing handwritten prescriptions to high-speed pharmacology arcade rounds.
            </p>
          </div>
        </div>
      </div>

      {/* ── Luxury 3-Activity Cards Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ACTIVITIES.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              aria-label={`Start Activity ${act.number}: ${act.title}`}
              className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0E57A4]/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E57A4]/30"
            >
              {/* Top Color Stripe */}
              <div className="h-2 w-full" style={{ background: act.gradient }} />

              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">

                {/* Header Row */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">

                    {/* Icon Box */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-2xs"
                        style={{ background: act.bg, border: `1px solid ${act.border}` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: act.color }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider block" style={{ color: act.color }}>
                          Activity {act.number} · {act.subtitle}
                        </span>
                        <h2 className="text-base font-display font-extrabold text-slate-900 leading-snug mt-0.5 group-hover:text-[#0E57A4] transition-colors">
                          {act.title}
                        </h2>
                      </div>
                    </div>

                    {/* Metadata Badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
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

                  {/* Clean Feature Highlights Strip */}
                  <div className="space-y-1.5 pt-1">
                    {act.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-[11px] font-sans font-medium text-slate-700 bg-slate-50 group-hover:bg-[#EBF3FA]/70 px-3 py-1.5 rounded-xl border border-slate-200/70 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: act.color }} />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="pt-3 border-t border-slate-100">
                  <div
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 shadow-xs group-hover:brightness-110"
                    style={{ background: act.gradient }}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Start Activity {act.number}
                    </span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Pharmacology Medicine Library Showcase ─────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5 text-[#059669]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">
                Core Pharmacology Medicine Formulary
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Select any drug to launch Activity 02 (Classification) or Activity 03 (Pharmacy Rush):
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#059669] bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20 self-start sm:self-auto">
            {activeDrugs.length} Active Medicines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {activeDrugs.map((drug) => (
            <div
              key={drug.id}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all duration-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-display font-bold text-slate-900">{drug.genericName}</h4>
                  <span className="text-[9px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                    {drug.drugClass.split(" ")[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1 line-clamp-1">
                  {drug.drugClass}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-xs font-mono">
                <Link
                  href={`/dashboard/practice/drug-classification?drug=${drug.id}`}
                  className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                >
                  <FlaskConical className="w-3 h-3" />
                  <span>Classify</span>
                </Link>
                <Link
                  href={`/dashboard/practice/pharmacy-rush?drug=${drug.id}`}
                  className="text-[11px] font-bold text-[#F16726] hover:underline flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition"
                >
                  <Zap className="w-3 h-3" />
                  <span>Rush Game</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
