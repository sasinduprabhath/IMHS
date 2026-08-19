"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreTickerProps {
  score: number;
  maxScore?: number;
  className?: string;
  label?: string;
}

export function ScoreTicker({ score, maxScore = 100, className, label = "SCORE" }: ScoreTickerProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score === prevScore.current) return;

    // Count up animation
    const start = prevScore.current;
    const end = score;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prevScore.current = score;
  }, [score]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <motion.div
        key={score}
        initial={{ scale: score > 0 ? 1.25 : 1, color: score > 0 ? "#0E57A4" : "#0F172A" }}
        animate={{ scale: 1, color: "#0F172A" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-xl font-mono font-bold text-slate-900 leading-none tabular-nums"
      >
        {displayScore}
        {maxScore && (
          <span className="text-xs font-mono text-slate-400 font-normal">/{maxScore}</span>
        )}
      </motion.div>
    </div>
  );
}
