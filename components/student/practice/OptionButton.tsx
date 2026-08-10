"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptionState } from "@/types/pharmacology";

const LETTER = ["A", "B", "C", "D", "E", "F"];

interface OptionButtonProps {
  index: number;
  label: string;
  state: OptionState;
  onClick?: () => void;
  disabled?: boolean;
  isMultiSelect?: boolean;
  isMultiSelected?: boolean;
  className?: string;
}

export function OptionButton({
  index,
  label,
  state,
  onClick,
  disabled = false,
  isMultiSelect = false,
  isMultiSelected = false,
  className,
}: OptionButtonProps) {
  const isAnswered = state === "correct" || state === "incorrect" || state === "revealed";

  // Style logic
  const baseStyle =
    "w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 select-none";

  const stateStyle = (() => {
    if (state === "correct")
      return "border-[#4A8B7A] bg-[#4A8B7A]/8 text-[#2d6655] shadow-sm";
    if (state === "incorrect")
      return "border-clinical-red bg-clinical-red-light text-clinical-red";
    if (state === "revealed")
      return "border-[#4A8B7A]/50 bg-[#4A8B7A]/5 text-[#2d6655] opacity-80";
    if (state === "selected")
      return "border-[#0E57A4] bg-[#EBF3FA] text-[#0E57A4] shadow-sm";
    if (disabled)
      return "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed";
    return "border-slate-200 bg-white text-ink hover:border-[#0E57A4]/60 hover:bg-[#EBF3FA]/60 hover:shadow-xs cursor-pointer";
  })();

  const letterStyle = (() => {
    if (state === "correct") return "bg-[#4A8B7A] text-white border-[#4A8B7A]";
    if (state === "incorrect") return "bg-clinical-red text-white border-clinical-red";
    if (state === "revealed") return "bg-[#4A8B7A]/20 text-[#2d6655] border-[#4A8B7A]/40";
    if (state === "selected") return "bg-[#0E57A4] text-white border-[#0E57A4]";
    return "bg-slate-100 text-ink-muted border-slate-200";
  })();

  return (
    <motion.button
      onClick={!disabled && !isAnswered ? onClick : undefined}
      disabled={disabled || isAnswered}
      whileTap={!disabled && !isAnswered ? { scale: 0.98 } : undefined}
      className={cn(baseStyle, stateStyle, className)}
      aria-pressed={isMultiSelect ? isMultiSelected : state === "selected"}
      aria-disabled={disabled || isAnswered}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "shrink-0 w-6 h-6 rounded-lg border text-[11px] font-mono font-bold flex items-center justify-center mt-0.5 transition-colors duration-200",
          letterStyle
        )}
        aria-hidden="true"
      >
        {LETTER[index] ?? index + 1}
      </span>

      {/* Label */}
      <span className="flex-1 text-sm font-sans leading-snug">{label}</span>

      {/* State icon — icon + implicit text via aria-label, never color alone */}
      {state === "correct" && (
        <CheckCircle2
          className="shrink-0 w-4.5 h-4.5 text-[#4A8B7A] mt-0.5"
          aria-label="Correct"
        />
      )}
      {state === "incorrect" && (
        <XCircle
          className="shrink-0 w-4.5 h-4.5 text-clinical-red mt-0.5"
          aria-label="Incorrect"
        />
      )}
      {state === "revealed" && (
        <CheckCircle2
          className="shrink-0 w-4.5 h-4.5 text-[#4A8B7A]/70 mt-0.5"
          aria-label="This was the correct answer"
        />
      )}
      {isMultiSelect && state === "idle" && (
        <div
          className={cn(
            "shrink-0 w-4 h-4 rounded border-2 mt-0.5 transition-colors",
            isMultiSelected ? "bg-[#0E57A4] border-[#0E57A4]" : "border-slate-300"
          )}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}
