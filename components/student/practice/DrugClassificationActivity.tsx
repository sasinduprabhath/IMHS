"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, ChevronRight, CheckCircle2, RotateCcw, Trophy, Pill, Zap, AlertCircle, ArrowRight, BookOpen, ChevronLeft
} from "lucide-react";
import { ActivityShell } from "./ActivityShell";
import { FeedbackOverlay } from "./FeedbackOverlay";
import { OptionButton } from "./OptionButton";
import type { Drug, OptionState } from "@/types/pharmacology";

const STEPS = [
  "Medicine",
  "Drug Class",
  "Mechanism",
  "Side Effects",
  "Interactions",
  "Antidote",
];

interface StepScore {
  correct: number;
  total: number;
}

interface DrugClassificationActivityProps {
  drug: Drug;
}

// Multi-select step component
function MultiSelectStep({
  options,
  correct,
  label,
  onScore,
}: {
  options: string[];
  correct: string[];
  label: string;
  onScore: (score: StepScore) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (opt: string) => {
    if (submitted) return;
    setSelected((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
  };

  const submit = () => {
    setSubmitted(true);
    const correctSelections = selected.filter((s) => correct.includes(s)).length;
    const incorrectSelections = selected.filter((s) => !correct.includes(s)).length;
    const score = Math.max(0, correctSelections - incorrectSelections);
    onScore({ correct: score, total: correct.length });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase">
        <span>Select all applicable {label}:</span>
        <span className="text-[#0E57A4]">{selected.length} selected</span>
      </div>

      <div className="space-y-2.5">
        {options.map((opt, i) => {
          let state: OptionState = "idle";
          if (submitted) {
            if (correct.includes(opt)) state = "revealed";
            if (correct.includes(opt) && selected.includes(opt)) state = "correct";
            if (!correct.includes(opt) && selected.includes(opt)) state = "incorrect";
          } else if (selected.includes(opt)) {
            state = "selected";
          }
          return (
            <OptionButton
              key={opt}
              index={i}
              label={opt}
              state={state}
              onClick={() => toggle(opt)}
              disabled={submitted}
              isMultiSelect
              isMultiSelected={selected.includes(opt)}
            />
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="w-full mt-3 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0E57A4] hover:bg-[#0A4482] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          Submit Selection ({selected.length})
        </button>
      )}

      {submitted && (
        <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Clinical Answer:
          </div>
          <p className="text-xs text-emerald-700 font-mono pl-5">
            {correct.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export function DrugClassificationActivity({ drug }: DrugClassificationActivityProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [scores, setScores] = useState<StepScore[]>([]);
  const [singleAnswer, setSingleAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; correctAnswer?: string } | null>(null);
  const [stepDone, setStepDone] = useState(false);
  const [step3Submitted, setStep3Submitted] = useState(false);
  const [step4Submitted, setStep4Submitted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const totalScore = scores.reduce((sum, s) => sum + s.correct, 0);
  const maxScore =
    scores.reduce((sum, s) => sum + s.total, 0) +
    [1, 1, drug.commonSideEffects.length, drug.keyInteractions.length, 1]
      .slice(scores.length)
      .reduce((a, b) => a + b, 0);

  const recordSingleScore = useCallback((correct: boolean) => {
    setScores((prev) => [...prev, { correct: correct ? 1 : 0, total: 1 }]);
  }, []);

  const handleSingleSelect = (index: number, options: string[], correctIndex: number) => {
    if (stepDone) return;
    setSingleAnswer(index);
    const isCorrect = index === correctIndex;
    setFeedback({ show: true, isCorrect, correctAnswer: options[correctIndex] });
    recordSingleScore(isCorrect);
    setStepDone(true);
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
      setSingleAnswer(null);
      setFeedback(null);
      setStepDone(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setStepIndex(0);
    setScores([]);
    setSingleAnswer(null);
    setFeedback(null);
    setStepDone(false);
    setCompleted(false);
  };

  const handleExit = () => router.push("/dashboard/practice");

  // ── Results screen ────────────────────────────────────────────────────────
  if (completed) {
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const grade = pct >= 80 ? "Excellent Mastery" : pct >= 60 ? "Good Understanding" : "Keep Practising";
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-[#0E57A4]" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Activity Complete!</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">{drug.genericName} — Drug Classification</p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FA] to-white rounded-2xl border border-[#0E57A4]/20 p-5 space-y-1">
            <div className="text-5xl font-mono font-bold text-[#0E57A4]">
              {totalScore}<span className="text-xl text-slate-400">/{maxScore}</span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-600">{pct}% · {grade}</div>
          </div>

          <div className="space-y-2 text-left">
            {STEPS.slice(1).map((step, i) => {
              const s = scores[i];
              if (!s) return null;
              return (
                <div key={step} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-800 font-bold">{step}</span>
                  <span className={s.correct === s.total ? "text-[#4A8B7A] font-bold font-mono" : "text-[#C1443A] font-bold font-mono"}>
                    {s.correct}/{s.total}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={handleExit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> Practice Hub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Step renderer ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (stepIndex) {
      // ─ Step 0: Medicine Name Display ─────────────────────────────────────
      case 0:
        return (
          <div className="space-y-6 text-center max-w-lg mx-auto py-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#0E57A4] bg-[#EBF3FA] px-3.5 py-1.5 rounded-full border border-[#0E57A4]/20 shadow-xs">
                <FlaskConical className="w-3.5 h-3.5" />
                Featured Medicine Profile
              </span>

              <div className="bg-gradient-to-br from-[#EBF3FA] via-white to-[#F8FAFC] rounded-3xl border-2 border-[#0E57A4]/20 shadow-xl p-8 space-y-3">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Generic Medicine Name</p>
                <h1 className="text-4xl font-display font-bold text-slate-900">{drug.genericName}</h1>
                {drug.brandNames && drug.brandNames.length > 0 && (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
                    {drug.brandNames.map((brand, i) => (
                      <span key={i} className="text-xs font-mono font-semibold text-[#0E57A4] bg-white border border-[#0E57A4]/20 px-2.5 py-0.5 rounded-md shadow-xs">
                        {brand}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Inspect the drug above. You will be asked to identify its pharmacological class, MOA, side effects, interactions, and antidote across 5 interactive steps.
              </p>
            </motion.div>
          </div>
        );

      // ─ Step 1: Drug Class ──────────────────────────────────────────────
      case 1: {
        const options = [
          drug.drugClass,
          "ACE Inhibitor",
          "Beta Blocker (β-blocker)",
          "Biguanide Antidiabetic",
        ].sort(() => 0);
        const correctIndex = options.indexOf(drug.drugClass);
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">Step 01</span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1">Pharmacological Class</h2>
              <p className="text-xs text-slate-600">Which pharmacological class does <strong className="text-slate-900">{drug.genericName}</strong> belong to?</p>
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  index={i}
                  label={opt}
                  state={
                    singleAnswer === null
                      ? "idle"
                      : singleAnswer === i
                      ? i === correctIndex ? "correct" : "incorrect"
                      : i === correctIndex && singleAnswer !== null ? "revealed" : "idle"
                  }
                  onClick={() => handleSingleSelect(i, options, correctIndex)}
                  disabled={stepDone}
                />
              ))}
            </div>
            {feedback?.show && (
              <FeedbackOverlay
                show
                isCorrect={feedback.isCorrect}
                correctAnswer={feedback.isCorrect ? undefined : options[correctIndex]}
              />
            )}
          </div>
        );
      }

      // ─ Step 2: Mechanism of Action ─────────────────────────────────────
      case 2: {
        const moa = drug.mechanismOfAction;
        const options = [
          moa,
          "Blocks ACE (Angiotensin-Converting Enzyme), reducing angiotensin II",
          "Stimulates β₂ adrenergic receptors, causing bronchodilation",
          "Inhibits COX-1 and COX-2, reducing prostaglandin synthesis",
        ];
        const correctIndex = 0;
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">Step 02</span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1">Mechanism of Action (MOA)</h2>
              <p className="text-xs text-slate-600">How does <strong className="text-slate-900">{drug.genericName}</strong> produce its clinical effect?</p>
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  index={i}
                  label={opt}
                  state={
                    singleAnswer === null
                      ? "idle"
                      : singleAnswer === i
                      ? i === correctIndex ? "correct" : "incorrect"
                      : i === correctIndex && singleAnswer !== null ? "revealed" : "idle"
                  }
                  onClick={() => handleSingleSelect(i, options, correctIndex)}
                  disabled={stepDone}
                />
              ))}
            </div>
            {feedback?.show && (
              <FeedbackOverlay show isCorrect={feedback.isCorrect} correctAnswer={options[correctIndex]} />
            )}
          </div>
        );
      }

      // ─ Step 3: Side Effects (multi-select) ─────────────────────────────
      case 3: {
        const allOpts = [
          ...drug.commonSideEffects.slice(0, 4),
          "Severe hypertension",
          "Hearing loss",
          "Visual disturbance",
          "Anaemia",
        ].slice(0, 6);
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">Step 03</span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1">Common Side Effects</h2>
              <p className="text-xs text-slate-600">Select all known adverse effects of <strong className="text-slate-900">{drug.genericName}</strong>.</p>
            </div>
            <MultiSelectStep
              options={allOpts}
              correct={drug.commonSideEffects.slice(0, 4)}
              label="side effects"
              onScore={(s) => {
                setScores((prev) => [...prev, s]);
                setStep3Submitted(true);
              }}
            />
          </div>
        );
      }

      // ─ Step 4: Drug Interactions (multi-select) ─────────────────────────
      case 4: {
        const interactionOpts = [
          ...drug.keyInteractions.slice(0, 3),
          "Vitamin C (ascorbic acid)",
          "Normal saline 0.9%",
          "Paracetamol 500 mg",
        ].slice(0, 6);
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">Step 04</span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1">Drug Interactions</h2>
              <p className="text-xs text-slate-600">Select all clinically significant interactions with <strong className="text-slate-900">{drug.genericName}</strong>.</p>
            </div>
            <MultiSelectStep
              options={interactionOpts}
              correct={drug.keyInteractions.slice(0, 3)}
              label="interactions"
              onScore={(s) => {
                setScores((prev) => [...prev, s]);
                setStep4Submitted(true);
              }}
            />
          </div>
        );
      }

      // ─ Step 5: Antidote / Reversal Agent ────────────────────────────────
      case 5: {
        const hasAntidote = !!drug.antidote;
        const options = hasAntidote
          ? [drug.antidote!, "No specific antidote available", "Atropine", "Naloxone"]
          : ["No specific antidote available", "Atropine", "Naloxone", "Flumazenil"];
        const correctIndex = 0;
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">Step 05</span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 mt-1">Antidote / Reversal Agent</h2>
              <p className="text-xs text-slate-600">What is the antidote or reversal agent for <strong className="text-slate-900">{drug.genericName}</strong>?</p>
              {!hasAntidote && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  This drug has no specific antidote — selecting &quot;No specific antidote available&quot; is correct.
                </div>
              )}
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  index={i}
                  label={opt}
                  state={
                    singleAnswer === null
                      ? "idle"
                      : singleAnswer === i
                      ? i === correctIndex ? "correct" : "incorrect"
                      : i === correctIndex && singleAnswer !== null ? "revealed" : "idle"
                  }
                  onClick={() => handleSingleSelect(i, options, correctIndex)}
                  disabled={stepDone}
                />
              ))}
            </div>
            {feedback?.show && (
              <FeedbackOverlay show isCorrect={feedback.isCorrect} correctAnswer={options[correctIndex]} />
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const canNext =
    stepIndex === 0 ||
    stepDone ||
    (stepIndex === 3 && step3Submitted) ||
    (stepIndex === 4 && step4Submitted);

  return (
    <ActivityShell
      title="Drug Classification Challenge"
      subtitle={drug.genericName}
      stepLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
      stepIndex={stepIndex}
      totalSteps={STEPS.length}
      waypoints={STEPS}
      onExit={handleExit}
      onBack={stepIndex > 0 ? () => { setStepIndex((s) => s - 1); setSingleAnswer(null); setFeedback(null); setStepDone(false); } : undefined}
      onNext={canNext ? handleNext : undefined}
      nextLabel={stepIndex === STEPS.length - 1 ? "Finish" : "Continue"}
      nextDisabled={!canNext}
      accentColor="#0E57A4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </ActivityShell>
  );
}
