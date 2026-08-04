"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface Waypoint {
  offset: number; // 0–1, fraction of total scroll
  label: string;
}

const WAYPOINTS: Waypoint[] = [
  { offset: 0.25, label: "Programs" },
  { offset: 0.52, label: "Faculty" },
  { offset: 0.72, label: "Enroll" },
];

// Pharmacokinetic absorption curve path (concentration-time curve)
// Snaking left-gutter sine path — classic clinical Cmax/Tmax shape
const SPINE_PATH =
  "M 28 0 C 28 80, 14 140, 14 200 C 14 260, 28 320, 28 400 C 28 480, 14 540, 14 620 C 14 700, 28 760, 28 840 C 28 920, 14 980, 14 1060 C 14 1100, 28 1120, 28 1120";

export function AbsorptionLine() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {/* Desktop: full left-gutter spine — xl and above */}
      <div
        aria-hidden="true"
        className="hidden xl:block fixed left-0 top-0 bottom-0 w-[56px] z-30 pointer-events-none"
      >
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox="0 0 56 1120"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Static ghost track */}
          <path
            d={SPINE_PATH}
            fill="none"
            stroke="rgba(14, 87, 164, 0.10)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Scroll-driven drawn line — uses pathLength motion value */}
          {pathLen > 0 && !prefersReduced && (
            <motion.path
              ref={pathRef}
              d={SPINE_PATH}
              fill="none"
              stroke="rgba(14, 87, 164, 0.50)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength: smoothProgress }}
            />
          )}

          {/* Fully drawn static path for reduced motion */}
          {prefersReduced && (
            <path
              d={SPINE_PATH}
              fill="none"
              stroke="rgba(14, 87, 164, 0.40)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}

          {/* Waypoint markers — circle + mono label */}
          {WAYPOINTS.map((wp) => {
            const yPos = wp.offset * 1120;
            return (
              <g key={wp.label}>
                <circle
                  cx="28"
                  cy={yPos}
                  r="3.5"
                  fill="white"
                  stroke="rgba(14, 87, 164, 0.55)"
                  strokeWidth="1.5"
                />
                <text
                  x="34"
                  y={yPos + 4}
                  fontSize="7"
                  fill="rgba(14, 87, 164, 0.55)"
                  fontFamily="var(--font-mono-family, monospace)"
                  fontWeight="500"
                  letterSpacing="0.05em"
                >
                  {wp.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile: slim top scroll-progress bar — visible below xl */}
      <motion.div
        aria-hidden="true"
        className="xl:hidden fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{
          scaleX: prefersReduced ? 1 : smoothProgress,
          background: "linear-gradient(90deg, #0E57A4 0%, #2172C9 60%, #F16726 100%)",
        }}
      />
    </>
  );
}
