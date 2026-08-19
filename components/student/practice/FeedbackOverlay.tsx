"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackOverlayProps {
  show: boolean;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  className?: string;
}

export function FeedbackOverlay({
  show,
  isCorrect,
  correctAnswer,
  explanation,
  className,
}: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "rounded-2xl border p-4 flex items-start gap-3 shadow-xs",
            isCorrect
              ? "bg-emerald-50/90 border-emerald-200"
              : "bg-rose-50/90 border-rose-200",
            className
          )}
          role="status"
          aria-live="polite"
        >
          {/* Icon - never color alone */}
          <div className="shrink-0 mt-0.5">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            {/* Status label */}
            <p
              className={cn(
                "text-sm font-bold font-display",
                isCorrect ? "text-emerald-900" : "text-rose-900"
              )}
            >
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>

            {/* Correct answer reveal (only when wrong) */}
            {!isCorrect && correctAnswer && (
              <p className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Correct answer: </span>
                {correctAnswer}
              </p>
            )}

            {/* Explanation */}
            {explanation && (
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{explanation}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
