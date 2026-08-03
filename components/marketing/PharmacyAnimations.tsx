"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─────────────────────────────────────────────
// 1. FLOATING MOLECULES
// Animated molecular bond nodes with connecting lines
// ─────────────────────────────────────────────
export function FloatingMolecules({
  className,
  count = 6,
}: {
  className?: string;
  count?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} />;

  const nodes = Array.from({ length: count }, (_, i) => ({
    cx: pseudoRandom(i * 3.1 + 1) * 80 + 10,
    cy: pseudoRandom(i * 2.7 + 2) * 80 + 10,
    r: pseudoRandom(i * 1.9 + 3) * 5 + 4,
    delay: pseudoRandom(i * 4.3 + 4) * 3,
    duration: pseudoRandom(i * 5.1 + 5) * 4 + 5,
    color: i % 3 === 0 ? "#0E57A4" : i % 3 === 1 ? "#F16726" : "#4A8B7A",
  }));

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Bond lines between adjacent nodes */}
        {nodes.map((n, i) =>
          i < nodes.length - 1 ? (
            <motion.line
              key={`bond-${i}`}
              x1={`${n.cx}%`} y1={`${n.cy}%`}
              x2={`${nodes[i + 1].cx}%`} y2={`${nodes[i + 1].cy}%`}
              stroke={n.color}
              strokeWidth="0.15"
              strokeOpacity="0.25"
              strokeDasharray="0.5 1"
              animate={{ strokeOpacity: [0.1, 0.35, 0.1] }}
              transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null
        )}
        {/* Node circles */}
        {nodes.map((n, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={`${n.cx}%`} cy={`${n.cy}%`}
            r={n.r * 0.25}
            fill={n.color}
            fillOpacity="0.15"
            stroke={n.color}
            strokeWidth="0.1"
            strokeOpacity="0.4"
            animate={{
              cy: [`${n.cy}%`, `${n.cy - 3}%`, `${n.cy}%`],
              fillOpacity: [0.1, 0.25, 0.1],
              r: [n.r * 0.25, n.r * 0.3, n.r * 0.25],
            }}
            transition={{ duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. DNA HELIX
// Animated SVG double helix on right/left side
// ─────────────────────────────────────────────
export function DNAHelix({
  className,
  width = 80,
  height = 400,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const steps = 18;
  const half = width / 2;
  const stepH = height / steps;

  return (
    <div className={cn("pointer-events-none", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: steps }, (_, i) => {
          const y = i * stepH + stepH / 2;
          const phase = (i / steps) * Math.PI * 4;
          const x1 = half + Math.sin(phase) * (half * 0.8);
          const x2 = half - Math.sin(phase) * (half * 0.8);
          const crossVisible = i % 2 === 0;
          return (
            <g key={i}>
              {/* Cross-bridges */}
              {crossVisible && (
                <motion.line
                  x1={x1} y1={y} x2={x2} y2={y}
                  stroke="#4A8B7A"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                  animate={{ strokeOpacity: [0.2, 0.55, 0.2] }}
                  transition={{ duration: 2.5, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {/* Strand 1 node */}
              <motion.circle
                cx={x1} cy={y} r={crossVisible ? 3 : 2}
                fill={crossVisible ? "#0E57A4" : "#70889E"}
                fillOpacity={crossVisible ? "0.6" : "0.3"}
                animate={{ r: [crossVisible ? 3 : 2, crossVisible ? 4 : 2.5, crossVisible ? 3 : 2] }}
                transition={{ duration: 2, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Strand 2 node */}
              <motion.circle
                cx={x2} cy={y} r={crossVisible ? 3 : 2}
                fill={crossVisible ? "#F16726" : "#70889E"}
                fillOpacity={crossVisible ? "0.6" : "0.3"}
                animate={{ r: [crossVisible ? 3 : 2, crossVisible ? 4 : 2.5, crossVisible ? 3 : 2] }}
                transition={{ duration: 2, delay: i * 0.12 + 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          );
        })}
        {/* Strand splines */}
        <motion.path
          d={Array.from({ length: steps }, (_, i) => {
            const y = i * stepH + stepH / 2;
            const phase = (i / steps) * Math.PI * 4;
            const x = half + Math.sin(phase) * (half * 0.8);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ")}
          stroke="#0E57A4"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          fill="none"
          animate={{ strokeOpacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d={Array.from({ length: steps }, (_, i) => {
            const y = i * stepH + stepH / 2;
            const phase = (i / steps) * Math.PI * 4;
            const x = half - Math.sin(phase) * (half * 0.8);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          }).join(" ")}
          stroke="#F16726"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          fill="none"
          animate={{ strokeOpacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. ATOMIC ORBIT
// Decorative atom with orbiting electron paths
// ─────────────────────────────────────────────
export function AtomicOrbit({
  className,
  size = 200,
  color = "#0E57A4",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <div className={cn("pointer-events-none", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Nucleus */}
        <motion.circle
          cx="100" cy="100" r="10"
          fill={color}
          fillOpacity="0.3"
          animate={{ r: [10, 13, 10], fillOpacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="100" cy="100" r="5"
          fill={color}
          fillOpacity="0.7"
          animate={{ r: [5, 7, 5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orbit 1 — horizontal ellipse */}
        <ellipse cx="100" cy="100" rx="70" ry="25" stroke={color} strokeWidth="0.8" strokeOpacity="0.25" />
        <motion.circle
          cx="170" cy="100" r="5"
          fill={color}
          fillOpacity="0.8"
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        {/* Orbit 2 — tilted 60deg */}
        <ellipse cx="100" cy="100" rx="70" ry="25" stroke="#F16726" strokeWidth="0.8" strokeOpacity="0.2" transform="rotate(60 100 100)" />
        <motion.circle
          cx="170" cy="100" r="4"
          fill="#F16726"
          fillOpacity="0.8"
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* Orbit 3 — tilted 120deg */}
        <ellipse cx="100" cy="100" rx="70" ry="25" stroke="#4A8B7A" strokeWidth="0.8" strokeOpacity="0.2" transform="rotate(120 100 100)" />
        <motion.circle
          cx="170" cy="100" r="4"
          fill="#4A8B7A"
          fillOpacity="0.8"
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. PILL CAPSULE ORBS
// Floating pill/capsule shapes in background
// ─────────────────────────────────────────────
export function PillCapsuleOrbs({
  className,
  count = 5,
}: {
  className?: string;
  count?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} />;

  const pills = Array.from({ length: count }, (_, i) => ({
    x: pseudoRandom(i * 2.1 + 1) * 90 + 5,
    y: pseudoRandom(i * 3.7 + 2) * 90 + 5,
    width: pseudoRandom(i * 1.5 + 3) * 30 + 20,
    rotation: pseudoRandom(i * 4.9 + 4) * 180 - 90,
    delay: pseudoRandom(i * 5.3 + 5) * 4,
    duration: pseudoRandom(i * 6.1 + 6) * 5 + 6,
    colorA: i % 2 === 0 ? "#0E57A4" : "#F16726",
    colorB: i % 2 === 0 ? "#4A8B7A" : "#0E57A4",
  }));

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {pills.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.width,
            height: p.width / 2.5,
            transform: `rotate(${p.rotation}deg)`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [p.rotation, p.rotation + 15, p.rotation],
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="100%" height="100%" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left half of capsule */}
            <rect x="0" y="0" width="30" height="24" rx="12" fill={p.colorA} fillOpacity="0.25" />
            {/* Right half of capsule */}
            <rect x="30" y="0" width="30" height="24" rx="12" fill={p.colorB} fillOpacity="0.25" />
            {/* Center line */}
            <line x1="30" y1="2" x2="30" y2="22" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
            {/* Shine */}
            <ellipse cx="15" cy="7" rx="8" ry="3" fill="white" fillOpacity="0.1" />
            <ellipse cx="45" cy="7" rx="8" ry="3" fill="white" fillOpacity="0.1" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. PULSE RING
// Expanding ring animation — for CTAs and icons
// ─────────────────────────────────────────────
export function PulseRing({
  className,
  color = "#0E57A4",
  size = 60,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      {[0, 0.8, 1.6].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: color,
          }}
          animate={{
            scale: [1, 2.2, 3],
            opacity: [0.5, 0.15, 0],
          }}
          transition={{
            duration: 2.5,
            delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. CHEM BOND PARTICLES
// Connected particle network on canvas
// ─────────────────────────────────────────────
export function ChemBondParticles({
  className,
  count = 12,
}: {
  className?: string;
  count?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} />;

  const particles = Array.from({ length: count }, (_, i) => ({
    x: pseudoRandom(i * 2.3 + 1) * 95 + 2.5,
    y: pseudoRandom(i * 3.1 + 2) * 95 + 2.5,
    delay: pseudoRandom(i * 4.7 + 3) * 4,
    duration: pseudoRandom(i * 1.9 + 4) * 5 + 6,
    dy: (pseudoRandom(i * 5.3 + 5) - 0.5) * 6,
    dx: (pseudoRandom(i * 6.1 + 6) - 0.5) * 6,
    color: i % 4 === 0 ? "#0E57A4" : i % 4 === 1 ? "#F16726" : i % 4 === 2 ? "#4A8B7A" : "#70889E",
  }));

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines between close particles */}
        {particles.map((p, i) =>
          particles
            .slice(i + 1)
            .filter((q) => Math.hypot(q.x - p.x, q.y - p.y) < 25)
            .map((q, j) => (
              <motion.line
                key={`l-${i}-${j}`}
                x1={`${p.x}%`} y1={`${p.y}%`}
                x2={`${q.x}%`} y2={`${q.y}%`}
                stroke={p.color}
                strokeWidth="0.12"
                strokeOpacity="0.2"
                animate={{ strokeOpacity: [0.05, 0.25, 0.05] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))
        )}
        {/* Particle dots */}
        {particles.map((p, i) => (
          <motion.circle
            key={`p-${i}`}
            cx={`${p.x}%`} cy={`${p.y}%`}
            r="0.5"
            fill={p.color}
            fillOpacity="0.4"
            animate={{
              cx: [`${p.x}%`, `${p.x + p.dx}%`, `${p.x}%`],
              cy: [`${p.y}%`, `${p.y + p.dy}%`, `${p.y}%`],
              fillOpacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. BENZENE RING (single molecule accent)
// ─────────────────────────────────────────────
export function BenzeneRing({
  className,
  size = 80,
  color = "#0E57A4",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  const cx = size / 2;
  const r = size * 0.35;
  const innerR = r * 0.55;
  // 6 vertices of hexagon
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    return { x: cx + r * Math.cos(angle), y: cx + r * Math.sin(angle) };
  });
  const hexPath = vertices.map((v, i) => `${i === 0 ? "M" : "L"} ${v.x} ${v.y}`).join(" ") + " Z";

  return (
    <motion.div
      className={cn("pointer-events-none", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={hexPath} stroke={color} strokeWidth="1" strokeOpacity="0.3" />
        {/* Inner dashed circle for aromatic ring */}
        <circle cx={cx} cy={cx} r={innerR} stroke={color} strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="2 2" />
        {/* Atom nodes at vertices */}
        {vertices.map((v, i) => (
          <motion.circle
            key={i}
            cx={v.x} cy={v.y} r="2"
            fill={i % 2 === 0 ? color : "#F16726"}
            fillOpacity="0.5"
            animate={{ fillOpacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 8. CROSS (medical cross / red cross symbol)
// ─────────────────────────────────────────────
export function MedicalCross({
  className,
  size = 40,
  color = "#F16726",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <motion.div
      className={cn("pointer-events-none", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="4" width="12" height="32" rx="3" fill={color} fillOpacity="0.2" />
        <rect x="4" y="14" width="32" height="12" rx="3" fill={color} fillOpacity="0.2" />
        <rect x="14" y="4" width="12" height="32" rx="3" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" />
        <rect x="4" y="14" width="32" height="12" rx="3" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 9. STETHOSCOPE PULSE
// Animated stethoscope icon with ECG pulse
// ─────────────────────────────────────────────
export function HeroPharmacyScene({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Bottom-left: Large faint benzene ring */}
      <BenzeneRing
        size={180}
        color="#0E57A4"
        className="absolute -bottom-8 -left-8 opacity-30"
      />
      {/* Top-right: Atomic orbit */}
      <AtomicOrbit
        size={180}
        color="#F16726"
        className="absolute -top-12 -right-12 opacity-20"
      />
      {/* Scattered small crosses */}
      <MedicalCross size={28} color="#F16726" className="absolute top-1/4 right-1/4 opacity-40" />
      <MedicalCross size={20} color="#0E57A4" className="absolute bottom-1/3 left-1/3 opacity-25" />
      {/* Floating molecules */}
      <FloatingMolecules count={8} className="opacity-60" />
    </div>
  );
}
