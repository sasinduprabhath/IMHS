"use client";

import React, { useState, useEffect, useRef } from "react";
import { ActivityShell } from "./ActivityShell";
import { AMLODIPINE_RUSH_ROUNDS } from "@/data/pharmacyRushRounds";
import { RushRound } from "@/types/pharmacology";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Clock, Zap, CheckCircle2, XCircle, RotateCcw, Award, Play,
  ShieldCheck, AlertCircle, HelpCircle, Check, Flame
} from "lucide-react";

const ROUND_TIME_BUDGET = 15; // 15 seconds per round in Timed Rush Mode

export function PharmacyRushClient() {
  const rounds = AMLODIPINE_RUSH_ROUNDS;

  const [gameStarted, setGameStarted] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(true); // Timed Rush vs Untimed Practice

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({}); // roundNumber -> selectedOptionId

  // Round Timer State
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_BUDGET);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);

  const currentRound = rounds[currentRoundIndex];

  // Timer Tick Effect (Only active when in Timed Rush Mode and game is live)
  useEffect(() => {
    if (!gameStarted || isGameOver || isPaused || !isTimedMode) return;

    if (timeLeft <= 0) {
      // Time expired for this round! Automatically reveal correct answer and advance
      handleOptionSelect("__TIMEOUT__");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isGameOver, isPaused, timeLeft, isTimedMode]);

  // Handle Option Click or Timeout
  const handleOptionSelect = (optionId: string) => {
    if (selectedOptionId !== null || isPaused) return;

    setSelectedOptionId(optionId);
    setIsPaused(true);

    const isCorrect = currentRound.options.find((o) => o.id === optionId)?.isCorrect || false;

    setUserAnswers((prev) => ({
      ...prev,
      [currentRound.roundNumber]: optionId,
    }));

    if (isCorrect) {
      setScore((s) => s + 10);
      setShowScorePop(true);
      setTimeout(() => setShowScorePop(false), 800);
    }

    // Pause 1.2s to show correct/incorrect feedback before advancing to next round
    setTimeout(() => {
      if (currentRoundIndex < rounds.length - 1) {
        setCurrentRoundIndex((idx) => idx + 1);
        setSelectedOptionId(null);
        setTimeLeft(ROUND_TIME_BUDGET);
        setIsPaused(false);
      } else {
        setIsGameOver(true);
      }
    }, 1200);
  };

  const startGame = (timed: boolean) => {
    setIsTimedMode(timed);
    setGameStarted(true);
    setCurrentRoundIndex(0);
    setScore(0);
    setUserAnswers({});
    setTimeLeft(ROUND_TIME_BUDGET);
    setSelectedOptionId(null);
    setIsPaused(false);
    setIsGameOver(false);
  };

  const restartGame = () => {
    setGameStarted(false);
    setIsGameOver(false);
  };

  // ── 1. Opening Welcome & Mode Selector Screen ──
  if (!gameStarted) {
    return (
      <ActivityShell title="IMHS Pharmacy Rush" stepLabel="Game Hub" hideFooter>
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#0C1A30] to-[#0A2540] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 text-center space-y-8 relative overflow-hidden">
          {/* Top Decorative Banner */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#F16726]/15 border border-[#F16726]/30 px-4 py-1.5 rounded-full text-[#F16726] font-mono text-xs font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Rapid Knowledge Challenge
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-wide">
              TODAY&apos;S MEDICINE
            </h2>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
              &ldquo;AMLODIPINE&rdquo;
            </p>
          </div>

          {/* Game Stats Quick Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto relative z-10 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 block text-[10px]">ROUNDS</span>
              <strong className="text-white text-base">10 Rounds</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 block text-[10px]">TIME / RD</span>
              <strong className="text-[#F16726] text-base">15 Sec</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 block text-[10px]">MAX SCORE</span>
              <strong className="text-emerald-400 text-base">100 Pts</strong>
            </div>
          </div>

          {/* Start Buttons */}
          <div className="space-y-3 max-w-sm mx-auto pt-2 relative z-10">
            <Button
              type="button"
              onClick={() => startGame(true)}
              className="w-full py-4 text-base font-bold bg-[#F16726] hover:bg-[#d9561b] text-white rounded-2xl shadow-lg gap-2 border-0 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              <span>Play Timed Rush Mode</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => startGame(false)}
              className="w-full py-3.5 text-xs font-semibold text-slate-300 border-white/20 hover:bg-white/10 rounded-2xl gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Practice Mode (Untimed)</span>
            </Button>
          </div>
        </div>
      </ActivityShell>
    );
  }

  // ── 2. Results Screen (Game Over) ──
  if (isGameOver) {
    const passed = score >= 70;

    return (
      <ActivityShell title="IMHS Pharmacy Rush — Game Results" stepLabel="Game Over" hideFooter>
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-slate-200">
            <div className={cn(
              "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-sm",
              passed ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              <Award className="w-8 h-8" />
            </div>
            <span className="inline-block font-mono text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Final Scorecard — Today&apos;s Medicine
            </span>
            <h2 className="text-4xl font-display font-bold text-slate-900">
              {score} <span className="text-slate-400 text-lg font-normal">/ 100</span>
            </h2>
            <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
              {passed
                ? "Phenomenal recall speed & clinical precision! You mastered Amlodipine."
                : "Good run! Review the round-by-round breakdown below to perfect your score."}
            </p>
          </div>

          {/* Round-by-Round Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              10-Round Performance Summary
            </h3>

            <div className="space-y-2">
              {rounds.map((r) => {
                const userChoiceId = userAnswers[r.roundNumber];
                const correctChoice = r.options.find((o) => o.isCorrect);
                const userChoice = r.options.find((o) => o.id === userChoiceId);
                const isRight = userChoice?.isCorrect || false;

                return (
                  <div
                    key={r.roundNumber}
                    className={cn(
                      "p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2",
                      isRight ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                    )}
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                        {r.topicLabel}
                      </span>
                      <p className="font-bold text-slate-900">{r.question}</p>
                    </div>

                    <div className="sm:text-right shrink-0 font-mono text-[11px]">
                      {isRight ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 sm:justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" /> +10 Pts ({userChoice?.text})
                        </span>
                      ) : (
                        <span className="text-[#C1443A] font-bold flex items-center gap-1 sm:justify-end">
                          <XCircle className="w-3.5 h-3.5" /> Ans: {correctChoice?.text}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => startGame(isTimedMode)}
              className="w-full sm:w-auto text-xs font-semibold rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
            <Button
              type="button"
              onClick={restartGame}
              className="w-full sm:w-auto text-xs font-bold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl"
            >
              Return to Rush Hub
            </Button>
          </div>
        </div>
      </ActivityShell>
    );
  }

  // ── 3. Active Round Gameplay Screen ──
  const timerPct = timeLeft / ROUND_TIME_BUDGET;
  const strokeDashoffset = 125.6 * (1 - timerPct);

  return (
    <ActivityShell
      title="IMHS Pharmacy Rush"
      subtitle={`Medicine: Amlodipine · ${isTimedMode ? "Timed Mode" : "Practice Mode"}`}
      progress={(currentRoundIndex + 1) / 10}
      stepLabel={`Round ${currentRoundIndex + 1} of 10`}
      stepsCount={10}
      currentStepIndex={currentRoundIndex + 1}
      hideFooter
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Game Header Bar — Score + Timer */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F16726]" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Score</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-slate-900">{score}</span>
                {showScorePop && (
                  <span className="font-mono text-xs font-bold text-emerald-600 animate-bounce">+10</span>
                )}
              </div>
            </div>
          </div>

          {/* Timed Circular Countdown Ring */}
          {isTimedMode ? (
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
                  <circle
                    cx="22" cy="22" r="20"
                    fill="none"
                    stroke={timeLeft <= 3 ? "#C1443A" : "#F16726"}
                    strokeWidth="3.5"
                    strokeDasharray="125.6"
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className={cn(
                  "absolute font-mono text-xs font-bold",
                  timeLeft <= 3 ? "text-[#C1443A] animate-pulse" : "text-slate-900"
                )}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          ) : (
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Untimed Practice
            </span>
          )}
        </div>

        {/* Round Question Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-paper space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider block">
              {currentRound.topicLabel}
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 leading-tight">
              {currentRound.question}
            </h3>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRound.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const showResult = selectedOptionId !== null;

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={showResult}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 select-none",
                    showResult
                      ? opt.isCorrect
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs"
                        : isSelected
                          ? "bg-red-50 border-[#C1443A] text-[#C1443A] font-bold"
                          : "bg-slate-50 border-slate-200 opacity-50"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                  )}
                >
                  <span>{opt.text}</span>
                  {showResult && (
                    <div className="shrink-0">
                      {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isSelected && !opt.isCorrect && <XCircle className="w-4 h-4 text-[#C1443A]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Brief Explanation Callout when Answered */}
          {selectedOptionId !== null && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-[#0E57A4] space-y-1 animate-in fade-in">
              <strong className="font-mono text-[10px] uppercase font-bold block">Pharmacological Note:</strong>
              <p className="text-slate-700">{currentRound.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </ActivityShell>
  );
}
