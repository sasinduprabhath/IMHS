"use client";

import React, { useState } from "react";
import { ActivityShell } from "./ActivityShell";
import { SAMPLE_DRUGS } from "@/data/drugs";
import { Drug } from "@/types/pharmacology";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertTriangle, Pill, ShieldAlert, Check, RotateCcw,
  Sparkles, Layers, Activity, ChevronRight, Info, HelpCircle
} from "lucide-react";

export function DrugClassificationClient() {
  const [drugIndex, setDrugIndex] = useState(0);
  const currentDrug: Drug = SAMPLE_DRUGS[drugIndex] || SAMPLE_DRUGS[0];

  const [step, setStep] = useState(1); // 1 to 6

  // Student Responses
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedMOA, setSelectedMOA] = useState<string | null>(null);
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>([]);
  const [selectedInteractions, setSelectedInteractions] = useState<string[]>([]);
  const [selectedAntidote, setSelectedAntidote] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);

  const STEP_LABELS = [
    "01. Generic Medicine",
    "02. Drug Class",
    "03. Mechanism (MOA)",
    "04. Common Side Effects",
    "05. Key Interactions",
    "06. Antidote / Reversal",
  ];

  // Options Pool Generators
  const drugClassOptions = [
    currentDrug.drugClass,
    "ACE Inhibitor (Angiotensin Converting Enzyme Inhibitor)",
    "Beta-1 Selective Adrenoceptor Blocker",
    "HMG-CoA Reductase Inhibitor (Statin)",
    "Biguanide Antidiabetic Agent"
  ].sort();

  const moaOptions = [
    currentDrug.mechanismOfAction,
    "Inhibits bacterial 50S ribosomal subunit to stop protein synthesis.",
    "Competitively blocks H1 histamine receptors in bronchial smooth muscle.",
    "Binds to voltage-gated potassium channels to delay repolarization."
  ].sort();

  const antidoteOptions = [
    currentDrug.antidote || "No specific antidote / Not applicable",
    "Protamine Sulfate",
    "Flumazenil",
    "Naloxone Hydrochloride",
    "Atropine Sulfate"
  ].sort();

  // Multi-select Toggles
  const toggleSideEffect = (effect: string) => {
    setSelectedSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const toggleInteraction = (inter: string) => {
    setSelectedInteractions((prev) =>
      prev.includes(inter) ? prev.filter((i) => i !== inter) : [...prev, inter]
    );
  };

  // Next Step Validation
  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return selectedClass !== null;
    if (step === 3) return selectedMOA !== null;
    if (step === 4) return selectedSideEffects.length > 0;
    if (step === 5) return selectedInteractions.length > 0;
    if (step === 6) return selectedAntidote !== null;
    return true;
  };

  const handleNext = () => {
    if (step < 6) {
      setStep((s) => s + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Calculate Final Score
  const calculateScore = () => {
    let score = 0;

    // Step 2 Class (20 pts)
    if (selectedClass === currentDrug.drugClass) score += 20;

    // Step 3 MOA (20 pts)
    if (selectedMOA === currentDrug.mechanismOfAction) score += 20;

    // Step 4 Side Effects (20 pts)
    const validEffects = currentDrug.commonSideEffects;
    const correctFx = selectedSideEffects.filter((e) => validEffects.includes(e)).length;
    const incorrectFx = selectedSideEffects.filter((e) => !validEffects.includes(e)).length;
    score += Math.max(0, Math.round((correctFx / validEffects.length) * 20) - incorrectFx * 3);

    // Step 5 Interactions (20 pts)
    const validInters = currentDrug.keyInteractions;
    const correctInt = selectedInteractions.filter((i) => validInters.includes(i)).length;
    const incorrectInt = selectedInteractions.filter((i) => !validInters.includes(i)).length;
    score += Math.max(0, Math.round((correctInt / validInters.length) * 20) - incorrectInt * 3);

    // Step 6 Antidote (20 pts)
    const expectedAntidote = currentDrug.antidote || "No specific antidote / Not applicable";
    if (selectedAntidote === expectedAntidote) score += 20;

    return Math.min(100, Math.max(0, score));
  };

  const restartDrug = () => {
    setStep(1);
    setSelectedClass(null);
    setSelectedMOA(null);
    setSelectedSideEffects([]);
    setSelectedInteractions([]);
    setSelectedAntidote(null);
    setIsCompleted(false);
  };

  const switchDrug = (idx: number) => {
    setDrugIndex(idx);
    restartDrug();
  };

  // ── Render Completed Summary View ──
  if (isCompleted) {
    const finalScore = calculateScore();
    const passed = finalScore >= 70;
    const expectedAntidote = currentDrug.antidote || "No specific antidote / Not applicable";

    return (
      <ActivityShell
        title="Drug Classification Challenge — Results"
        subtitle={currentDrug.genericName}
        progress={1}
        stepLabel="Completed"
        hideFooter
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-paper border border-slate-200 space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-slate-200">
            <div className={cn(
              "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-sm",
              passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              {passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <span className="inline-block font-mono text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Pharmacology Classification Scorecard
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              {finalScore} <span className="text-slate-400 text-lg font-normal">/ 100</span>
            </h2>
            <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
              {passed
                ? `Outstanding pharmacology mastery of ${currentDrug.genericName}!`
                : `Good effort! Review the detailed pharmacological breakdown below.`}
            </p>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Pharmacological Audit Breakdown
            </h3>

            {/* Drug Class */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">1. Drug Class</span>
                <span className={selectedClass === currentDrug.drugClass ? "text-emerald-700 font-mono" : "text-[#C1443A] font-mono"}>
                  {selectedClass === currentDrug.drugClass ? "✓ Correct (+20 pts)" : "✗ Incorrect"}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                <strong>Correct Class:</strong> {currentDrug.drugClass}
              </p>
            </div>

            {/* MOA */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">2. Mechanism of Action</span>
                <span className={selectedMOA === currentDrug.mechanismOfAction ? "text-emerald-700 font-mono" : "text-[#C1443A] font-mono"}>
                  {selectedMOA === currentDrug.mechanismOfAction ? "✓ Correct (+20 pts)" : "✗ Incorrect"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>MOA Details:</strong> {currentDrug.mechanismOfAction}
              </p>
            </div>

            {/* Antidote */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">3. Antidote / Reversal Agent</span>
                <span className={selectedAntidote === expectedAntidote ? "text-emerald-700 font-mono" : "text-[#C1443A] font-mono"}>
                  {selectedAntidote === expectedAntidote ? "✓ Correct (+20 pts)" : "✗ Incorrect"}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                <strong>Antidote Result:</strong> {expectedAntidote}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={restartDrug}
              className="w-full sm:w-auto text-xs font-semibold rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry This Drug
            </Button>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {SAMPLE_DRUGS.map((d, idx) => (
                <Button
                  key={d.id}
                  type="button"
                  variant={drugIndex === idx ? "default" : "outline"}
                  onClick={() => switchDrug(idx)}
                  className={cn(
                    "text-xs font-mono rounded-xl flex-1 sm:flex-initial",
                    drugIndex === idx ? "bg-[#0E57A4] text-white" : ""
                  )}
                >
                  {d.genericName.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ActivityShell>
    );
  }

  // ── Main Step-by-Step Layout ──
  return (
    <ActivityShell
      title="Drug Classification Challenge"
      subtitle={currentDrug.genericName}
      progress={step / 6}
      stepLabel={`Step ${step} of 6`}
      stepsCount={6}
      currentStepIndex={step}
      stepLabels={STEP_LABELS}
      onBack={step > 1 ? handleBack : undefined}
      onNext={handleNext}
      disableNext={!canProceed()}
      nextLabel={step === 6 ? "Finish & Review" : "Continue to Step " + (step + 1)}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Medicine Prescription Header Badge */}
        <div className="bg-gradient-to-r from-[#0C1A30] to-[#0A2540] text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#F16726] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Pill className="w-4 h-4" /> ℞ Generic Medicine Profile
            </span>
            <span className="text-[10px] font-mono bg-white/10 border border-white/20 px-3 py-1 rounded-full text-slate-300">
              Drug 0{drugIndex + 1} of {SAMPLE_DRUGS.length}
            </span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-wide">
            {currentDrug.genericName}
          </h2>
          {currentDrug.brandNames && (
            <p className="text-xs font-mono text-slate-400">
              Brand Names: {currentDrug.brandNames.join(", ")}
            </p>
          )}
        </div>

        {/* STEP 01: Show the Medicine */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 01 of 06 — Generic Medicine Overview
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Identify &amp; Audit Generic Name
              </h3>
              <p className="text-xs text-slate-600">
                Review the active pharmaceutical ingredient (API) generic name above before identifying its therapeutic class and pharmacology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Dosage Forms</span>
                <p className="text-xs font-bold text-slate-900">{currentDrug.dosageForms.join(", ")}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Common Strengths</span>
                <p className="text-xs font-bold text-slate-900">{currentDrug.commonStrengths.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 02: Identify Drug Class */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 02 of 06 — Pharmacological Classification
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Select the Correct Drug Class for {currentDrug.genericName}
              </h3>
            </div>

            <div className="space-y-2.5">
              {drugClassOptions.map((cls) => {
                const checked = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between",
                      checked
                        ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] ring-2 ring-[#0E57A4]/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    )}
                  >
                    <span>{cls}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                      checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 03: Mechanism of Action */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 03 of 06 — Mechanism of Action
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Select the Mechanism of Action (MOA)
              </h3>
            </div>

            <div className="space-y-2.5">
              {moaOptions.map((moa) => {
                const checked = selectedMOA === moa;
                return (
                  <button
                    key={moa}
                    type="button"
                    onClick={() => setSelectedMOA(moa)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start justify-between gap-3",
                      checked
                        ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] font-semibold ring-2 ring-[#0E57A4]/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    )}
                  >
                    <span>{moa}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                      checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 04: Side Effects */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 04 of 06 — Adverse Drug Reactions
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Identify Common Side Effects
              </h3>
              <p className="text-xs text-slate-600">Select all applicable side effects associated with this medicine.</p>
            </div>

            <div className="space-y-2">
              {[
                ...currentDrug.commonSideEffects,
                "Acute pancreatitis",
                "Transient myopia"
              ].map((fx) => {
                const checked = selectedSideEffects.includes(fx);
                return (
                  <label
                    key={fx}
                    onClick={() => toggleSideEffect(fx)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                      checked
                        ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] font-semibold"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    )}
                  >
                    <span>{fx}</span>
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 05: Drug Interactions */}
        {step === 5 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 05 of 06 — Drug Interactions
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Identify Clinically Relevant Interactions
              </h3>
              <p className="text-xs text-slate-600">Select key drug-drug and drug-food interactions.</p>
            </div>

            <div className="space-y-2">
              {[
                ...currentDrug.keyInteractions,
                "No significant drug interactions exist for this drug class"
              ].map((inter) => {
                const checked = selectedInteractions.includes(inter);
                return (
                  <label
                    key={inter}
                    onClick={() => toggleInteraction(inter)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all select-none leading-snug",
                      checked
                        ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] font-semibold"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    )}
                  >
                    <span>{inter}</span>
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ml-2",
                      checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 06: Antidote / Reversal Agent */}
        {step === 6 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                Step 06 of 06 — Clinical Toxicology
              </span>
              <h3 className="text-xl font-display font-bold text-slate-900">
                Select Antidote / Reversal Agent
              </h3>
              <p className="text-xs text-slate-600">
                Identify the specific pharmacological antidote, or select &ldquo;No specific antidote&rdquo; if not applicable.
              </p>
            </div>

            <div className="space-y-2.5">
              {antidoteOptions.map((ant) => {
                const checked = selectedAntidote === ant;
                return (
                  <button
                    key={ant}
                    type="button"
                    onClick={() => setSelectedAntidote(ant)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between",
                      checked
                        ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] ring-2 ring-[#0E57A4]/20"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    )}
                  >
                    <span>{ant}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                      checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                    )}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}
