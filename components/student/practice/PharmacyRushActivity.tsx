"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Trophy, RotateCcw, BookOpen, CheckCircle2, XCircle, Flame, Clock
} from "lucide-react";
import { ActivityShell } from "./ActivityShell";
import { OptionButton } from "./OptionButton";
import { ScoreTicker } from "./ScoreTicker";
import { generateRushRounds } from "@/data/pharmacyRushRounds";
import type { Drug, RushRound, OptionState } from "@/types/pharmacology";

const ROUND_TIME_SECONDS = 15; // confirm with academic team
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
        {/* Track */}
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="3.5" />
        {/* Progress — linear depletion, no easing (represents real time accurately) */}
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
        className={`text-sm font-mono font-bold tabular-nums transition-colors ${seconds <= 3 ? "text-clinical-red" : "text-ink"}`}
      >
        {seconds}
      </span>
      {/* Urgency pulse — reduced motion: static color change only (handled via CSS media query) */}
      {isUrgent && seconds <= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-clinical-red/40 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ ["@media (prefers-reduced-motion: reduce)" as any]: { display: "none" } }}
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

  // Pre-generate all 10 rounds on game start (no per-round requests)
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
          handleAnswer(null); // timeout
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

    // Auto-advance after 1.2s (outside next round's timer)
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#0E57A4] to-[#1868c2] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-6 text-center"
        >
          {/* Badge */}
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-[#F16726]" />
            <span className="text-[#F16726] font-mono text-xs uppercase font-bold tracking-widest">IMHS Pharmacy Rush</span>
            <Flame className="w-5 h-5 text-[#F16726]" />
          </div>

          {/* Drug name */}
          <div className="space-y-1">
            <p className="text-white/60 text-xs font-mono uppercase tracking-widest">TODAY&apos;S MEDICINE</p>
            <h1 className="text-5xl font-display font-bold text-white">{drug.genericName}</h1>
            <p className="text-white/50 font-mono text-sm">10 Rounds · Beat the Clock · Max Score 100</p>
          </div>

          {/* Round preview pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg py-1.5 text-[9px] text-white/60 font-mono text-center font-bold">
                R{i + 1}
              </div>
            ))}
          </div>

          {/* Mode selection */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => startGame("rush")}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#F16726] hover:bg-[#D95316] text-white font-bold text-base shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-5 h-5" />
              Rush Mode — {ROUND_TIME_SECONDS}s per round
            </button>
            <button
              onClick={() => startGame("practice")}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Practice Mode — Untimed
            </button>
          </div>

          <p className="text-white/40 text-[10px] font-mono">
            Practice Mode is fully accessible — no time pressure.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Results Screen ─────────────────────────────────────────────────────────
  if (gameState === "results") {
    const pct = Math.round((score / 100) * 100);
    const grade = pct >= 90 ? "Outstanding!" : pct >= 70 ? "Well done!" : pct >= 50 ? "Good effort!" : "Keep practising!";
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white p-4 py-8">
        <div className="max-w-lg mx-auto space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <Trophy className="w-12 h-12 text-[#F16726] mx-auto" />
            <h2 className="text-2xl font-display font-bold text-ink">Pharmacy Rush Complete!</h2>
            <p className="text-sm text-ink-muted">{drug.genericName} · {mode === "rush" ? "Rush Mode" : "Practice Mode"}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center space-y-2"
          >
            <div className="text-6xl font-mono font-bold text-[#0E57A4]">
              {score}<span className="text-2xl text-ink-muted">/100</span>
            </div>
            <div className="text-sm font-semibold text-ink">{grade}</div>
            <div className="text-xs text-ink-muted font-mono">{results.filter((r) => r.isCorrect).length}/10 correct</div>
          </motion.div>

          {/* Round breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-ink px-1">Round Breakdown</h3>
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="bg-white rounded-xl border border-slate-200 p-3 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: r.isCorrect ? "#4A8B7A18" : "#C1443A12" }}>
                  {r.isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-[#4A8B7A]" aria-label="Correct" />
                    : <XCircle className="w-4 h-4 text-clinical-red" aria-label="Incorrect" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-ink-muted">{r.round.topicLabel}</span>
                    <span className={`text-[10px] font-mono font-bold ${r.isCorrect ? "text-[#4A8B7A]" : "text-clinical-red"}`}>
                      {r.isCorrect ? "+10" : r.timedOut ? "Timed out" : "+0"}
                    </span>
                  </div>
                  <p className="text-xs text-ink mt-0.5 leading-snug line-clamp-1">{r.round.question}</p>
                  {!r.isCorrect && (
                    <p className="text-xs text-[#4A8B7A] mt-0.5 font-mono">
                      ✓ {r.round.options[r.round.correctIndex]}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 pb-4">
            <button
              onClick={() => { setGameState("opening"); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Practice Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing Screen ─────────────────────────────────────────────────────────
  if (!currentRound) return null;

  const getOptionState = (i: number): OptionState => {
    if (!showFeedback) return selectedAnswer === i ? "selected" : "idle";
    if (i === currentRound.correctIndex) return "correct";
    if (i === selectedAnswer && !currentRound) return "incorrect";
    if (selectedAnswer === i && i !== currentRound.correctIndex) return "incorrect";
    return "idle";
  };

  return (
    <ActivityShell
      title="IMHS Pharmacy Rush"
      subtitle={`${drug.genericName} · ${mode === "rush" ? "Rush Mode" : "Practice Mode"}`}
      stepLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
      stepIndex={roundIndex}
      totalSteps={rounds.length}
      onExit={() => router.push("/dashboard/practice")}
      showNav={false}
      accentColor="#F16726"
      headerExtra={<ScoreTicker score={score} maxScore={100} />}
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Round info + timer */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F16726]">
              {currentRound.topicLabel}
            </span>
            <p className="text-xs text-ink-muted font-mono mt-0.5">
              Round {roundIndex + 1} of {rounds.length}
            </p>
          </div>
          {mode === "rush" && (
            <CountdownRing
              seconds={timeLeft}
              totalSeconds={ROUND_TIME_SECONDS}
              isUrgent
            />
          )}
          {mode === "practice" && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono bg-slate-100 px-3 py-1.5 rounded-full">
              <BookOpen className="w-3.5 h-3.5" />
              Practice
            </div>
          )}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-base font-display font-semibold text-ink leading-snug">
                {currentRound.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentRound.options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  index={i}
                  label={opt}
                  state={getOptionState(i)}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                />
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold ${
                  selectedAnswer === currentRound.correctIndex
                    ? "bg-[#4A8B7A]/10 border-[#4A8B7A]/30 text-[#2d6655]"
                    : "bg-clinical-red-light border-clinical-red/30 text-clinical-red"
                }`}
              >
                {selectedAnswer === currentRound.correctIndex ? (
                  <><CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden /> Correct! +10 points</>
                ) : (
                  <><XCircle className="w-4 h-4 shrink-0" aria-hidden />
                    {selectedAnswer === null ? "Time's up!" : "Incorrect"} — Correct: {currentRound.options[currentRound.correctIndex]}
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ActivityShell>
  );
}
