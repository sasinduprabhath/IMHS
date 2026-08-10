"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompactAbsorptionLineProps {
  progress: number; // 0 to 1
  stepsCount?: number;
  currentStepIndex?: number;
  stepLabels?: string[];
  className?: string;
}

export function CompactAbsorptionLine({
  progress,
  stepsCount = 6,
  currentStepIndex = 1,
  stepLabels,
  className,
}: CompactAbsorptionLineProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {/* Top track & filled bar */}
      <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
        {/* Animated fill gradient */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#0E57A4] via-[#4A8B7A] to-[#F16726] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Pulse glow leading node */}
        {safeProgress > 0 && safeProgress < 1 && (
          <motion.div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white/80 blur-[2px] rounded-full"
            style={{ left: `${safeProgress * 100}%` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Step nodes & waypoints readout */}
      {stepsCount > 0 && (
        <div className="flex items-center justify-between px-0.5 text-[10px] font-mono text-slate-500">
          <span className="font-semibold text-slate-700">
            {stepLabels && stepLabels[currentStepIndex - 1]
              ? stepLabels[currentStepIndex - 1]
              : `Step ${currentStepIndex} of ${stepsCount}`}
          </span>
          <span className="text-slate-400 font-bold">
            {Math.round(safeProgress * 100)}% Complete
          </span>
        </div>
      )}
    </div>
  );
}
