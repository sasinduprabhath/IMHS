"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText, Search, ArrowRight, Sparkles, ChevronLeft,
  Stethoscope, Lock
} from "lucide-react";

export interface PrescriptionCaseSummary {
  id: string;
  caseNumber: number;
  title?: string;
  difficulty?: "Standard" | "Intermediate" | "Complex";
}

interface PrescriptionCasePickerProps {
  cases: PrescriptionCaseSummary[];
}

export function PrescriptionCasePicker({ cases }: PrescriptionCasePickerProps) {
  const [search, setSearch] = useState("");

  const filteredCases = cases.filter((c) => {
    const caseName = `Case ${c.caseNumber} Case #${c.caseNumber} Prescription ${c.caseNumber}`;
    return caseName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12">
      {/* ── Top Navigation & Hero Banner ────────────────────────────────── */}
      <div>
        <Link
          href="/dashboard/practice"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-[#0E57A4] bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-all duration-200 group mb-4"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0E57A4] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Practical Hub</span>
        </Link>

        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#4A8B7A]/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Activity 01 · Case Selection
              </span>
              <span className="text-xs font-mono text-white/70">
                {cases.length} Clinical Simulations
              </span>
            </div>

            <div className="space-y-1 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Select a Prescription Simulation
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
                Choose a clinical case to review the handwritten prescription pad in the PACS viewer, verify dosages, catch errors, and make the dispensing call.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case number (e.g. Case 1, Case 2)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition"
          />
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 shrink-0 pr-2">
          Total: {filteredCases.length} Cases
        </span>
      </div>

      {/* ── Cases Grid (Full-Container Accessible Link) ─────────────────── */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-slate-900 text-base">No cases found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another case number or clear your search query.
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline pt-2"
          >
            Show all cases
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCases.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <Link
                href={`/dashboard/practice/prescription-review?case=${c.caseNumber}`}
                aria-label={`Open Clinical Case #${c.caseNumber}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0E57A4] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer h-full block focus:outline-none focus:ring-2 focus:ring-[#0E57A4]/30"
              >
                {/* Card Top Header */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center text-[#0E57A4] group-hover:scale-105 transition-transform shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">
                          Prescription Review
                        </span>
                        <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1 group-hover:text-[#0E57A4] transition-colors">
                          Clinical Case #{c.caseNumber}
                        </h2>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 group-hover:bg-[#EBF3FA] group-hover:text-[#0E57A4] px-3 py-1 rounded-xl border border-slate-200 transition-colors shrink-0">
                      Case {c.caseNumber}
                    </span>
                  </div>

                  {/* Challenge Prompt */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans pt-1">
                    Examine the handwritten doctor&apos;s prescription sheet in the PACS viewer, audit patient demographics, verify drug dosages, and make the clinical dispensing decision.
                  </p>

                  {/* Badges Strip */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-[10px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Blind Clinical Audit
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Stethoscope className="w-3 h-3 text-[#0E57A4]" />
                      5 Review Steps
                    </span>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-3 group-hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Interactive Simulation</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0E57A4] group-hover:bg-[#0A4482] text-white text-xs font-bold transition shadow-xs group-hover:scale-[1.02]">
                    <span>Start Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrescriptionCasePicker;
