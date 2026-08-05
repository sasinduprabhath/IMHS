"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * DoseCurve - pharmacokinetic absorption/elimination curve in --chart-red.
 * Three variants:
 *   "hero"     - full-width animated draw-in, used under a hero headline word.
 *   "divider"  - short segment used as the connector between enrollment steps.
 *   "timeline" - continuous curve through numbered step nodes (About page).
 */

interface DoseCurveProps {
  variant?: "hero" | "divider" | "timeline";
  className?: string;
  /** Number of steps for timeline variant */
  steps?: number;
}

// Hero variant: a smooth rise-peak-decay absorption curve (Cmax shape)
// Drawn across the full width, animates pathLength 0→1 on mount.
// Hero variant: a smooth rise-peak-decay absorption curve (Cmax shape)
// Drawn across the full width, animates pathLength 0→1 on mount.
function HeroDoseCurve({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 350 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={cn("w-full h-5 sm:h-7 overflow-visible pointer-events-none", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Glow Filter */}
        <filter id="heroDoseGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Linear Gradient for Stroke */}
        <linearGradient id="heroDoseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F16726" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#FF7A38" stopOpacity="1" />
          <stop offset="70%" stopColor="#0E57A4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F16726" stopOpacity="0.75" />
        </linearGradient>

        {/* Soft Area Fill Gradient */}
        <linearGradient id="heroDoseFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F16726" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F16726" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill under curve */}
      {!shouldReduce && (
        <motion.path
          d="M 0 30 C 70 30, 120 25, 175 6 C 230 25, 280 30, 350 30 L 350 40 L 0 40 Z"
          fill="url(#heroDoseFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      )}

      {/* Main Curve Stroke */}
      {shouldReduce ? (
        <path
          d="M 0 30 C 70 30, 120 25, 175 6 C 230 25, 280 30, 350 30"
          stroke="url(#heroDoseGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#heroDoseGlow)"
        />
      ) : (
        <motion.path
          d="M 0 30 C 70 30, 120 25, 175 6 C 230 25, 280 30, 350 30"
          stroke="url(#heroDoseGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#heroDoseGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      )}

      {/* Glowing Pulse Dot at Cmax Peak */}
      {!shouldReduce && (
        <g>
          <motion.circle
            cx="175"
            cy="6"
            r="6"
            fill="#F16726"
            opacity="0.35"
            animate={{ scale: [1, 1.8, 1], opacity: [0.35, 0, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="175"
            cy="6"
            r="3.5"
            fill="#FFFFFF"
            stroke="#F16726"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          />
        </g>
      )}
    </svg>
  );
}

// Divider variant: a short smooth arc, used as the connector between enrollment steps.
// Renders as an inline SVG that replaces the dashed horizontal rule.
function DividerDoseCurve({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-5 overflow-visible pointer-events-none opacity-40", className)}
      aria-hidden="true"
    >
      {shouldReduce ? (
        <path
          d="M 0 10 C 30 10, 40 3, 60 2 C 80 3, 90 10, 120 10"
          stroke="var(--chart-red, #e03131)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <motion.path
          d="M 0 10 C 30 10, 40 3, 60 2 C 80 3, 90 10, 120 10"
          stroke="var(--chart-red, #e03131)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}
    </svg>
  );
}

// Timeline variant: a continuous dose-curve line through step nodes.
// Connects steps vertically (mobile) or horizontally (desktop) on the About page.
function TimelineDoseCurve({ steps = 4, className }: { steps?: number; className?: string }) {
  const shouldReduce = useReducedMotion();
  const width = 100 * steps;
  // Build a smooth S-curve across step nodes
  const nodePositions = Array.from({ length: steps }, (_, i) => ({
    x: i * 100 + 50,
    y: i % 2 === 0 ? 20 : 40,
  }));

  const d = nodePositions.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = nodePositions[i - 1];
    const cpx1 = prev.x + 40;
    const cpx2 = pt.x - 40;
    return `${path} C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  return (
    <svg
      viewBox={`0 0 ${width} 60`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={cn("w-full h-8 overflow-visible pointer-events-none", className)}
      aria-hidden="true"
    >
      {shouldReduce ? (
        <path
          d={d}
          stroke="var(--chart-red, #e03131)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      ) : (
        <motion.path
          d={d}
          stroke="var(--chart-red, #e03131)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
      )}
    </svg>
  );
}

export function DoseCurve({ variant = "hero", className, steps }: DoseCurveProps) {
  if (variant === "hero") return <HeroDoseCurve className={className} />;
  if (variant === "divider") return <DividerDoseCurve className={className} />;
  return <TimelineDoseCurve steps={steps} className={className} />;
}
