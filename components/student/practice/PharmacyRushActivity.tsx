"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, RotateCcw, BookOpen, CheckCircle2, XCircle, Flame,
  Clock, ChevronLeft, Volume2, VolumeX, Sparkles, HeartPulse,
  Snowflake, Lightbulb, Share2, Award, ArrowRight, Check,
  Activity, ShieldAlert, Pill, FileText, Stethoscope,
  FlaskConical, AlertTriangle, ShieldCheck, Search
} from "lucide-react";
import { generateRushRounds } from "@/data/pharmacyRushRounds";
import { arcadeAudio } from "@/lib/arcadeSounds";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";
import { getPharmacyRushLeaderboard } from "@/actions/pharmacy-rush-actions";
import type { Drug, RushRound } from "@/types/pharmacology";

const ROUND_TIME_SECONDS = 15;
const BLITZ_TIME_SECONDS = 10;
const BASE_POINTS_PER_ROUND = 10;
const AUTO_ADVANCE_MS = 1100;

type GameMode = "rush" | "blitz" | "zen";
type GameState = "opening" | "playing" | "results";

interface RoundResult {
  round: RushRound;
  selectedIndex: number | null;
  isCorrect: boolean;
  timedOut: boolean;
  timeSpentSec: number;
  pointsEarned: number;
  multiplier: number;
}

interface LeaderboardEntry {
  id: string;
  score: number;
  timeTakenSec: number;
  createdAt: Date;
  student: {
    name: string | null;
    email: string;
    studentId: string | null;
  };
}

interface PharmacyRushActivityProps {
  drug: Drug;
  availableDrugs?: Drug[];
}

