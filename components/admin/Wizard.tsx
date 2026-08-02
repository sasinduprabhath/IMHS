"use client";

import React from "react";
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onNext?: () => Promise<boolean | void> | boolean | void;
  onBack?: () => void;
  onComplete?: () => Promise<void> | void;
  isSaving?: boolean;
  canSkipNext?: boolean;
  skipNextLabel?: string;
  onSkipNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function Wizard({
  steps,
  currentStepIndex,
  onStepChange,
  onNext,
  onBack,
  onComplete,
  isSaving = false,
  canSkipNext = false,
  skipNextLabel = "Skip — assign later",
  onSkipNext,
  nextLabel,
  backLabel = "Back",
  children,
}: WizardProps) {
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNextClick = async () => {
    if (onNext) {
      const res = await onNext();
      if (res === false) return; // validation error
    }
    if (isLastStep) {
      if (onComplete) await onComplete();
    } else {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  return (
    <div className="space-y-8 bg-surface border border-chart-grid rounded-card p-6 sm:p-8 shadow-paper">
      
      {/* ── TOP STEPPER INDICATOR ── */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-center justify-between min-w-[600px] relative px-4">
          {/* Connector Line Background */}
          <div className="absolute top-4 left-10 right-10 h-0.5 bg-chart-grid -z-0" />
          
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                onClick={() => isCompleted && onStepChange(idx)}
                className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer select-none group ${
                  !isCompleted && !isCurrent ? "pointer-events-none" : ""
                }`}
              >
                {/* Number Circle / Checkmark */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? "bg-clinical-teal text-white shadow-sm"
                      : isCurrent
                      ? "bg-clinical-teal text-white ring-4 ring-clinical-teal/20 shadow-md scale-110"
                      : "bg-surface border-2 border-chart-grid text-sage"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>

                {/* Step Title & Subtitle */}
                <div className="text-center">
                  <span
                    className={`block text-xs font-mono font-bold transition-colors ${
                      isCurrent
                        ? "text-clinical-teal"
                        : isCompleted
                        ? "text-ink"
                        : "text-sage"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="block text-[10px] text-sage font-sans max-w-[100px] truncate">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP CONTENT AREA ── */}
      <div className="py-4 border-t border-b border-chart-grid min-h-[320px]">
        {children}
      </div>

      {/* ── BOTTOM BUTTON CONTROLS ── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handleBackClick}
          disabled={isFirstStep || isSaving}
          className="gap-2 text-xs font-mono"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Button>

        <div className="flex items-center gap-3">
          {canSkipNext && onSkipNext && (
            <Button
              variant="ghost"
              onClick={onSkipNext}
              disabled={isSaving}
              className="text-xs font-mono text-sage hover:text-ink"
            >
              {skipNextLabel}
            </Button>
          )}

          <Button
            onClick={handleNextClick}
            disabled={isSaving}
            className="gap-2 bg-clinical-teal hover:bg-chart-red text-white border-0 font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                {nextLabel || (isLastStep ? "Finish & Publish" : "Continue")} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

    </div>
  );
}
