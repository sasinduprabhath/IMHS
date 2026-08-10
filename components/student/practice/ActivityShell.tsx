"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { X, AlertTriangle } from "lucide-react";
import { CompactAbsorptionLine } from "./CompactAbsorptionLine";

interface ActivityShellProps {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  stepIndex?: number;
  totalSteps?: number;
  waypoints?: string[];
  onExit?: () => void;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  showNav?: boolean;
  children: React.ReactNode;
  accentColor?: string;
  headerExtra?: React.ReactNode;
}

export function ActivityShell({
  title,
  subtitle,
  stepLabel,
  stepIndex = 0,
  totalSteps = 1,
  waypoints = [],
  onExit,
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  nextDisabled = false,
  showNav = true,
  children,
  accentColor = "#0E57A4",
  headerExtra,
}: ActivityShellProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const progress = totalSteps > 1 ? stepIndex / (totalSteps - 1) : 1;

  const handleExitClick = () => {
    if (onExit) {
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white">
      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Exit button */}
          {onExit && (
            <button
              onClick={handleExitClick}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-clinical-red hover:bg-clinical-red-light transition-all duration-200"
              aria-label="Exit activity"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-display font-bold text-ink truncate">{title}</h2>
              {stepLabel && (
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${accentColor}18`, color: accentColor }}
                >
                  {stepLabel}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-ink-muted mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Header extra slot (e.g., score ticker) */}
          {headerExtra && <div className="shrink-0">{headerExtra}</div>}
        </div>

        {/* Compact Absorption Line */}
        {totalSteps > 1 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2">
            <CompactAbsorptionLine
              progress={progress}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              waypoints={waypoints}
            />
          </div>
        )}
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main
        className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8"
        // Step focus management: aria-live region for SR
      >
        <div role="region" aria-label={stepLabel ?? title} aria-live="polite">
          {children}
        </div>
      </main>

      {/* ── Navigation Footer ───────────────────────────────────────────── */}
      {showNav && (onBack || onNext) && (
        <footer className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-md border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200"
              >
                ← {backLabel}
              </button>
            ) : (
              <div />
            )}

            {onNext && (
              <button
                onClick={onNext}
                disabled={nextDisabled}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl text-white transition-all duration-200 shadow-sm",
                  nextDisabled
                    ? "opacity-50 cursor-not-allowed bg-slate-400"
                    : "hover:opacity-90 hover:shadow-md active:scale-95"
                )}
                style={{ background: nextDisabled ? undefined : accentColor }}
              >
                {nextLabel} →
              </button>
            )}
          </div>
        </footer>
      )}

      {/* ── Exit Confirmation Modal ──────────────────────────────────────── */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 id="exit-confirm-title" className="font-display font-bold text-ink text-base">
                  Exit this activity?
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">Your progress in this activity will be lost.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 text-sm font-semibold text-ink py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit?.();
                }}
                className="flex-1 text-sm font-bold text-white py-2.5 rounded-xl bg-clinical-red hover:bg-clinical-red-hover transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
