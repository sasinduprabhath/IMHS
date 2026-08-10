"use client";

import React, { useState, useEffect } from "react";
import { ActivityShell } from "./ActivityShell";
import { SAMPLE_MODULE_QUESTIONS } from "@/data/moduleQuestions";
import { ModuleQuestion } from "@/types/pharmacology";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, AlertTriangle, RotateCcw, Filter,
  Check, X, BookOpen, Layers, Award, Save, HelpCircle
} from "lucide-react";

const STORAGE_KEY = "imhs_module_assessment_answers_v1";

export function ModuleAssessmentClient() {
  const questions = SAMPLE_MODULE_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  // Restore autosaved answers on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setAnswers(parsed.answers || {});
          if (typeof parsed.currentIndex === "number") {
            setCurrentIndex(Math.min(parsed.currentIndex, questions.length - 1));
          }
          if (parsed.isSubmitted) {
            setIsSubmitted(true);
          }
        }
      }
    } catch {
      // ignore JSON error
    }
  }, [questions.length]);

  // Persist answers to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, currentIndex, isSubmitted })
      );
    } catch {
      // ignore
    }
  }, [answers, currentIndex, isSubmitted]);

  const currentQ = questions[currentIndex];
  const isAnswered = answers[currentQ.id] !== undefined;

  const handleSelectAnswer = (choice: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choice,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setShowIncorrectOnly(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculate Scores & Topic Breakdown
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => answers[q.id] === q.isTrue).length;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePct >= 75;

  // Topic Analysis
  const topicStats = questions.reduce((acc, q) => {
    if (!acc[q.topic]) {
      acc[q.topic] = { total: 0, correct: 0 };
    }
    acc[q.topic].total += 1;
    if (answers[q.id] === q.isTrue) {
      acc[q.topic].correct += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  // ── Render Completed Summary View ──
  if (isSubmitted) {
    const displayedQuestions = showIncorrectOnly
      ? questions.filter((q) => answers[q.id] !== q.isTrue)
      : questions;

    return (
      <ActivityShell
        title="Module Assessment — Results & Review"
        subtitle={questions[0]?.moduleTitle || "Comprehensive Assessment"}
        progress={1}
        stepLabel="Submitted"
        hideFooter
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-paper border border-slate-200 space-y-6">
          {/* Header Result Score Banner */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-200">
            <div className={cn(
              "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-sm",
              passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              <Award className="w-8 h-8" />
            </div>
            <span className="inline-block font-mono text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Summative Assessment Evaluation
            </span>
            <h2 className="text-4xl font-display font-bold text-slate-900">
              {scorePct}% <span className="text-slate-400 text-lg font-normal">({correctCount}/{totalQuestions})</span>
            </h2>
            <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
              {passed
                ? "Congratulations! You passed the module assessment with distinction."
                : "Review the topic analysis and incorrect questions below to prepare for re-assessment."}
            </p>
          </div>

          {/* Topic Breakdown Bar Charts */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Topic Mastery Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(topicStats).map(([topic, stat]) => {
                const pct = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={topic} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate">{topic}</span>
                      <span className="font-mono text-[11px] text-slate-600">{stat.correct}/{stat.total} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          pct >= 75 ? "bg-emerald-600" : "bg-amber-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Review Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Question Review ({displayedQuestions.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowIncorrectOnly(!showIncorrectOnly)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer",
                  showIncorrectOnly
                    ? "bg-[#C1443A]/10 text-[#C1443A] border-[#C1443A]/30"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showIncorrectOnly ? "Showing Incorrect Only" : "Filter: Incorrect Only"}</span>
              </button>
            </div>

            <div className="space-y-3">
              {displayedQuestions.map((q, idx) => {
                const studentAns = answers[q.id];
                const isRight = studentAns === q.isTrue;

                return (
                  <div
                    key={q.id}
                    className={cn(
                      "p-4 rounded-2xl border space-y-2.5 transition-all",
                      isRight ? "bg-emerald-50/40 border-emerald-200" : "bg-red-50/40 border-red-200"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-500">Q{idx + 1}. {q.topic}</span>
                      <span className={cn(
                        "font-mono font-bold flex items-center gap-1 text-xs",
                        isRight ? "text-emerald-700" : "text-[#C1443A]"
                      )}>
                        {isRight ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isRight ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.statement}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-mono pt-1 text-slate-700">
                      <div>
                        Your Answer: <strong className={studentAns ? "text-emerald-700" : "text-[#C1443A]"}>{studentAns ? "TRUE" : "FALSE"}</strong>
                      </div>
                      <div>
                        Correct Answer: <strong className="text-slate-900">{q.isTrue ? "TRUE" : "FALSE"}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                      <strong className="text-slate-900 font-mono text-[10px] uppercase block">Explanation:</strong>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={resetAssessment}
              className="text-xs font-semibold rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Module Assessment
            </Button>
          </div>
        </div>
      </ActivityShell>
    );
  }

  // ── Main One-Question-at-a-Time Layout ──
  return (
    <ActivityShell
      title="Module Assessment"
      subtitle={currentQ.moduleTitle}
      progress={(currentIndex + 1) / totalQuestions}
      stepLabel={`Question ${currentIndex + 1} of ${totalQuestions}`}
      stepsCount={totalQuestions}
      currentStepIndex={currentIndex + 1}
      onBack={currentIndex > 0 ? handleBack : undefined}
      onNext={handleNext}
      disableNext={!isAnswered}
      nextLabel={currentIndex === totalQuestions - 1 ? "Submit Assessment" : "Next Question"}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Autosave Status Readout */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-[#0E57A4] font-bold">
            <Layers className="w-4 h-4" /> Topic: {currentQ.topic}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Save className="w-3.5 h-3.5 text-emerald-600" /> Autosaved
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-6">
          <div className="space-y-3">
            <span className="inline-block font-mono text-xs text-slate-400 uppercase font-bold">
              True or False Statement:
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-slate-900 leading-relaxed">
              &ldquo;{currentQ.statement}&rdquo;
            </h2>
          </div>

          {/* True / False Choice Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleSelectAnswer(true)}
              className={cn(
                "p-6 rounded-2xl border text-center space-y-2 transition-all cursor-pointer select-none",
                answers[currentQ.id] === true
                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20 shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
              )}
            >
              <span className="block font-mono text-2xl font-bold">TRUE</span>
              <span className="block text-[11px] text-slate-500">Statement is accurate</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAnswer(false)}
              className={cn(
                "p-6 rounded-2xl border text-center space-y-2 transition-all cursor-pointer select-none",
                answers[currentQ.id] === false
                  ? "bg-red-50 border-[#C1443A] text-red-950 ring-2 ring-red-400/20 shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
              )}
            >
              <span className="block font-mono text-2xl font-bold">FALSE</span>
              <span className="block text-[11px] text-slate-500">Statement is inaccurate</span>
            </button>
          </div>
        </div>

        {/* Quick Navigator Drawer Dots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          {questions.map((q, idx) => {
            const answered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-7 h-7 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center",
                  isCurrent
                    ? "bg-[#0E57A4] text-white ring-2 ring-[#0E57A4]/20"
                    : answered
                      ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                )}
                title={`Jump to Q${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </ActivityShell>
  );
}
