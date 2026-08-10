import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  FileText, Pill, BookOpen, Zap, ArrowRight, Sparkles, CheckCircle2,
  Brain, ShieldCheck, Clock, Award, Play
} from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Learning Hub — IMHS Clinical Practice",
  description: "Master pharmaceutical dispensing, drug classification, module assessments, and rapid recall pharmacy challenges.",
};

const ACTIVITIES = [
  {
    id: "prescription-review",
    title: "Activity 01: Prescription Review Challenge",
    subtitle: "Step-by-step clinical audit of prescription scripts & dispensing decisions",
    icon: FileText,
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-300",
    iconBg: "bg-blue-50 text-[#0E57A4]",
    duration: "10-15 Min",
    type: "Clinical Audit",
    description: "Inspect real prescription images, audit patient & medicine details, identify clinical dosing problems, select pharmacist actions, and construct patient counselling advice.",
    features: ["Script Zoom & Inspect", "Dosage & Interaction Checks", "Dispensing Decision Audit", "Counselling Point Evaluation"]
  },
  {
    id: "drug-classification",
    title: "Activity 02: Drug Classification Challenge",
    subtitle: "Classify medicines into therapeutic classes, MOA, side effects, & antidotes",
    icon: Pill,
    badgeColor: "bg-teal-500/10 text-teal-700 border-teal-300",
    iconBg: "bg-teal-50 text-[#4A8B7A]",
    duration: "8-12 Min",
    type: "Pharmacology",
    description: "Systematically classify medicines from generic names. Identify pharmacological classes, exact mechanisms of action, adverse drug reactions, key interactions, and reversal agents.",
    features: ["Generic ℞ Profile", "MOA Identification", "Side Effect Audit", "Antidote & Reversal Agent"]
  },
  {
    id: "module-assessment",
    title: "Activity 03: Module Assessment Evaluation",
    subtitle: "Summative 100 True/False question evaluation covering full module topics",
    icon: BookOpen,
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-300",
    iconBg: "bg-purple-50 text-purple-700",
    duration: "20-30 Min",
    type: "Assessment",
    description: "Test your comprehensive mastery with True/False clinical evaluations. Features one-question-at-a-time mobile pacing, automatic autosave resume, and topic-by-topic scorecards.",
    features: ["100 T/F Evaluation", "Autosave & Resume", "Topic Mastery Analysis", "Incorrect Only Filter"]
  },
  {
    id: "pharmacy-rush",
    title: "Activity 04: IMHS Pharmacy Rush (Game)",
    subtitle: "Rapid-fire 10-round timed recall challenge for individual medicines",
    icon: Zap,
    badgeColor: "bg-orange-500/10 text-orange-700 border-orange-300",
    iconBg: "bg-orange-50 text-[#F16726]",
    duration: "3-5 Min",
    type: "Rapid Recall",
    description: "Beat the clock in a 10-round rapid-fire game testing drug class, indications, MOA, dosage forms, side effects, precautions, and quick pharmacist decisions.",
    features: ["10-Round Rapid Game", "Timed Rush vs Practice Mode", "Mono Live Counter", "Scorecard Breakdown"]
  }
];

export default function PracticeHubPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-r from-[#0C1A30] via-[#0A2540] to-[#0C1A30] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#F16726] uppercase font-bold tracking-widest bg-[#F16726]/10 border border-[#F16726]/30 px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Clinical Mastery
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-wide">
              IMHS Interactive Learning Hub
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Dr. Isuru Wijesinghe&apos;s clinical practice suite. Test your practical dispensing accuracy, pharmacology classification, and rapid decision-making skills.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 p-4 rounded-2xl space-y-1 text-center font-mono text-xs shrink-0">
            <span className="text-slate-300 block text-[10px] uppercase">PRACTICE SUITE</span>
            <strong className="text-emerald-400 text-lg block">4 Active Modules</strong>
            <span className="text-slate-400 text-[10px]">Instant Clinical Feedback</span>
          </div>
        </div>
      </div>

      {/* ── 4 ACTIVITY CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACTIVITIES.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-paper hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${act.iconBg} border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${act.badgeColor}`}>
                    {act.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-[#0E57A4] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {act.subtitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  {act.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {act.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {act.duration}
                </span>

                <Link href={`/dashboard/practice/${act.id}`}>
                  <Button className="text-xs font-bold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shadow-xs gap-1.5 cursor-pointer">
                    <span>Start Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
