"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronRight, CheckCircle2, RotateCcw, Trophy, Pill, Zap, AlertCircle, ArrowRight, BookOpen } from "lucide-react";
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
    setSelected((prev) => prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]);
  };

  const submit = () => {
    setSubmitted(true);
    // Partial credit: correct selections - incorrect selections, floored at 0
    const correctSelections = selected.filter((s) => correct.includes(s)).length;
    const incorrectSelections = selected.filter((s) => !correct.includes(s)).length;
    const score = Math.max(0, correctSelections - incorrectSelections);
    onScore({ correct: score, total: correct.length });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-ink-muted uppercase tracking-wider">
        Select all that apply:
      </p>
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
            isMultiSelect={!submitted}
            isMultiSelected={selected.includes(opt)}
          />
        );
      })}

      {!submitted && (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="w-full mt-2 py-3 rounded-xl text-sm font-bold text-white bg-[#0E57A4] hover:bg-[#0A4482] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          Submit Selection
        </button>
      )}

      {submitted && (
        <div className="mt-2 p-3 rounded-xl bg-[#4A8B7A]/10 border border-[#4A8B7A]/20">
          <p className="text-xs text-[#2d6655] font-mono">
            Correct answers: {correct.join(", ")}
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
  const [completed, setCompleted] = useState(false);

  const totalScore = scores.reduce((sum, s) => sum + s.correct, 0);
  const maxScore = scores.reduce((sum, s) => sum + s.total, 0) + [1, 1, drug.commonSideEffects.length, drug.keyInteractions.length, 1].slice(scores.length).reduce((a, b) => a + b, 0);

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
    const grade = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : "Keep Practising";
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 max-w-md w-full space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-[#0E57A4]" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-ink">Activity Complete!</h2>
            <p className="text-sm text-ink-muted mt-1">{drug.genericName} — Drug Classification</p>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FA] to-white rounded-2xl border border-[#0E57A4]/20 p-5 space-y-1">
            <div className="text-5xl font-mono font-bold text-[#0E57A4]">
              {totalScore}<span className="text-xl text-ink-muted">/{maxScore}</span>
            </div>
            <div className="text-xs font-mono text-ink-muted">{pct}% · {grade}</div>
          </div>

          <div className="space-y-2 text-left">
            {STEPS.slice(1).map((step, i) => {
              const s = scores[i];
              if (!s) return null;
              return (
                <div key={step} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-ink font-medium">{step}</span>
                  <span className={s.correct === s.total ? "text-[#4A8B7A] font-bold font-mono" : "text-clinical-red font-bold font-mono"}>
                    {s.correct}/{s.total}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={handleRestart} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={handleExit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors">
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
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#0E57A4] bg-[#EBF3FA] px-3 py-1 rounded-full border border-[#0E57A4]/20">
                <FlaskConical className="w-3 h-3" />
                Today&apos;s Medicine
              </span>

              <div className="bg-white rounded-3xl border-2 border-[#0E57A4]/20 shadow-glow p-8 space-y-2">
                <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">Generic Name</p>
                <h1 className="text-4xl font-display font-bold text-ink">{drug.genericName}</h1>
                {drug.brandNames && drug.brandNames.length > 0 && (
                  <p className="text-sm text-ink-muted font-mono">
                    {drug.brandNames.join(" · ")}
                  </p>
                )}
              </div>

              <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
                Review the drug name above. You will be asked to identify and classify this medicine across 5 steps.
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
        ].sort(() => 0); // keep deterministic
        const correctIndex = options.indexOf(drug.drugClass);
        return (
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-display font-bold text-ink">Drug Class</h2>
              <p className="text-sm text-ink-muted">Which pharmacological class does <strong>{drug.genericName}</strong> belong to?</p>
            </div>
            <div className="space-y-2.5">
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
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-display font-bold text-ink">Mechanism of Action</h2>
              <p className="text-sm text-ink-muted">How does <strong>{drug.genericName}</strong> work?</p>
            </div>
            <div className="space-y-2.5">
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
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-display font-bold text-ink">Common Side Effects</h2>
              <p className="text-sm text-ink-muted">Select all known side effects of <strong>{drug.genericName}</strong>.</p>
            </div>
            <MultiSelectStep
              options={allOpts}
              correct={drug.commonSideEffects.slice(0, 4)}
              label="side effects"
              onScore={(s) => setScores((prev) => [...prev, s])}
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
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-display font-bold text-ink">Drug Interactions</h2>
              <p className="text-sm text-ink-muted">Select all clinically significant interactions with <strong>{drug.genericName}</strong>.</p>
            </div>
            <MultiSelectStep
              options={interactionOpts}
              correct={drug.keyInteractions.slice(0, 3)}
              label="interactions"
              onScore={(s) => setScores((prev) => [...prev, s])}
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
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-display font-bold text-ink">Antidote / Reversal Agent</h2>
              <p className="text-sm text-ink-muted">What is the antidote or reversal agent for <strong>{drug.genericName}</strong>?</p>
              {!hasAntidote && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  This drug has no specific antidote — selecting the correct answer is valid.
                </div>
              )}
            </div>
            <div className="space-y-2.5">
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

  const canNext = stepIndex === 0 || stepDone || (stepIndex === 3) || (stepIndex === 4);

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
