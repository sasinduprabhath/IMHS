"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";

interface Waypoint {
  id: string;
  label: string;
  step: string;
}

// Page-specific section waypoints map
const ROUTE_WAYPOINTS: Record<string, Waypoint[]> = {
  "/": [
    { id: "top", label: "Overview", step: "01" },
    { id: "programs", label: "Programs", step: "02" },
    { id: "faculty", label: "Faculty", step: "03" },
    { id: "enroll", label: "Enroll", step: "04" },
  ],
  "/about": [
    { id: "top", label: "Overview", step: "01" },
    { id: "story", label: "Milestones", step: "02" },
    { id: "values", label: "Values", step: "03" },
    { id: "pathways", label: "Pathways", step: "04" },
  ],
  "/courses": [
    { id: "top", label: "Overview", step: "01" },
    { id: "catalog", label: "Catalog", step: "02" },
  ],
  "/faculty": [
    { id: "top", label: "Overview", step: "01" },
    { id: "directory", label: "Directory", step: "02" },
  ],
  "/consultation": [
    { id: "top", label: "Overview", step: "01" },
    { id: "booking-form", label: "Booking", step: "02" },
    { id: "check-status", label: "Status", step: "03" },
  ],
};

export function AbsorptionLine() {
  const pathname = usePathname() || "/";
  const [activeSection, setActiveSection] = useState<string>("top");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Get waypoints for current route (empty for sub-pages without anchor sections)
  const waypoints = ROUTE_WAYPOINTS[pathname] || [];

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (waypoints.length === 0) return;

    const handleScrollTracking = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;

      // Find the element currently closest to the top of the viewport
      for (let i = waypoints.length - 1; i >= 0; i--) {
        const wp = waypoints[i];
        if (wp.id === "top") {
          if (scrollY < 300) {
            setActiveSection("top");
            break;
          }
          continue;
        }

        const el = document.getElementById(wp.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            setActiveSection(wp.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollTracking, { passive: true });
    handleScrollTracking();

    return () => window.removeEventListener("scroll", handleScrollTracking);
  }, [pathname, waypoints]);

  const scrollToSection = (id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Account for fixed header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── Desktop Route-Aware Left Rail (only shows when page has waypoints) ── */}
      {waypoints.length > 0 && (
        <nav
          aria-label="Section navigation"
          className="hidden xl:flex fixed left-4 2xl:left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center pointer-events-auto select-none opacity-40 hover:opacity-100 transition-opacity duration-300"
        >
          <div className="relative flex flex-col items-center py-2">
            {/* Subtle 1px background guide line */}
            <div className="absolute top-2 bottom-2 w-[1px] bg-slate-300/60 dark:bg-slate-700/60 rounded-full" />

            {/* Liquid gradient fill line */}
            <motion.div
              className="absolute top-2 w-[1.5px] rounded-full origin-top"
              style={{
                scaleY: smoothProgress,
                bottom: 8,
                background: "linear-gradient(180deg, #0E57A4 0%, #38BDF8 60%, #F16726 100%)",
              }}
            />

            {/* Waypoint dots */}
            <div className="relative z-10 flex flex-col gap-8 items-center">
              {waypoints.map((wp) => {
                const isActive = activeSection === wp.id;
                const isHovered = hoveredNode === wp.id;

                return (
                  <div
                    key={wp.id}
                    className="relative flex items-center justify-center cursor-pointer group py-1"
                    onMouseEnter={() => setHoveredNode(wp.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => scrollToSection(wp.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && scrollToSection(wp.id)}
                    aria-label={`Scroll to ${wp.label} section`}
                  >
                    {/* Subtle Node Circle */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-[#0E57A4] ring-4 ring-[#0E57A4]/20 scale-125"
                          : "bg-white border border-slate-300 group-hover:border-[#0E57A4] group-hover:scale-110"
                      }`}
                    />

                    {/* Clean micro-tooltip shown ONLY on direct hover */}
                    <div
                      className={`absolute left-5 pl-1.5 pointer-events-none transition-all duration-200 ${
                        isHovered
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-1 invisible"
                      }`}
                    >
                      <div className="bg-[#0B192C]/90 text-white border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                        <span className="text-[9px] font-mono text-slate-400 font-medium">
                          {wp.step}
                        </span>
                        <span className="text-[11px] font-sans font-semibold tracking-wide">
                          {wp.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* ── Mobile Slim Top Progress Bar ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="xl:hidden fixed top-0 left-0 right-0 h-[2.5px] z-50 origin-left overflow-hidden pointer-events-none"
      >
        <motion.div
          className="w-full h-full origin-left relative"
          style={{
            scaleX: smoothProgress,
            background: "linear-gradient(90deg, #0E57A4 0%, #38BDF8 50%, #F16726 100%)",
          }}
        />
      </div>
    </>
  );
}
