"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { X, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { CompactAbsorptionLine } from "./CompactAbsorptionLine";

interface ActivityShellProps {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  stepIndex?: number;
  completedCount?: number;
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
  completedCount,
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

  const progress =
    completedCount !== undefined
      ? totalSteps > 0
        ? completedCount / totalSteps
        : 0
      : totalSteps > 1
      ? stepIndex / (totalSteps - 1)
      : 1;

  const handleExitClick = () => {
    if (onExit) {
      setShowExitConfirm(true);
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* ── Standalone Activity Header ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:px-6 sm:py-4 shadow-xs">
        <div className="flex items-center gap-4">
          {/* Exit button */}
          {onExit && (
            <button
              onClick={handleExitClick}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 shadow-2xs"
              aria-label="Exit activity"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-display font-bold text-slate-900 truncate">{title}</h2>
              {stepLabel && (
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-current/20"
                  style={{ background: `${accentColor}15`, color: accentColor }}
                >
                  {stepLabel}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Header extra slot (e.g., score ticker) */}
          {headerExtra && <div className="shrink-0">{headerExtra}</div>}
        </div>

        {/* Stepper / Absorption Line */}
        {totalSteps > 1 && (
          <div className="pt-3 border-t border-slate-100 mt-3">
            <CompactAbsorptionLine
              progress={progress}
              stepIndex={stepIndex}
              completedCount={completedCount}
              totalSteps={totalSteps}
              waypoints={waypoints}
            />
          </div>
        )}
      </div>

      {/* ── Unboxed Activity Content ────────────────────────────────────────── */}
      <div role="region" aria-label={stepLabel ?? title} aria-live="polite" className="w-full">
        {children}
      </div>

      {/* ── Standalone Footer Navigation ───────────────────────────────────── */}
      {showNav && (onBack || onNext) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:px-6 shadow-xs flex items-center justify-between gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-200 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>{backLabel}</span>
            </button>
          ) : (
            <div />
          )}

          {onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-7 py-2.5 rounded-xl text-white transition-all duration-200 shadow-sm",
                nextDisabled
                  ? "opacity-50 cursor-not-allowed bg-slate-300 text-slate-500"
                  : "hover:opacity-90 hover:shadow-md active:scale-95"
              )}
              style={{ background: nextDisabled ? undefined : accentColor }}
            >
              <span>{nextLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
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
                <h3 id="exit-confirm-title" className="font-display font-bold text-slate-900 text-base">
                  Exit this activity?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Your progress in this activity will be lost.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 text-xs font-bold text-slate-700 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit?.();
                }}
                className="flex-1 text-xs font-bold text-white py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
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
