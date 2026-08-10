"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CompactAbsorptionLineProps {
  progress: number;          // 0–1
  stepIndex: number;         // current step (0-based)
  totalSteps: number;
  waypoints?: string[];      // optional step labels
  className?: string;
}

export function CompactAbsorptionLine({
  progress,
  stepIndex,
  totalSteps,
  waypoints = [],
  className,
}: CompactAbsorptionLineProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div className={cn("w-full", className)} aria-hidden="true">
      {/* Track */}
      <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedProgress * 100}%`,
            background: "linear-gradient(90deg, #0E57A4 0%, #2172C9 50%, #4A8B7A 100%)",
          }}
        />
        {/* Step nodes */}
        {totalSteps > 1 &&
          Array.from({ length: totalSteps }).map((_, i) => {
            const pct = (i / (totalSteps - 1)) * 100;
            const isDone = i < stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-300",
                  isDone
                    ? "w-2.5 h-2.5 bg-[#0E57A4] border-[#0E57A4]"
                    : isCurrent
                    ? "w-3 h-3 bg-white border-[#0E57A4] shadow-md ring-2 ring-[#0E57A4]/30"
                    : "w-2 h-2 bg-white border-slate-300"
                )}
                style={{ left: `${pct}%` }}
              />
            );
          })}
      </div>

      {/* Waypoint labels */}
      {waypoints.length > 0 && (
        <div className="flex justify-between mt-1.5 px-0">
          {waypoints.map((label, i) => (
            <span
              key={i}
              className={cn(
                "text-[9px] font-mono font-semibold uppercase tracking-wider truncate max-w-[72px] text-center leading-tight",
                i === stepIndex
                  ? "text-[#0E57A4]"
                  : i < stepIndex
                  ? "text-[#4A8B7A]"
                  : "text-slate-400"
              )}
              style={{ width: `${100 / waypoints.length}%` }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
