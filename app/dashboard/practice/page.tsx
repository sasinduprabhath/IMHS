import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FlaskConical, Zap, ClipboardList, FileText,
  ChevronRight, Lock, Flame, BookOpen, Star
} from "lucide-react";
import { DRUGS } from "@/data/drugs";

export const metadata = {
  title: "Practice Hub — IMHS Student Portal",
  description: "Interactive pharmacology practice activities: Prescription Review, Drug Classification, Module Assessment, and Pharmacy Rush.",
};

const ACTIVITIES = [
  {
    id: "prescription-review",
    number: "01",
    title: "Prescription Review Challenge",
    subtitle: "Clinical Decision Making",
    description: "Evaluate a real prescription step-by-step — identify patient details, spot dispensing errors, and counsel the patient.",
    icon: FileText,
    color: "#0E57A4",
    bg: "rgba(14,87,164,.07)",
    border: "rgba(14,87,164,.18)",
    gradient: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
    href: "/dashboard/practice/prescription-review",
    steps: ["Prescription Image", "Patient Details", "Medicines", "Problem ID", "Action", "Counselling"],
    badge: "New Case",
    badgeColor: "#0E57A4",
    locked: false,
  },
  {
    id: "drug-classification",
    number: "02",
    title: "Drug Classification Challenge",
    subtitle: "Pharmacology",
    description: "Identify a drug's class, mechanism, side effects, interactions, and antidote — in a 6-step guided wizard.",
    icon: FlaskConical,
    color: "#4A8B7A",
    bg: "rgba(74,139,122,.07)",
    border: "rgba(74,139,122,.18)",
    gradient: "linear-gradient(135deg, #4A8B7A 0%, #6DADA0 100%)",
    href: "/dashboard/practice/drug-classification",
    steps: ["Identify", "Class", "MOA", "Side Effects", "Interactions", "Antidote"],
    badge: "5 Drugs",
    badgeColor: "#4A8B7A",
    locked: false,
  },
  {
    id: "module-assessment",
    number: "03",
    title: "Module Assessment",
    subtitle: "True / False Exam",
    description: "Test your knowledge with True/False questions. Auto-saved progress, topic-grouped results, and missed-answer review.",
    icon: ClipboardList,
    color: "#6366F1",
    bg: "rgba(99,102,241,.07)",
    border: "rgba(99,102,241,.18)",
    gradient: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
    href: "/dashboard/practice/module-assessment",
    steps: ["Questions", "Auto-save", "Review", "Filter", "Explanations"],
    badge: "22 Questions",
    badgeColor: "#6366F1",
    locked: false,
  },
  {
    id: "pharmacy-rush",
    number: "04",
    title: "Pharmacy Rush",
    subtitle: "Timed Game",
    description: "Beat the 15-second clock across 10 rounds — Drug Class, MOA, Side Effects, Counselling, and a final Quick Decision!",
    icon: Zap,
    color: "#F16726",
    bg: "rgba(241,103,38,.07)",
    border: "rgba(241,103,38,.18)",
    gradient: "linear-gradient(135deg, #E05A10 0%, #F16726 100%)",
    href: "/dashboard/practice/pharmacy-rush",
    steps: ["Drug Class", "Indication", "MOA", "Strength", "Form", "Admin", "Side FX", "Precaution", "Counselling", "Decision"],
    badge: "Rush Mode",
    badgeColor: "#F16726",
    locked: false,
  },
];

export default async function PracticeHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const studentFirstName = session.user.name?.split(" ")[0] || "Learner";

  return (
    <div className="space-y-8">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0A2540 0%, #0E57A4 50%, #1868c2 100%)",
          boxShadow: "0 12px 36px rgba(14,87,164,.35)",
        }}
      >
        {/* Mesh glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(241,103,38,0.25) 0%, transparent 40%)",
          }}
        />

        <div className="relative z-10 p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F16726]" />
              <span className="text-[#F16726] font-mono text-[10px] uppercase font-bold tracking-widest">
                IMHS Practice Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
              Train Like a Pharmacist, {studentFirstName}.
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-sans leading-relaxed max-w-md">
              Four interactive activities covering prescription analysis, drug classification, timed knowledge challenges, and formal assessment practice.
            </p>
          </div>

          {/* Drug count pills */}
          <div className="shrink-0 flex flex-col items-center text-center bg-white/10 border border-white/20 rounded-2xl px-5 py-4 backdrop-blur-md">
            <span className="text-3xl font-display font-bold text-white">{DRUGS.length}</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/60 mt-0.5">Drugs in Library</span>
          </div>
        </div>
      </div>

      {/* ── Activity Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ACTIVITIES.map((act, i) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className={`group relative bg-white rounded-3xl border overflow-hidden flex flex-col transition-all duration-250 hover:shadow-card-hover ${
                act.locked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"
              }`}
              style={{ border: `1.5px solid ${act.border}`, boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full" style={{ background: act.gradient }} />

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: act.bg, border: `1px solid ${act.border}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: act.color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: act.color }}>
                        Activity {act.number} — {act.subtitle}
                      </p>
                      <h2 className="text-base font-display font-bold text-ink leading-snug mt-0.5">
                        {act.title}
                      </h2>
                    </div>
                  </div>

                  {/* Badge */}
                  <span
                    className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                    style={{
                      color: act.badgeColor,
                      background: `${act.badgeColor}12`,
                      borderColor: `${act.badgeColor}30`,
                    }}
                  >
                    {act.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-ink-muted leading-relaxed">{act.description}</p>

                {/* Step pills */}
                <div className="flex flex-wrap gap-1.5">
                  {act.steps.map((step, j) => (
                    <span
                      key={step}
                      className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200"
                    >
                      {act.id === "pharmacy-rush" ? `R${j + 1}` : `${j + 1}`}. {step}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  {act.locked ? (
                    <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
                      <Lock className="w-4 h-4" />
                      Coming soon
                    </div>
                  ) : (
                    <Link
                      href={act.href}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-95"
                      style={{ background: act.gradient }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Start Activity {act.number}
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Available Drugs Info ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(10,18,30,.04)" }}>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[#4A8B7A]" />
          <h3 className="text-sm font-display font-bold text-ink">Drug Library</h3>
          <span className="text-[10px] font-mono font-bold text-[#4A8B7A] bg-[#4A8B7A]/10 px-2 py-0.5 rounded-full border border-[#4A8B7A]/20">
            {DRUGS.length} available
          </span>
        </div>
        <p className="text-xs text-ink-muted">Activities can be played for any drug in the library. Use the <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">?drug=</code> URL parameter to select a specific drug.</p>
        <div className="flex flex-wrap gap-2">
          {DRUGS.map((drug) => (
            <div key={drug.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs font-display font-semibold text-ink">{drug.genericName}</span>
              <span className="text-[9px] font-mono text-ink-muted">{drug.drugClass.split(" ")[0]}</span>
              <div className="flex items-center gap-1">
                <Link href={`/dashboard/practice/drug-classification?drug=${drug.id}`} className="text-[9px] font-mono font-bold text-[#4A8B7A] hover:underline">Classify</Link>
                <span className="text-slate-300">·</span>
                <Link href={`/dashboard/practice/pharmacy-rush?drug=${drug.id}`} className="text-[9px] font-mono font-bold text-[#F16726] hover:underline">Rush</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
