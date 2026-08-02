"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticleProps {
  className?: string;
  count?: number;
}

// Helper function to produce deterministic pseudo-random floats between 0 and 1 based on an index
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999 + 1) * 10000;
  return x - Math.floor(x);
}

// Animated floating particles for the hero background
export function HeroParticles({ count = 20, className }: ParticleProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} />;
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = pseudoRandom(i * 1.1 + 1);
        const r2 = pseudoRandom(i * 2.3 + 2);
        const r3 = pseudoRandom(i * 3.7 + 3);
        const r4 = pseudoRandom(i * 4.9 + 4);
        const r5 = pseudoRandom(i * 5.5 + 5);

        const width = r1 * 4 + 2;
        const height = r2 * 4 + 2;
        const left = `${r3 * 100}%`;
        const top = `${r4 * 100}%`;
        const opacity = r5 * 0.3 + 0.1;
        const color = i % 3 === 0 ? "#0E57A4" : i % 3 === 1 ? "#F16726" : "#70889E";

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width,
              height,
              left,
              top,
              background: color,
              opacity,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, r1 * 20 - 10, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: r2 * 4 + 3,
              delay: r3 * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// Animated grid background
export function AnimatedGrid({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-chart-grid/30" />
      </svg>
    </div>
  );
}

// Glowing orb accent
export function GlowOrb({
  className,
  color = "#0E57A4",
  size = 400,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={cn("absolute rounded-full pointer-events-none blur-3xl", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Animated stat counter
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Scroll reveal wrapper
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const directionMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for children
export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover card with tilt effect
export function HoverCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Typewriter text effect
export function TypewriterText({
  texts,
  className,
}: {
  texts: string[];
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [displayedText, setDisplayedText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayedText.length < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, 70);
    } else if (!isDeleting && displayedText.length === currentText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, 35);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentIndex, texts]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block ml-0.5 w-0.5 h-[1em] bg-chart-red align-middle"
      />
    </span>
  );
}
