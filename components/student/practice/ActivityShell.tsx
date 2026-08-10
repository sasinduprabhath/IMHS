"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompactAbsorptionLine } from "./CompactAbsorptionLine";
import { cn } from "@/lib/utils";

interface ActivityShellProps {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  progress?: number; // 0 to 1
  stepsCount?: number;
  currentStepIndex?: number;
  stepLabels?: string[];
  onExit?: () => void;
  onBack?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isSubmitting?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}

export function ActivityShell({
  title,
  subtitle,
  stepLabel,
  progress = 0,
  stepsCount,
  currentStepIndex,
  stepLabels,
  onExit,
  onBack,
  onNext,
  disableNext = false,
  nextLabel = "Continue",
  backLabel = "Back",
  isSubmitting = false,
  hideFooter = false,
  children,
}: ActivityShellProps) {
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitClick = () => {
    if (onExit) {
      onExit();
    } else {
      setShowExitConfirm(true);
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    router.push("/dashboard/practice");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExitClick}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Exit Activity"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-display font-bold text-slate-900 leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 font-sans hidden sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stepLabel && (
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[#0E57A4]">
                  {stepLabel}
                </span>
              )}
              <button
                type="button"
                onClick={handleExitClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Exit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Absorption Line */}
          <CompactAbsorptionLine
            progress={progress}
            stepsCount={stepsCount}
            currentStepIndex={currentStepIndex}
            stepLabels={stepLabels}
          />
        </div>
      </header>

      {/* ── Main Activity Content Body ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Sticky Bottom Footer Bar ── */}
      {!hideFooter && (
        <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-6 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            {onBack ? (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="text-xs font-semibold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-100 gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{backLabel}</span>
              </Button>
            ) : (
              <div />
            )}

            {onNext && (
              <Button
                type="button"
                disabled={disableNext || isSubmitting}
                onClick={onNext}
                className={cn(
                  "text-xs font-bold rounded-xl shadow-xs gap-1.5 px-6 transition-all",
                  disableNext
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border-0"
                    : "bg-[#0E57A4] hover:bg-[#0c4a8e] text-white border-0"
                )}
              >
                <span>{isSubmitting ? "Processing…" : nextLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </footer>
      )}

      {/* ── Exit Confirmation Dialog Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-display font-bold text-slate-900">
                  Exit Learning Activity?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Your current session progress for this activity will not be saved. Are you sure you want to exit back to the Interactive Hub?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="text-xs font-semibold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-100"
              >
                Continue Activity
              </Button>
              <Button
                type="button"
                onClick={confirmExit}
                className="text-xs font-bold bg-[#C1443A] hover:bg-[#a6372f] text-white rounded-xl shadow-xs"
              >
                Exit Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
