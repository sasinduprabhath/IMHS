"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Trophy, RotateCcw, BookOpen, CheckCircle2, XCircle, Flame, Clock, ChevronLeft
} from "lucide-react";
import { ActivityShell } from "./ActivityShell";
import { OptionButton } from "./OptionButton";
import { ScoreTicker } from "./ScoreTicker";
import { generateRushRounds } from "@/data/pharmacyRushRounds";
import type { Drug, RushRound, OptionState } from "@/types/pharmacology";

const ROUND_TIME_SECONDS = 15;
const POINTS_PER_ROUND = 10;
const AUTO_ADVANCE_MS = 1200;

type GameMode = "rush" | "practice";
type GameState = "opening" | "playing" | "results";

interface RoundResult {
  round: RushRound;
  selectedIndex: number | null;
  isCorrect: boolean;
  timedOut: boolean;
}

interface PharmacyRushActivityProps {
  drug: Drug;
}

// ─── Circular Countdown Ring ──────────────────────────────────────────────────
function CountdownRing({ seconds, totalSeconds, isUrgent }: { seconds: number; totalSeconds: number; isUrgent: boolean }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / totalSeconds;
  const dash = circumference * progress;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center" role="timer" aria-live="polite" aria-label={`${seconds} seconds remaining`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
        <circle
          cx="28" cy="28" r={radius} fill="none"
          stroke={seconds <= 3 ? "#C1443A" : "#F16726"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <span
        className={`text-sm font-mono font-bold tabular-nums transition-colors ${seconds <= 3 ? "text-[#C1443A]" : "text-slate-800"}`}
      >
        {seconds}
      </span>
      {isUrgent && seconds <= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-clinical-red/40 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export function PharmacyRushActivity({ drug }: PharmacyRushActivityProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("opening");
  const [mode, setMode] = useState<GameMode>("rush");
  const [rounds, setRounds] = useState<RushRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = (selectedMode: GameMode) => {
    const generated = generateRushRounds(drug);
    setRounds(generated);
    setMode(selectedMode);
    setRoundIndex(0);
    setScore(0);
    setResults([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(ROUND_TIME_SECONDS);
    setGameState("playing");
  };

  const currentRound = rounds[roundIndex];

  // Timer logic (Rush mode only)
  useEffect(() => {
    if (gameState !== "playing" || mode !== "rush" || showFeedback) return;
    setTimeLeft(ROUND_TIME_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, gameState, mode, showFeedback]);

  const handleAnswer = useCallback((index: number | null) => {
    if (showFeedback) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = index !== null && index === currentRound?.correctIndex;
    setSelectedAnswer(index);
    setShowFeedback(true);
    if (isCorrect) setScore((s) => s + POINTS_PER_ROUND);

    const result: RoundResult = {
      round: currentRound,
      selectedIndex: index,
      isCorrect,
      timedOut: index === null,
    };
    setResults((prev) => [...prev, result]);

    advanceRef.current = setTimeout(() => {
      if (roundIndex < rounds.length - 1) {
        setRoundIndex((r) => r + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setGameState("results");
      }
    }, AUTO_ADVANCE_MS);
  }, [currentRound, roundIndex, rounds.length, showFeedback]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
  }, []);

  // ── Opening Screen ─────────────────────────────────────────────────────────
  if (gameState === "opening") {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg w-full bg-gradient-to-br from-[#0A2540] via-[#0E57A4] to-[#1868c2] text-white rounded-3xl p-8 space-y-6 text-center shadow-2xl border border-white/10"
        >
          {/* Badge */}
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-[#F16726]" />
            <span className="text-[#F16726] font-mono text-xs uppercase font-bold tracking-widest bg-black/20 px-3 py-1 rounded-full border border-[#F16726]/30">
              IMHS Pharmacy Rush Arcade
            </span>
            <Flame className="w-5 h-5 text-[#F16726]" />
          </div>

          {/* Drug name */}
          <div className="space-y-1">
            <p className="text-white/70 text-xs font-mono uppercase tracking-widest font-bold">Featured Medicine Challenge</p>
            <h1 className="text-4xl font-display font-bold text-white">{drug.genericName}</h1>
            <p className="text-white/60 font-mono text-xs pt-1">10 Rounds · Beat the Clock · Max Score 100</p>
          </div>

          {/* Round preview pills */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white/10 border border-white/10 rounded-xl py-2 text-[10px] text-white/80 font-mono text-center font-bold">
                R{i + 1}
              </div>
            ))}
          </div>

          {/* Mode selection */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => startGame("rush")}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#F16726] hover:bg-[#D95316] text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-5 h-5" />
              Rush Mode — {ROUND_TIME_SECONDS}s Speed Challenge
            </button>
            <button
              onClick={() => startGame("practice")}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold text-xs transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Practice Mode — Untimed Review
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="text-xs font-mono text-white/60 hover:text-white transition flex items-center justify-center gap-1 mx-auto"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Practice Hub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────────────
  if (gameState === "results") {
    const pct = Math.round((score / 100) * 100);
    const grade = pct >= 90 ? "Outstanding!" : pct >= 70 ? "Well done!" : pct >= 50 ? "Good effort!" : "Keep practising!";
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 text-center"
        >
          <div className="space-y-1">
            <Trophy className="w-12 h-12 text-[#F16726] mx-auto" />
            <h2 className="text-2xl font-display font-bold text-slate-900">Pharmacy Rush Complete!</h2>
            <p className="text-xs font-mono text-slate-500">{drug.genericName} · {mode === "rush" ? "Rush Mode" : "Practice Mode"}</p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FA] to-white rounded-2xl border border-[#0E57A4]/20 p-6 space-y-1">
            <div className="text-6xl font-mono font-bold text-[#0E57A4]">
              {score}<span className="text-2xl text-slate-400">/100</span>
            </div>
            <div className="text-sm font-semibold text-slate-700">{grade}</div>
            <div className="text-xs text-slate-500 font-mono">{results.filter((r) => r.isCorrect).length}/10 rounds correct</div>
          </div>

          {/* Round breakdown */}
          <div className="space-y-2 text-left">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 px-1">Round Breakdown</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex items-start gap-3"
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: r.isCorrect ? "#4A8B7A18" : "#C1443A12" }}
                  >
                    {r.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-[#4A8B7A]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-clinical-red" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{r.round.question}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Correct: <span className="text-emerald-700 font-bold">{r.round.options[r.round.correctIndex]}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setGameState("opening")}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" /> Replay
            </button>
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="flex-1 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> Practice Hub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Playing Stage ──────────────────────────────────────────────────────────
  return (
    <ActivityShell
      title="Pharmacy Rush Arcade"
      subtitle={`${drug.genericName} · Round ${roundIndex + 1} of 10`}
      stepLabel={`Round ${roundIndex + 1}`}
      stepIndex={roundIndex}
      totalSteps={10}
      waypoints={Array.from({ length: 10 }, (_, i) => `R${i + 1}`)}
      onExit={() => setGameState("opening")}
      showNav={false}
      accentColor="#F16726"
      headerExtra={
        <div className="flex items-center gap-4">
          <ScoreTicker score={score} />
          {mode === "rush" && (
            <CountdownRing seconds={timeLeft} totalSeconds={ROUND_TIME_SECONDS} isUrgent={timeLeft <= 3} />
          )}
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Round Category pill */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F16726] bg-[#F16726]/10 px-3 py-1 rounded-full border border-[#F16726]/20">
            Speed Challenge
          </span>
          <span className="text-xs font-mono font-bold text-slate-500">
            Round {roundIndex + 1} of 10
          </span>
        </div>

        {/* Question Statement Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#EBF3FA]/70 via-white to-[#F8FAFC] border border-[#0E57A4]/20 shadow-xs space-y-1">
          <p className="text-[10px] font-mono font-bold text-[#0E57A4] uppercase tracking-wider">
            Clinical Pharmacology
          </p>
          <h2 className="text-lg font-display font-extrabold text-slate-900 leading-relaxed">
            {currentRound.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentRound.options.map((opt, i) => {
            let state: OptionState = "idle";
            if (showFeedback) {
              if (i === currentRound.correctIndex) state = "correct";
              else if (i === selectedAnswer) state = "incorrect";
            }
            return (
              <OptionButton
                key={opt}
                index={i}
                label={opt}
                state={state}
                onClick={() => handleAnswer(i)}
                disabled={showFeedback}
              />
            );
          })}
        </div>
      </div>
    </ActivityShell>
  );
}
