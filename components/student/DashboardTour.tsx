"use client";

import { useEffect, useRef } from "react";

interface DashboardTourProps {
  shouldRun: boolean;
}

export function DashboardTour({ shouldRun }: DashboardTourProps) {
  const driverRef = useRef<any>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!shouldRun) return;
    if (hasInitializedRef.current) return;

    // Check if tour was already completed in this browser session
    if (typeof window !== "undefined" && sessionStorage.getItem("imhs_tour_completed") === "true") {
      return;
    }

    hasInitializedRef.current = true;
    let isCancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    async function initTour() {
      try {
        const { driver } = await import("driver.js");
        await import("driver.js/dist/driver.css");

        if (isCancelled) return;

        // Clean up any stale Driver.js popovers or overlays left in DOM
        document.querySelectorAll(".driver-popover, .driver-overlay, .driver-popover-wrapper").forEach((el) => el.remove());

        const isMobile = window.innerWidth < 768;

        const rawSteps = [
          {
            element: "#tour-device-badge",
            popover: {
              title: "Device Security Badge",
              description:
                "Your current device is locked and authenticated. Only this registered device can stream your IMHS video content, keeping your account exclusive and secure.",
              side: "bottom" as const,
              align: "start" as const,
            },
          },
          {
            element: "#tour-stats-grid",
            popover: {
              title: "Progress & Metrics",
              description:
                "Track your enrolled courses, active programs, completed lessons, and overall completion percentage in real time.",
              side: "bottom" as const,
              align: "start" as const,
            },
          },
          {
            element: "#tour-courses-section",
            popover: {
              title: "Course Directory & Video Player",
              description:
                "Click any program to access domain-locked HD video lectures, lab reference guides, and chapter progress tracking.",
              side: (isMobile ? "bottom" : "top") as any,
              align: "start" as const,
            },
          },
          {
            element: "#tour-ai-chat",
            popover: {
              title: "24/7 AI Assistant",
              description:
                "Need instant technical help or portal guidance? Click this floating button anytime to chat with the IMHS AI support assistant.",
              side: (isMobile ? "top" : "left") as any,
              align: "start" as const,
            },
          },
          {
            element: "#tour-whatsapp-support",
            popover: {
              title: "Admin WhatsApp Escalation",
              description:
                "Request device resets, submit bank payment receipts, or contact the IMHS administrative desk directly on WhatsApp.",
              side: (isMobile ? "top" : "right") as any,
              align: "start" as const,
            },
          },
        ];

        // Filter steps to only target elements actually VISIBLE in current DOM layout
        const validSteps = rawSteps.filter((s) => {
          const el = document.querySelector(s.element) as HTMLElement | null;
          if (!el) return false;
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden" && el.offsetWidth > 0 && el.offsetHeight > 0;
        });

        if (validSteps.length === 0) {
          hasInitializedRef.current = false;
          return;
        }

        const driverObj = driver({
          showProgress: true,
          animate: true,
          overlayOpacity: 0.75,
          smoothScroll: true,
          allowClose: true,
          popoverClass: "imhs-tour-popover",
          progressText: "Step {{current}} of {{total}}",
          nextBtnText: "Next &rarr;",
          prevBtnText: "&larr; Back",
          doneBtnText: "Got it!",
          steps: validSteps,
          onDestroyStarted: () => {
            fetch("/api/student/tour", { method: "PATCH" }).catch(() => {});
            sessionStorage.setItem("imhs_tour_completed", "true");
            if (driverRef.current) {
              try {
                driverRef.current.destroy();
              } catch {}
              driverRef.current = null;
            }
          },
        });

        driverRef.current = driverObj;

        // Launch tour spotlight after short delay for page render stabilization
        timerId = setTimeout(() => {
          if (!isCancelled && driverRef.current) {
            driverObj.drive();
          }
        }, 500);
      } catch (err) {
        console.error("Tour initialization error:", err);
        hasInitializedRef.current = false;
      }
    }

    initTour();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      if (driverRef.current) {
        try {
          driverRef.current.destroy();
        } catch {}
        driverRef.current = null;
      }
      document.querySelectorAll(".driver-popover, .driver-overlay, .driver-popover-wrapper").forEach((el) => el.remove());
    };
  }, [shouldRun]);

  return null;
}