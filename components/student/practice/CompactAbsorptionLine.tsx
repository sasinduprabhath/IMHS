"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
  const isLargeCount = totalSteps > 12;

  // For small step counts (<=12), show all waypoints
  const displayWaypoints = React.useMemo(() => {
    if (!isLargeCount) {
      return waypoints.map((label, index) => ({
        index,
        label,
        pct: totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 100,
      }));
    }

    const milestones = [
      0,
      Math.floor((totalSteps - 1) * 0.25),
      Math.floor((totalSteps - 1) * 0.5),
      Math.floor((totalSteps - 1) * 0.75),
      totalSteps - 1,
    ];

    const uniqueMilestones = Array.from(new Set(milestones)).sort((a, b) => a - b);

    return uniqueMilestones.map((idx) => ({
      index: idx,
      label: waypoints[idx] || `${idx + 1}`,
      pct: (idx / (totalSteps - 1)) * 100,
    }));
  }, [waypoints, totalSteps, isLargeCount]);

  const answeredNum = completedCount !== undefined ? completedCount : Math.round(clampedProgress * totalSteps);
  const pctNum = totalSteps > 0 ? Math.round((answeredNum / totalSteps) * 100) : 0;

  return (
    <div className={cn("w-full space-y-1.5", className)} aria-hidden="true">
      {/* Progress Track */}
      <div className="relative h-2 bg-slate-200/80 rounded-full overflow-hidden">
        {/* Animated Gradient Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out shadow-2xs"
          style={{
            width: `${clampedProgress * 100}%`,
            background: "linear-gradient(90deg, #0E57A4 0%, #2172C9 50%, #4A8B7A 100%)",
          }}
        />

        {/* Render node dots only for small step counts */}
        {!isLargeCount && totalSteps > 1 &&
          Array.from({ length: totalSteps }).map((_, i) => {
            const pct = (i / (totalSteps - 1)) * 100;
            const isDone = completedCount !== undefined ? i < completedCount : i < stepIndex;
            const isCurrent = i === stepIndex;
            return (
              <div
                key={i}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-300",
                  isDone
                    ? "w-2.5 h-2.5 bg-[#0E57A4] border-[#0E57A4]"
                    : isCurrent
                    ? "w-3.5 h-3.5 bg-white border-[#0E57A4] shadow-md ring-2 ring-[#0E57A4]/30"
                    : "w-2 h-2 bg-white border-slate-300"
                )}
                style={{ left: `${pct}%` }}
              />
            );
          })}
      </div>

      {/* Waypoint labels */}
      {waypoints.length > 0 && (
        <div className="flex justify-between items-center px-0.5 text-[10px] font-mono">
          {isLargeCount ? (
            <>
              <span className="text-slate-500 font-bold">Q1</span>
              <span className="text-[#0E57A4] font-extrabold bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">
                {pctNum}% Complete ({answeredNum} of {totalSteps} Answered)
              </span>
              <span className="text-slate-500 font-bold">Q{totalSteps}</span>
            </>
          ) : (
            displayWaypoints.map(({ index, label }) => (
              <span
                key={index}
                className={cn(
                  "font-bold uppercase tracking-wider text-center leading-tight transition-colors",
                  index === stepIndex
                    ? "text-[#0E57A4]"
                    : index < stepIndex
                    ? "text-[#4A8B7A]"
                    : "text-slate-400"
                )}
              >
                {label}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}
