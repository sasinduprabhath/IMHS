"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VitalLineProps {
  className?: string;
  variant?: "hero" | "divider" | "card" | "progress";
  progress?: number; // 0 to 100 for progress bar
  animated?: boolean;
}

export function VitalLine({
  className,
  variant = "divider",
  progress = 0,
  animated = true,
}: VitalLineProps) {
  if (variant === "progress") {
    return (
      <div className={cn("relative w-full h-3 bg-linen-dark rounded-full overflow-hidden border border-chart-grid", className)}>
        <div
          className="h-full bg-clinical-teal transition-all duration-500 ease-out flex items-center justify-end relative"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {progress > 5 && (
            <svg
              className="h-full text-chart-red stroke-current stroke-[2.5] fill-none overflow-visible"
              viewBox="0 0 40 20"
              preserveAspectRatio="none"
            >
              <path d="M0,10 L10,10 L14,3 L18,17 L22,6 L26,12 L30,10 L40,10" />
            </svg>
          )}
        </div>
      </div>
    );
  }

  // Centered ECG Path with sharp QRS complex
  const ecgPath = "M0,20 L240,20 L255,20 L260,6 L268,34 L276,2 L284,26 L292,18 L300,20 L600,20";

  return (
    <div className={cn("w-full overflow-hidden py-2 flex items-center justify-center text-chart-red", className)}>
      <svg
        className={cn(
          "w-full stroke-current fill-none overflow-visible",
          variant === "hero" ? "h-8 md:h-12" : "h-5 md:h-6"
        )}
        viewBox="0 0 600 40"
        preserveAspectRatio="none"
      >
        {/* Faint Baseline Path */}
        <path
          d={ecgPath}
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-25"
          vectorEffect="non-scaling-stroke"
        />

        {/* Traveling Animated Pulse Wave (Real-time ECG Heartbeat Monitor) */}
        {animated ? (
          <motion.path
            d={ecgPath}
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0.2, pathOffset: 0, opacity: 0.4 }}
            animate={{
              pathOffset: [0, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ) : (
          <path
            d={ecgPath}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
