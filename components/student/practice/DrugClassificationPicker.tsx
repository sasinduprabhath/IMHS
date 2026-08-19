"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical, Search, ArrowRight, Sparkles,
  ChevronLeft, Pill, ShieldCheck, HelpCircle, Activity, Stethoscope
} from "lucide-react";
import type { Drug } from "@/types/pharmacology";

interface DrugClassificationPickerProps {
  drugs: Drug[];
}

export function DrugClassificationPicker({ drugs }: DrugClassificationPickerProps) {
  const [search, setSearch] = useState("");

  const filteredDrugs = drugs.filter((d) => {
    const matchesSearch =
      d.genericName.toLowerCase().includes(search.toLowerCase()) ||
      (d.brandNames && d.brandNames.some((b) => b.toLowerCase().includes(search.toLowerCase())));
    return matchesSearch;
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Activity 02 · Medicine Selection
              </span>
              <span className="text-xs font-mono text-white/70">
                {drugs.length} Formulary Medicines Available
              </span>
            </div>

            <div className="space-y-1 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Select a Medicine to Classify
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-sans">
                Pick any pharmaceutical agent below to begin the 5-step classification challenge: classify pharmacological family, mechanism of action, side effects, interactions, and antidotes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by generic name or brand name (e.g. Amlodipine, Metformin)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition"
          />
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 shrink-0 pr-2">
          Total: {filteredDrugs.length} Medicines
        </span>
      </div>

      {/* ── Medicine Cards Grid (Full-Container Accessible Link) ────────── */}
      {filteredDrugs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-slate-900 text-base">No medicines match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching with another generic medicine name.
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline pt-2"
          >
            Show all medicines
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrugs.map((drug, idx) => (
            <motion.div
              key={drug.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="h-full"
            >
              <Link
                href={`/dashboard/practice/drug-classification?drug=${drug.id}`}
                aria-label={`Classify ${drug.genericName}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0E57A4] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer h-full block focus:outline-none focus:ring-2 focus:ring-[#0E57A4]/30"
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform shadow-xs">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-2 py-0.5 rounded-full border border-[#0E57A4]/20">
                          Medicine #{idx + 1}
                        </span>
                        <h2 className="text-lg font-display font-extrabold text-slate-900 mt-0.5 group-hover:text-[#0E57A4] transition-colors">
                          {drug.genericName}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Prompt */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Test your clinical pharmacology knowledge on this agent: classify its therapeutic class, MOA, adverse effects, interactions, and antidote.
                  </p>

                  {/* Brand Aliases if available */}
                  {drug.brandNames && drug.brandNames.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Brands:</span>
                      {drug.brandNames.slice(0, 3).map((b) => (
                        <span key={b} className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-2 group-hover:bg-slate-50 transition-colors">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    5-Step Challenge
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E57A4] group-hover:bg-[#0A4482] text-white text-xs font-bold transition shadow-xs group-hover:scale-[1.02]">
                    <span>Classify Drug</span>
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

export default DrugClassificationPicker;
