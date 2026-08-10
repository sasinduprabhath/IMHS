"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RotateCcw, BookOpen, Trophy,
  ClipboardList, ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import type { QuizQuestion } from "@/types/pharmacology";

const AUTOSAVE_KEY = "imhs_module_assessment_state";

interface AssessmentState {
  moduleId: string;
  answers: Record<string, boolean | null>; // questionId -> true/false/null (unanswered)
  currentIndex: number;
  startedAt: string;
}

interface ModuleAssessmentActivityProps {
  questions: QuizQuestion[];
  moduleId: string;
  moduleTitle?: string;
}

type ReviewFilter = "all" | "incorrect" | "unanswered";

export function ModuleAssessmentActivity({ questions, moduleId, moduleTitle = "Module Assessment" }: ModuleAssessmentActivityProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "test" | "results">("intro");
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [selectedThisQuestion, setSelectedThisQuestion] = useState<boolean | null>(null);

  const total = questions.length;
  const current = questions[currentIndex];

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
      } catch { /* ignore */ }
    }
    return null;
  }, [moduleId]);

  const resumeState = checkResume();

  const startFresh = () => {
    const key = `${AUTOSAVE_KEY}_${moduleId}`;
    localStorage.removeItem(key);
    setAnswers({});
    setCurrentIndex(0);
    setSelectedThisQuestion(null);
    setPhase("test");
  };

  const resumeSaved = () => {
    if (!resumeState) return;
    setAnswers(resumeState.answers);
    setCurrentIndex(resumeState.currentIndex);
    setSelectedThisQuestion(resumeState.answers[questions[resumeState.currentIndex]?.id] ?? null);
    setPhase("test");
  };

  const handleAnswer = (value: boolean) => {
    setSelectedThisQuestion(value);
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleNext = () => {
    setSelectedThisQuestion(null);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedThisQuestion(answers[questions[currentIndex + 1]?.id] ?? null);
    } else {
      setPhase("results");
      localStorage.removeItem(`${AUTOSAVE_KEY}_${moduleId}`);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedThisQuestion(answers[questions[currentIndex - 1]?.id] ?? null);
    }
  };

  // Navigate to specific question
  const goToQuestion = (i: number) => {
    setCurrentIndex(i);
    setSelectedThisQuestion(answers[questions[i]?.id] ?? null);
  };

  // ─── Score calculation ─────────────────────────────────────────────────────
  const correctCount = questions.filter((q) => answers[q.id] === q.answer).length;
  const incorrectCount = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== q.answer).length;
  const unansweredCount = total - Object.keys(answers).filter((id) => answers[id] !== null).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const filteredResults = (() => {
    switch (reviewFilter) {
      case "incorrect": return questions.filter((q) => answers[q.id] !== null && answers[q.id] !== q.answer);
      case "unanswered": return questions.filter((q) => !answers[q.id] === null || answers[q.id] === undefined);
      default: return questions;
    }
  })();

  // Group results by topic
  const topicGroups = filteredResults.reduce((acc, q) => {
    const topic = q.topic ?? "General";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(q);
    return acc;
  }, {} as Record<string, QuizQuestion[]>);

  // ── Intro Screen ───────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center mx-auto">
                <ClipboardList className="w-7 h-7 text-[#6366F1]" />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink">{moduleTitle}</h1>
              <p className="text-sm text-ink-muted">True / False — {total} Questions · No per-question feedback during the test</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Questions", value: total, color: "#6366F1" },
                { label: "Format", value: "T/F", color: "#0E57A4" },
                { label: "Feedback", value: "At end", color: "#4A8B7A" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
                  <div className="text-[9px] font-mono font-bold uppercase text-ink-muted tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-ink-muted bg-amber-50 border border-amber-200 rounded-xl p-3">
              <strong className="text-amber-800">Auto-save enabled</strong> — your progress is saved locally. If you close the page and return, you can resume where you left off.
            </div>

            <div className="space-y-2">
              {resumeState && Object.keys(resumeState.answers).length > 0 ? (
                <>
                  <div className="text-xs text-center text-ink-muted font-mono">
                    Saved progress found — {Object.keys(resumeState.answers).length}/{total} answered
                  </div>
                  <button onClick={resumeSaved} className="w-full py-3 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors">
                    Resume Where I Left Off
                  </button>
                  <button onClick={startFresh} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors">
                    Start Fresh
                  </button>
                </>
              ) : (
                <button onClick={startFresh} className="w-full py-3 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors">
                  Begin Assessment
                </button>
              )}
              <button onClick={() => router.push("/dashboard/practice")} className="w-full py-2 text-xs text-ink-muted hover:text-ink font-mono transition-colors">
                ← Back to Practice Hub
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────────────
  if (phase === "results") {
    const grade = pct >= 80 ? "Pass" : "Revise";
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Score header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center space-y-3">
            <Trophy className="w-10 h-10 text-[#6366F1] mx-auto" />
            <h2 className="text-2xl font-display font-bold text-ink">Assessment Complete</h2>
            <div className="text-5xl font-mono font-bold text-[#6366F1]">
              {correctCount}<span className="text-xl text-ink-muted">/{total}</span>
            </div>
            <div className="text-sm font-semibold text-ink">{pct}% · {grade}</div>

            <div className="flex items-center justify-center gap-6 pt-2">
              {[
                { icon: CheckCircle2, value: correctCount, label: "Correct", color: "#4A8B7A" },
                { icon: XCircle, value: incorrectCount, label: "Incorrect", color: "#C1443A" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" style={{ color }} aria-hidden />
                  <span className="text-sm font-mono font-bold" style={{ color }}>{value}</span>
                  <span className="text-xs text-ink-muted">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-ink-muted" aria-hidden />
            <span className="text-xs font-mono text-ink-muted">Filter:</span>
            {(["all", "incorrect", "unanswered"] as ReviewFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setReviewFilter(f)}
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition-colors ${reviewFilter === f ? "bg-[#0E57A4] text-white border-[#0E57A4]" : "border-slate-200 text-ink-muted hover:border-slate-300"}`}
              >
                {f === "all" ? `All (${total})` : f === "incorrect" ? `Incorrect (${incorrectCount})` : `Unanswered (${unansweredCount})`}
              </button>
            ))}
          </div>

          {/* Grouped review */}
          {Object.entries(topicGroups).map(([topic, qs]) => (
            <div key={topic} className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase text-ink-muted tracking-widest px-1">{topic}</h3>
              {qs.map((q) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.answer;
                const isUnanswered = userAnswer === null || userAnswer === undefined;
                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-white rounded-xl border p-4 space-y-2 ${
                      isUnanswered ? "border-slate-200"
                      : isCorrect ? "border-[#4A8B7A]/30"
                      : "border-clinical-red/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        {isUnanswered ? (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4A8B7A]" aria-label="Correct" />
                        ) : (
                          <XCircle className="w-5 h-5 text-clinical-red" aria-label="Incorrect" />
                        )}
                      </div>
                      <p className="text-sm text-ink leading-snug flex-1">{q.statement}</p>
                    </div>

                    <div className="flex items-center gap-3 pl-7">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                        Your answer: <span className={isUnanswered ? "text-slate-400" : isCorrect ? "text-[#4A8B7A]" : "text-clinical-red"}>
                          {isUnanswered ? "Not answered" : userAnswer ? "TRUE" : "FALSE"}
                        </span>
                      </span>
                      {!isUnanswered && !isCorrect && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A8B7A]">
                          Correct: {q.answer ? "TRUE" : "FALSE"}
                        </span>
                      )}
                    </div>

                    {q.explanation && !isCorrect && (
                      <p className="text-xs text-ink-muted pl-7 leading-relaxed border-t border-slate-100 pt-2">{q.explanation}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-ink-muted text-sm">
              No questions match this filter.
            </div>
          )}

          <div className="flex gap-3 pb-4">
            <button onClick={() => { setPhase("intro"); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => router.push("/dashboard/practice")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366F1] text-sm font-bold text-white hover:bg-[#4F46E5] transition-colors">
              <BookOpen className="w-4 h-4" /> Practice Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test Screen ────────────────────────────────────────────────────────────
  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
  const progressPct = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard/practice")} className="shrink-0 text-ink-muted hover:text-ink p-1 rounded-lg" aria-label="Exit">
            ✕
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-[#6366F1] uppercase tracking-wider truncate">{moduleTitle}</p>
            <p className="text-[10px] text-ink-muted font-mono mt-0.5">Question {currentIndex + 1} of {total} · {answeredCount} answered</p>
          </div>
          {/* Progress */}
          <div className="shrink-0 text-right">
            <span className="text-xs font-mono font-bold text-[#6366F1]">{answeredCount}/{total}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-[#6366F1] transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Topic pill */}
            {current.topic && (
              <span className="inline-flex text-[10px] font-mono font-bold uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 px-3 py-1 rounded-full border border-[#6366F1]/20">
                {current.topic}
              </span>
            )}

            {/* Statement */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-base font-display font-semibold text-ink leading-snug">
                {current.statement}
              </p>
            </div>

            {/* True / False buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[true, false].map((val) => {
                const isSelected = selectedThisQuestion === val;
                return (
                  <button
                    key={String(val)}
                    onClick={() => handleAnswer(val)}
                    className={`py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 ${
                      isSelected
                        ? val ? "border-[#4A8B7A] bg-[#4A8B7A]/12 text-[#2d6655]" : "border-clinical-red bg-clinical-red-light text-clinical-red"
                        : "border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {val ? "✓ TRUE" : "✗ FALSE"}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick jump grid */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-[10px] font-mono font-bold uppercase text-ink-muted tracking-widest mb-2">Quick Navigate</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const isAnswered = a !== null && a !== undefined;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(i)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                    i === currentIndex ? "bg-[#6366F1] text-white border-[#6366F1]"
                    : isAnswered ? "bg-slate-100 text-ink border-slate-200 hover:border-slate-300"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                  }`}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Navigation footer */}
      <footer className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink px-4 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentIndex < total - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-sm font-bold text-white px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] transition-all shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { setPhase("results"); localStorage.removeItem(`${AUTOSAVE_KEY}_${moduleId}`); }}
              className="flex items-center gap-1.5 text-sm font-bold text-white px-6 py-2.5 rounded-xl bg-[#4A8B7A] hover:bg-[#3a7060] transition-all shadow-sm"
            >
              <Trophy className="w-4 h-4" /> Submit & Review
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
