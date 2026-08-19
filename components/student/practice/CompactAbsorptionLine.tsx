"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CompactAbsorptionLineProps {
  progress: number;          // 0–1
  stepIndex: number;         // current step (0-based)
  completedCount?: number;   // number of answered/completed items
  totalSteps: number;
  waypoints?: string[];      // optional step labels
  className?: string;
}

export function CompactAbsorptionLine({
  progress,
  stepIndex,
  completedCount,
  totalSteps,
  waypoints = [],
  className,
}: CompactAbsorptionLineProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const isLargeCount = totalSteps > 10;

  const answeredNum = completedCount !== undefined ? completedCount : Math.round(clampedProgress * totalSteps);
  const pctNum = totalSteps > 0 ? Math.round((answeredNum / totalSteps) * 100) : 0;

  return (
    <div className={cn("w-full py-1", className)} aria-hidden="true">
      {isLargeCount ? (
        /* ── Continuous Progress Bar for large sets (e.g. 20+ questions) ── */
        <div className="space-y-2">
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${clampedProgress * 100}%`,
                background: "linear-gradient(90deg, #0E57A4 0%, #2563EB 100%)",
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-500 font-bold">Start</span>
            <span className="text-[#0E57A4] font-extrabold bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">
              {pctNum}% Completed ({answeredNum}/{totalSteps})
            </span>
            <span className="text-slate-500 font-bold">Finish</span>
          </div>
        </div>
      ) : (
        /* ── Stepper Track for 3–8 Step Challenges (Zero Clipping) ── */
        <div className="relative pt-1 pb-1">
          {/* Connecting Background Line */}
          <div className="absolute top-[13px] left-6 right-6 h-1 bg-slate-200 rounded-full -z-0" />

          {/* Connecting Active Progress Line */}
          <div
            className="absolute top-[13px] left-6 h-1 bg-[#0E57A4] rounded-full transition-all duration-500 ease-out -z-0"
            style={{
              width: totalSteps > 1
                ? `calc(${(stepIndex / (totalSteps - 1)) * 100}% - ${((stepIndex / (totalSteps - 1)) * 12)}px)`
                : "0%",
              maxWidth: "calc(100% - 48px)",
            }}
          />

          {/* Stepper Columns Grid */}
          <div className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isDone = completedCount !== undefined ? idx < completedCount : idx < stepIndex;
              const isCurrent = idx === stepIndex;
              const label = waypoints[idx] || `Step ${idx + 1}`;

              return (
                <div key={idx} className="flex flex-col items-center text-center group">
                  {/* Step Circle Node */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 shadow-xs",
                      isDone
                        ? "bg-[#0E57A4] text-white border-2 border-[#0E57A4]"
                        : isCurrent
                        ? "bg-white text-[#0E57A4] border-2 border-[#0E57A4] ring-4 ring-[#0E57A4]/15 scale-110"
                        : "bg-white text-slate-400 border-2 border-slate-300"
                    )}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider mt-1.5 line-clamp-1 transition-colors px-0.5",
                      isCurrent
                        ? "text-[#0E57A4]"
                        : isDone
                        ? "text-slate-700"
                        : "text-slate-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompactAbsorptionLine;
