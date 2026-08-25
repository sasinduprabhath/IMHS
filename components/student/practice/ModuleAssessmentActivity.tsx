"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RotateCcw, BookOpen, Trophy,
  ClipboardList, ChevronLeft, ChevronRight, Filter, AlertCircle,
  Sparkles, Check, ArrowRight
} from "lucide-react";
import { ActivityShell } from "./ActivityShell";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";
import type { QuizQuestion } from "@/types/pharmacology";
import { submitCourseAssessmentResult } from "@/actions/assessment-actions";

const AUTOSAVE_KEY = "imhs_module_assessment_state";

interface AssessmentState {
  moduleId: string;
  answers: Record<string, boolean | null>;
  currentIndex: number;
  startedAt: string;
}

interface ModuleAssessmentActivityProps {
  questions: QuizQuestion[];
  moduleId: string;
  moduleTitle?: string;
}

type ReviewFilter = "all" | "incorrect" | "unanswered";

export function ModuleAssessmentActivity({
  questions,
  moduleId,
  moduleTitle = "Module Assessment",
}: ModuleAssessmentActivityProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "test" | "results">("intro");
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [selectedThisQuestion, setSelectedThisQuestion] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const total = questions.length;
  const current = questions[currentIndex];

  // Cleanup auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // ─── LocalStorage autosave/resume ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== "test") return;
    const key = `${AUTOSAVE_KEY}_${moduleId}`;
    const payload: AssessmentState = {
      moduleId,
      answers,
      currentIndex,
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }, [answers, currentIndex, phase, moduleId]);

  const checkResume = useCallback(() => {
    const key = `${AUTOSAVE_KEY}_${moduleId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const state: AssessmentState = JSON.parse(stored);
        if (state.moduleId === moduleId && Object.keys(state.answers).length > 0) {
          return state;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  }, [moduleId]);

  const resumeState = checkResume();

  const startFresh = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    const key = `${AUTOSAVE_KEY}_${moduleId}`;
    localStorage.removeItem(key);
    setAnswers({});
    setCurrentIndex(0);
    setSelectedThisQuestion(null);
    setShowConfetti(false);
    setPhase("test");
  };

  const resumeSaved = () => {
    if (!resumeState) return;
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setAnswers(resumeState.answers);
    setCurrentIndex(resumeState.currentIndex);
    setSelectedThisQuestion(resumeState.answers[questions[resumeState.currentIndex]?.id] ?? null);
    setShowConfetti(false);
    setPhase("test");
  };

  const handleAnswer = (value: boolean) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

    setSelectedThisQuestion(value);
    const updatedAnswers = { ...answers, [current.id]: value };
    setAnswers(updatedAnswers);

    // Auto-advance smoothly after selection (350ms)
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentIndex < total - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setSelectedThisQuestion(updatedAnswers[questions[nextIdx]?.id] ?? null);
      } else {
        // Finished last question: compute result & transition
        setPhase("results");
        localStorage.removeItem(`${AUTOSAVE_KEY}_${moduleId}`);
        const computedCorrect = questions.filter((q) => updatedAnswers[q.id] === q.answer).length;
        if (total > 0 && computedCorrect / total >= 0.6) {
          setShowConfetti(true);
        }
        submitCourseAssessmentResult(moduleId, computedCorrect, total).catch((err) => {
          console.error("Failed to save course assessment result:", err);
        });
      }
    }, 350);
  };

  const handleNext = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setSelectedThisQuestion(null);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedThisQuestion(answers[questions[currentIndex + 1]?.id] ?? null);
    } else {
      setPhase("results");
      localStorage.removeItem(`${AUTOSAVE_KEY}_${moduleId}`);
      const computedCorrect = questions.filter((q) => answers[q.id] === q.answer).length;
      if (total > 0 && computedCorrect / total >= 0.6) {
        setShowConfetti(true);
      }
      submitCourseAssessmentResult(moduleId, computedCorrect, total).catch((err) => {
        console.error("Failed to save course assessment result:", err);
      });
    }
  };

  const handleBack = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedThisQuestion(answers[questions[currentIndex - 1]?.id] ?? null);
    }
  };

  const goToQuestion = (i: number) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setCurrentIndex(i);
    setSelectedThisQuestion(answers[questions[i]?.id] ?? null);
  };

  // ─── Score calculation ─────────────────────────────────────────────────────
  const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
  const incorrectCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== q.answer
  ).length;
  const unansweredCount = total - Object.keys(answers).filter((id) => answers[id] !== null).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const filteredResults = (() => {
    switch (reviewFilter) {
      case "incorrect":
        return questions.filter((q) => answers[q.id] !== null && answers[q.id] !== q.answer);
      case "unanswered":
        return questions.filter((q) => answers[q.id] === null || answers[q.id] === undefined);
      default:
        return questions;
    }
  })();

  const topicGroups = filteredResults.reduce((acc, q) => {
    const topic = q.topic ?? "General";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(q);
    return acc;
  }, {} as Record<string, QuizQuestion[]>);

  // ── Intro Screen ───────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <ActivityShell
        title={moduleTitle}
        subtitle={`True / False Clinical Exam Suite · ${total} Questions`}
        stepLabel="Exam Intro"
        showNav={false}
        accentColor="#0E57A4"
      >
        <div className="max-w-2xl mx-auto space-y-6 py-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center mx-auto shadow-xs">
              <ClipboardList className="w-8 h-8 text-[#0E57A4]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0E57A4] bg-[#EBF3FA] px-3.5 py-1 rounded-full border border-[#0E57A4]/20">
                Activity 04 · Clinical Board Examination
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">{moduleTitle}</h1>
              <p className="text-xs text-slate-500 font-mono">True / False Clinical Reasoning Format · Total {total} Questions</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Questions", value: total, color: "#0E57A4" },
                { label: "Format", value: "T/F", color: "#0E57A4" },
                { label: "Feedback", value: "Instant Rationale", color: "#059669" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <div className="text-xl font-mono font-extrabold" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-600 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-left shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900">Auto-Save Session Active</p>
                <p className="text-[11px] text-amber-800">Your answers are continuously bookmarked. You can exit and resume anytime without losing progress.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 max-w-md mx-auto">
              {resumeState && Object.keys(resumeState.answers).length > 0 ? (
                <>
                  <div className="text-xs text-center text-slate-500 font-mono font-bold">
                    Saved session found - {Object.keys(resumeState.answers).length} of {total} answered
                  </div>
                  <button
                    onClick={resumeSaved}
                    className="w-full py-3.5 rounded-2xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition-all shadow-md hover:scale-[1.01]"
                  >
                    Resume Where I Left Off
                  </button>
                  <button
                    onClick={startFresh}
                    className="w-full py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    Start Fresh
                  </button>
                </>
              ) : (
                <button
                  onClick={startFresh}
                  className="w-full py-3.5 rounded-2xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition-all shadow-md hover:scale-[1.01]"
                >
                  Begin Assessment ({total} Questions)
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </ActivityShell>
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────────────
  if (phase === "results") {
    const grade =
      pct >= 80
        ? "🌟 Distinction - High Clinical Competence"
        : pct >= 60
          ? "🩺 Satisfactory Pass"
          : "📚 Practice Recommended";

    return (
      <ActivityShell
        title={moduleTitle}
        subtitle="Assessment Completed & Clinical Rationales"
        stepLabel="Results"
        showNav={false}
        accentColor="#0E57A4"
      >
        <div className="max-w-3xl mx-auto space-y-6 py-2">
          <ConfettiCanvas active={showConfetti} />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Hero Score Header Banner */}
            <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-7 h-7 text-amber-300" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
                  Assessment Completed
                </p>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {moduleTitle}
                </h2>
              </div>

              {/* Score Display */}
              <div className="pt-2">
                <div className="inline-flex items-baseline gap-1 text-5xl sm:text-6xl font-mono font-extrabold text-white">
                  {correctCount}
                  <span className="text-xl sm:text-2xl text-white/60">/{total}</span>
                </div>
                <div className="text-sm font-semibold text-amber-200 mt-1 font-mono">
                  {pct}% Score · {grade}
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {correctCount} Correct
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-300 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-500/30">
                  <XCircle className="w-4 h-4 text-rose-400" /> {incorrectCount} Incorrect
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-900/40 px-3 py-1 rounded-full border border-slate-700">
                  <AlertCircle className="w-4 h-4 text-slate-400" /> {unansweredCount} Unanswered
                </div>
              </div>
            </div>

            {/* Review Filter Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#0E57A4]" />
                <span className="text-xs font-mono font-bold text-slate-700">Review Filter:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(["all", "incorrect", "unanswered"] as ReviewFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReviewFilter(f)}
                    className={`text-xs font-mono font-bold px-4 py-1.5 rounded-xl border transition-all duration-200 ${reviewFilter === f
                        ? "bg-[#0E57A4] text-white border-[#0E57A4] shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-white bg-white/70"
                      }`}
                  >
                    {f === "all" ? `All (${total})` : f === "incorrect" ? `Incorrect (${incorrectCount})` : `Unanswered (${unansweredCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacious Question Breakdown List */}
            <div className="space-y-6">
              {Object.entries(topicGroups).map(([topic, qs]) => (
                <div key={topic} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-3 py-1 rounded-full border border-[#0E57A4]/20">
                      Topic: {topic}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {qs.map((q) => {
                      const userAnswer = answers[q.id];
                      const isCorrect = userAnswer === q.answer;
                      const isUnanswered = userAnswer === null || userAnswer === undefined;
                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl border p-5 space-y-3 transition-all ${isUnanswered
                              ? "bg-slate-50 border-slate-200"
                              : isCorrect
                                ? "bg-emerald-50/50 border-emerald-200/80 shadow-2xs"
                                : "bg-rose-50/50 border-rose-200/80 shadow-2xs"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">
                              {isUnanswered ? (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">?</div>
                              ) : isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-600" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-display font-bold text-slate-900 leading-relaxed">
                                {q.statement}
                              </p>

                              <div className="flex items-center gap-4 pt-1 font-mono text-xs flex-wrap">
                                <span>
                                  Your Answer:{" "}
                                  <strong className={isUnanswered ? "text-slate-400" : isCorrect ? "text-emerald-700" : "text-rose-600"}>
                                    {isUnanswered ? "Not Answered" : userAnswer ? "TRUE" : "FALSE"}
                                  </strong>
                                </span>

                                {!isUnanswered && !isCorrect && (
                                  <span className="text-emerald-700">
                                    Correct Answer: <strong>{q.answer ? "TRUE" : "FALSE"}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 font-sans space-y-1 shadow-2xs">
                              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] block">Clinical Rationale</span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Retry / Return Controls */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setPhase("intro")}
                className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" /> Retake Exam
              </button>
              <button
                onClick={() => router.push("/dashboard/practice")}
                className="flex-1 py-3 rounded-2xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-md"
              >
                <BookOpen className="w-4 h-4" /> Practice Hub
              </button>
            </div>
          </motion.div>
        </div>
      </ActivityShell>
    );
  }

  // ── Test Screen ────────────────────────────────────────────────────────────
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;

  return (
    <ActivityShell
      title={moduleTitle}
      subtitle={`Question ${currentIndex + 1} of ${total}`}
      stepLabel={`Q${currentIndex + 1}/${total}`}
      stepIndex={currentIndex}
      completedCount={answeredCount}
      totalSteps={total}
      waypoints={questions.map((_, i) => `${i + 1}`)}
      onExit={() => setPhase("intro")}
      onBack={currentIndex > 0 ? handleBack : undefined}
      onNext={handleNext}
      nextLabel={currentIndex === total - 1 ? "Submit Exam" : "Next Question"}
      accentColor="#0E57A4"
      headerExtra={
        <span className="text-xs font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] px-3 py-1 rounded-full border border-[#0E57A4]/20">
          {answeredCount}/{total} Answered
        </span>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Question Statement Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Topic pill */}
            {current.topic && (
              <span className="inline-flex text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-3 py-1 rounded-full border border-[#0E57A4]/20">
                {current.topic}
              </span>
            )}

            {/* Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <p className="text-base font-display font-semibold text-slate-900 leading-relaxed">
                {current.statement}
              </p>
            </div>

            {/* True / False Option Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {[true, false].map((val) => {
                const isSelected = selectedThisQuestion === val;
                return (
                  <button
                    key={String(val)}
                    onClick={() => handleAnswer(val)}
                    className={`py-5 rounded-2xl border-2 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2.5 ${isSelected
                        ? val
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20"
                          : "border-rose-500 bg-rose-50 text-rose-900 shadow-sm ring-2 ring-rose-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    aria-pressed={isSelected}
                  >
                    {val ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
                    <span>{val ? "TRUE" : "FALSE"}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Jump Navigation Grid */}
        <div className="pt-5 border-t border-slate-200">
          <p className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-2.5">
            Quick Question Navigation
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const isAnswered = a !== null && a !== undefined;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(i)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold border transition-colors ${i === currentIndex
                      ? "bg-[#0E57A4] text-white border-[#0E57A4] shadow-xs"
                      : isAnswered
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  aria-label={`Go to question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ActivityShell>
  );
}

export default ModuleAssessmentActivity;