export function PharmacyRushActivity({
  drug: initialDrug,
  availableDrugs = [],
}: PharmacyRushActivityProps) {
  const router = useRouter();
  const [activeDrug, setActiveDrug] = useState<Drug>(initialDrug);
  const [gameState, setGameState] = useState<GameState>("opening");
  const [mode, setMode] = useState<GameMode>("rush");
  const [rounds, setRounds] = useState<RushRound[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [drugSearch, setDrugSearch] = useState("");

  // Clinical Lifelines (1 use per match)
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [activeHintText, setActiveHintText] = useState<string | null>(null);

  // Floating score animation
  const [floatingScore, setFloatingScore] = useState<{ text: string; id: number } | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setIsMuted(arcadeAudio.getIsMuted());
  }, []);

  const toggleSound = () => {
    const muted = arcadeAudio.toggleMute();
    setIsMuted(muted);
  };

  const getRoundDuration = (selectedMode: GameMode) => {
    if (selectedMode === "blitz") return BLITZ_TIME_SECONDS;
    if (selectedMode === "zen") return 9999;
    return ROUND_TIME_SECONDS;
  };

  // ── Start Game ─────────────────────────────────────────────────────────────
  const startGame = (selectedMode: GameMode, targetDrug: Drug = activeDrug) => {
    const generated = generateRushRounds(targetDrug);
    setRounds(generated);
    setMode(selectedMode);
    setRoundIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setResults([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowConfetti(false);

    // Reset lifelines
    setUsedFiftyFifty(false);
    setUsedFreeze(false);
    setUsedHint(false);
    setEliminatedOptions([]);
    setIsFrozen(false);
    setActiveHintText(null);

    const initialTime = getRoundDuration(selectedMode);
    setTimeLeft(initialTime);
    roundStartTimeRef.current = Date.now();
    setGameState("playing");
  };

  const currentRound = rounds[roundIndex];

  const getMultiplier = (currentStreak: number) => {
    if (currentStreak >= 7) return 3.0;
    if (currentStreak >= 4) return 2.0;
    if (currentStreak >= 2) return 1.5;
    return 1.0;
  };

  // ── Timer Logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || mode === "zen" || showFeedback || isFrozen) return;

    const limit = getRoundDuration(mode);
    setTimeLeft(limit);
    roundStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 4 && t > 1) {
          arcadeAudio.playTick();
        }
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, gameState, mode, showFeedback, isFrozen]);

  // ── Lifelines Handlers ────────────────────────────────────────────────────
  const handleFiftyFifty = () => {
    if (usedFiftyFifty || showFeedback || !currentRound) return;
    setUsedFiftyFifty(true);
    arcadeAudio.playPowerup();

    const wrongIndices = currentRound.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentRound.correctIndex);

    const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  const handleFreeze = () => {
    if (usedFreeze || showFeedback || mode === "zen") return;
    setUsedFreeze(true);
    setIsFrozen(true);
    arcadeAudio.playPowerup();
    setTimeLeft((prev) => prev + 5);

    setTimeout(() => {
      setIsFrozen(false);
    }, 4000);
  };

  const handleHint = () => {
    if (usedHint || showFeedback || !activeDrug) return;
    setUsedHint(true);
    arcadeAudio.playPowerup();

    let hint = `Clinical Pearl: ${activeDrug.genericName} is indicated for ${activeDrug.mainIndications[0] || "specialist therapy"}.`;
    if (currentRound?.topic === "commonSideEffect" && activeDrug.commonSideEffects[0]) {
      hint = `Adverse Effect: Watch for ${activeDrug.commonSideEffects[0]}.`;
    } else if (currentRound?.topic === "drugClass") {
      hint = `Drug Class: Belongs to ${activeDrug.drugClass}.`;
    } else if (currentRound?.topic === "mechanismOfAction") {
      hint = `Mechanism: ${activeDrug.mechanismOfAction.slice(0, 80)}...`;
    }
    setActiveHintText(hint);
  };

  // ── Answer Handler ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (index: number | null, timedOut = false) => {
      if (showFeedback) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpent = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));
      const isCorrect = index !== null && index === currentRound?.correctIndex;
      setSelectedAnswer(index);
      setShowFeedback(true);

      let roundPoints = 0;
      let currentMult = 1.0;

      if (isCorrect) {
        arcadeAudio.playCorrect();
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((m) => Math.max(m, nextStreak));
        currentMult = getMultiplier(nextStreak);

        const speedBonus = mode !== "zen" && timeSpent <= 4 ? 5 : 0;
        roundPoints = Math.round(BASE_POINTS_PER_ROUND * currentMult + speedBonus);
        setScore((s) => s + roundPoints);

        if (nextStreak >= 3 && nextStreak % 2 === 1) {
          arcadeAudio.playStreak();
        }

        setFloatingScore({
          text: `+${roundPoints} ${currentMult > 1 ? `(x${currentMult} Streak 🔥)` : ""}`,
          id: Date.now(),
        });
      } else {
        arcadeAudio.playWrong();
        setStreak(0);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }

      const result: RoundResult = {
        round: currentRound,
        selectedIndex: index,
        isCorrect,
        timedOut,
        timeSpentSec: timeSpent,
        pointsEarned: roundPoints,
        multiplier: currentMult,
      };
      setResults((prev) => [...prev, result]);

      advanceRef.current = setTimeout(() => {
        if (roundIndex < rounds.length - 1) {
          setRoundIndex((r) => r + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setEliminatedOptions([]);
          setActiveHintText(null);
        } else {
          setGameState("results");
          setShowConfetti(isCorrect || score >= 60);
          arcadeAudio.playVictory();

          const finalScore = score + roundPoints;
          const totalDuration = results.reduce((acc, r) => acc + r.timeSpentSec, timeSpent);

          fetch("/api/learning-hub/submit-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activityType: "PHARMACY_RUSH",
              referenceId: activeDrug.genericName,
              medicineName: activeDrug.genericName,
              score: finalScore,
              maxScore: 100,
              timeTakenSec: totalDuration,
            }),
          }).catch((err) => console.error("Failed to save rush score:", err));
        }
      }, AUTO_ADVANCE_MS);
    },
    [showFeedback, currentRound, streak, mode, score, roundIndex, rounds.length, activeDrug.genericName, results]
  );

  const fetchLeaderboard = async () => {
    try {
      const data = await getPharmacyRushLeaderboard(activeDrug.genericName);
      setLeaderboardData(data as any);
      setShowLeaderboard(true);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    }
  };

  const copyShareText = () => {
    const text = `🏥 IMHS Clinical Pharmacy Rush Report:\nMedicine: ${activeDrug.genericName}\nScore: ${score}/100 pts (${mode.toUpperCase()} Shift)\nMax Streak: ${maxStreak}x 🔥\nInstitute of Medicine and Health Sciences - Clinical Hub`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // 1. OPENING LAUNCHPAD (CLEAN IMHS CLINICAL WEB THEME)
  // ═════════════════════════════════════════════════════════════════════════════
  if (gameState === "opening") {
    return (
      <div className="space-y-6 pb-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard/practice")}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-700 hover:text-[#0E57A4] bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-all duration-200 group"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0E57A4] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Practical Hub</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLeaderboard}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#0E57A4]" />}
            </button>
          </div>
        </div>

        {/* Hero Banner (Matching Practice Hub Luxury Navy Style) */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-gradient-to-br from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] p-8 sm:p-10 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F16726]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
                  Activity 03 · Timed Clinical Speed Challenge
                </span>
              </div>

              <div className="flex items-center gap-3 bg-black/20 border border-white/15 backdrop-blur-md px-4 py-1.5 rounded-2xl text-xs font-mono text-white/90">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>10 Rounds · 100 Pts</span>
              </div>
            </div>

            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight tracking-tight">
                Pharmacy Rush <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-amber-300">Arcade</span>
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-sans pt-1">
                Test your high-speed clinical instincts across 10 rapid-fire rounds of pharmacology, indications, receptor mechanisms, dosages, and rapid pharmacist decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Medicine Selector & Clinical Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-[#0E57A4]" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-slate-900">
                  Select Medicine Profile
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Pick any formulary drug to test your rapid recall:
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] px-3.5 py-1 rounded-full border border-[#0E57A4]/20">
              Active: {activeDrug.genericName}
            </span>
          </div>

          {/* Search Box for Formulary */}
          {availableDrugs.length > 4 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={drugSearch}
                onChange={(e) => setDrugSearch(e.target.value)}
                placeholder="Search formulary medicine to rush..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition"
              />
            </div>
          )}

          {/* Medicine Pills Rack */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
            {availableDrugs
              .filter(
                (d) =>
                  !drugSearch ||
                  d.genericName.toLowerCase().includes(drugSearch.toLowerCase()) ||
                  d.drugClass.toLowerCase().includes(drugSearch.toLowerCase())
              )
              .map((d) => {
                const isSelected = d.id === activeDrug.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDrug(d)}
                    aria-label={`Select medicine ${d.genericName}`}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E57A4]/30 ${
                      isSelected
                        ? "bg-[#EBF3FA] border-[#0E57A4] shadow-sm ring-2 ring-[#0E57A4]/20"
                        : "bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold ${isSelected ? "text-[#0E57A4]" : "text-slate-900"}`}>
                        {d.genericName}
                      </p>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#0E57A4]" />}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{d.drugClass}</p>
                  </button>
                );
              })}
          </div>

          {/* Loaded Drug Clinical Dossier Card */}
          <div className="bg-gradient-to-br from-slate-50 to-[#F8FAFC] border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Generic & Brands</span>
              <span className="font-bold text-slate-900 text-sm">{activeDrug.genericName}</span>
              {activeDrug.brandNames && (
                <span className="text-slate-500 block text-[11px] font-normal">{activeDrug.brandNames.join(", ")}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Therapeutic Class</span>
              <span className="font-bold text-[#0E57A4] text-xs">{activeDrug.drugClass}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Main Indication</span>
              <span className="font-bold text-emerald-700 text-xs">{activeDrug.mainIndications[0]}</span>
            </div>
          </div>
        </div>

        {/* Shift Mode Selector Cards */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#0E57A4]" /> Select Practice Mode
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Speed Rush */}
            <button
              onClick={() => startGame("rush")}
              className="bg-white hover:bg-slate-50 rounded-3xl border-2 border-[#F16726]/40 hover:border-[#F16726] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#F16726]/10 border border-[#F16726]/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#F16726]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#F16726]/10 text-[#F16726] px-2.5 py-1 rounded-full border border-[#F16726]/20">
                  15s Rush
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Speed Rush</h3>
                <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                  15-second clock with consecutive streak multipliers and tactical lifelines.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#F16726] pt-1 group-hover:translate-x-1 transition-transform">
                Start Rush <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Blitz Rush */}
            <button
              onClick={() => startGame("blitz")}
              className="bg-white hover:bg-slate-50 rounded-3xl border-2 border-[#0E57A4]/40 hover:border-[#0E57A4] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-[#0E57A4]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#0E57A4]/10 text-[#0E57A4] px-2.5 py-1 rounded-full border border-[#0E57A4]/20">
                  10s Blitz
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Emergency Blitz</h3>
                <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                  10-second rapid-fire adrenaline challenge for seasoned pharmacy students.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#0E57A4] pt-1 group-hover:translate-x-1 transition-transform">
                Start Blitz <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Grand Rounds (Untimed) */}
            <button
              onClick={() => startGame("zen")}
              className="bg-white hover:bg-slate-50 rounded-3xl border-2 border-[#4A8B7A]/40 hover:border-[#4A8B7A] p-6 text-left space-y-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#4A8B7A]/10 border border-[#4A8B7A]/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#4A8B7A]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-[#4A8B7A]/10 text-[#4A8B7A] px-2.5 py-1 rounded-full border border-[#4A8B7A]/20">
                  Untimed
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Clinical Review</h3>
                <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                  Zero timer pressure. Read clinical explanations and learn at your own pace.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#4A8B7A] pt-1 group-hover:translate-x-1 transition-transform">
                Review Mode <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Global Leaderboard Modal */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setShowLeaderboard(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-900 space-y-5 max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold font-display text-slate-900">Shift Leaderboard</h3>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-slate-500 hover:text-slate-900 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {leaderboardData.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-mono">
                      No leaderboard scores recorded for {activeDrug.genericName} yet. Be the first to claim #1!
                    </div>
                  ) : (
                    leaderboardData.map((entry, idx) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                      return (
                        <div
                          key={entry.id || idx}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold w-6 text-center">{medal}</span>
                            <div>
                              <p className="font-bold text-slate-900">{entry.student?.name || entry.student?.email || "Pharmacy Student"}</p>
                              <p className="text-[10px] font-mono text-slate-500">{entry.timeTakenSec}s completion time</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-mono font-extrabold text-[#0E57A4]">{entry.score}</span>
                            <span className="text-[10px] font-mono text-slate-400 block">points</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. RESULTS SUMMARY (CLEAN MEDICAL DISCHARGE REPORT)
  // ═════════════════════════════════════════════════════════════════════════════
  if (gameState === "results") {
    const pct = Math.round((score / 100) * 100);
    const correctCount = results.filter((r) => r.isCorrect).length;
    const grade =
      pct >= 90
        ? "🌟 Clinical Pharmacology Specialist"
        : pct >= 70
          ? "🎖️ High Clinical Competence"
          : pct >= 50
            ? "🩺 Competent - Review Key Mechanisms"
            : "📚 Practice Recommended Before Ward Rounds";

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <ConfettiCanvas active={showConfetti} />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#0E57A4]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Clinical Shift Performance Summary</h3>
                <p className="text-[10px] font-mono text-slate-500">{activeDrug.genericName} · {mode.toUpperCase()} Mode</p>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
              10 Competencies
            </span>
          </div>

          {/* Primary Score Board */}
          <div className="bg-gradient-to-br from-[#EBF3FA] to-white border border-[#0E57A4]/20 rounded-3xl p-6 text-center space-y-3">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest font-bold">
              Total Score
            </span>

            <div className="text-6xl font-mono font-black text-[#0E57A4]">
              {score}<span className="text-2xl text-slate-400 font-normal">/100</span>
            </div>

            <div className="inline-block bg-[#0E57A4]/10 text-[#0E57A4] border border-[#0E57A4]/20 px-4 py-1.5 rounded-full text-xs font-mono font-bold">
              {grade}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200 font-mono text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Accuracy</span>
                <span className="text-sm font-bold text-emerald-700">{correctCount}/10</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Max Streak</span>
                <span className="text-sm font-bold text-[#F16726]">{maxStreak}x 🔥</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Mode</span>
                <span className="text-sm font-bold text-[#0E57A4] uppercase">{mode}</span>
              </div>
            </div>
          </div>

          {/* Breakdown Accordion */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
              <span>Round-by-Round Clinical Breakdown</span>
              <span className="text-[10px] text-slate-400">10 Rounds</span>
            </h4>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-3.5 flex items-start gap-3 ${r.isCorrect ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50 border-rose-200"
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${r.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                      }`}
                  >
                    {r.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0 font-sans text-xs">
                    <p className="font-bold text-slate-900">{r.round.question}</p>
                    <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                      Correct Answer:{" "}
                      <span className="text-emerald-800 font-bold">{r.round.options[r.round.correctIndex]}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startGame(mode)}
              className="flex-1 py-3 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>

            <button
              onClick={copyShareText}
              className="flex-1 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? "Copied Report!" : "Share Report"}
            </button>

            <button
              onClick={() => setGameState("opening")}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-mono font-bold transition"
            >
              Formulary Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // 3. PLAYING ARENA (CLEAN CLINICAL WORKBENCH)
  // ═════════════════════════════════════════════════════════════════════════════
  const multiplier = getMultiplier(streak);
  const progressPct = ((roundIndex + 1) / 10) * 100;

  return (
    <div
      className={`max-w-3xl mx-auto space-y-5 pb-12 transition-transform duration-100 ${screenShake ? "animate-shake" : ""
        }`}
    >
      {/* Top HUD Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Drug & Round */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGameState("opening")}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Leave Match"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#0E57A4] tracking-wider">
                {activeDrug.genericName}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                Round {roundIndex + 1}/10
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 block truncate">
              {currentRound?.topicLabel}
            </span>
          </div>
        </div>

        {/* Center: Score & Streak */}
        <div className="flex items-center gap-3">
          <div className="text-center font-mono">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">SCORE</span>
            <span className="text-xl font-bold text-slate-900 leading-none">{score}</span>
          </div>

          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 bg-[#F16726]/10 border border-[#F16726]/20 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-[#F16726]"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{streak}x (x{multiplier})</span>
            </motion.div>
          )}
        </div>

        {/* Right: Sound & Timer */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#0E57A4]" />}
          </button>

          {mode !== "zen" && (
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-2xl border font-mono font-bold text-sm transition-all ${isFrozen
                  ? "bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm"
                  : timeLeft <= 3
                    ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
            >
              {timeLeft}s
            </div>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#0E57A4] to-[#F16726]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={roundIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 relative"
      >
        {/* Floating Score Pop */}
        <AnimatePresence>
          {floatingScore && (
            <motion.div
              key={floatingScore.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -35, scale: 1.15 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 right-2 pointer-events-none z-30 font-mono font-bold text-[#F16726] text-base"
            >
              {floatingScore.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-md border border-[#0E57A4]/20">
              {currentRound?.topicLabel}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Round {roundIndex + 1} of 10
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-display font-extrabold text-slate-900 leading-snug pt-1">
            {currentRound?.question}
          </h2>

          {activeHintText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-sans mt-2 flex items-start gap-2"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{activeHintText}</span>
            </motion.div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentRound?.options.map((opt, i) => {
            const isEliminated = eliminatedOptions.includes(i);
            const isSelected = selectedAnswer === i;
            const isCorrect = i === currentRound.correctIndex;

            let buttonClass =
              "bg-white border-slate-200 text-slate-800 hover:border-[#0E57A4]/50 hover:bg-[#EBF3FA]/30";

            if (showFeedback) {
              if (isCorrect) {
                buttonClass = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20";
              } else if (isSelected) {
                buttonClass = "bg-rose-50 border-rose-400 text-rose-700";
              } else {
                buttonClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
              }
            } else if (isEliminated) {
              buttonClass = "bg-slate-50 border-slate-100 text-slate-300 line-through opacity-30 cursor-not-allowed";
            }

            return (
              <motion.button
                key={opt + i}
                whileTap={!showFeedback && !isEliminated ? { scale: 0.99 } : {}}
                disabled={showFeedback || isEliminated}
                onClick={() => handleAnswer(i)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-150 shadow-2xs ${buttonClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${showFeedback && isCorrect
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : showFeedback && isSelected
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-xs sm:text-sm font-sans font-semibold leading-relaxed">
                    {opt}
                  </span>
                </div>

                {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Lifelines Bottom Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-between gap-2 shadow-xs">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold pl-2 hidden sm:inline">
          Lifelines:
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-around sm:justify-end">
          <button
            onClick={handleFiftyFifty}
            disabled={usedFiftyFifty || showFeedback}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${usedFiftyFifty
                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                : "bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 50:50
          </button>

          <button
            onClick={handleFreeze}
            disabled={usedFreeze || showFeedback || mode === "zen"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${usedFreeze || mode === "zen"
                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
              }`}
          >
            <Snowflake className="w-3.5 h-3.5" /> Freeze +5s
          </button>

          <button
            onClick={handleHint}
            disabled={usedHint || showFeedback}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${usedHint
                ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
              }`}
          >
            <Lightbulb className="w-3.5 h-3.5" /> Clinical Pearl
          </button>
        </div>
      </div>
    </div>
  );
}
