"use client";

import React, { useEffect, useRef } from "react";

export function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ["#0E57A4", "#00F0FF", "#F16726", "#10B981", "#FFB800", "#EC4899", "#8B5CF6"];

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      rot: number;
      vRot: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: width * (0.2 + Math.random() * 0.6),
      y: height * 0.4 + (Math.random() - 0.5) * 100,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 18,
      vy: -12 - Math.random() * 12,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    }));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // gravity
        p.vx *= 0.98; // air resistance
        p.rot += p.vRot;
        p.alpha -= 0.007;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
