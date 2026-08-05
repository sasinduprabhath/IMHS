"use client";

import { useEffect } from "react";

interface DashboardTourProps {
  shouldRun: boolean;
}

export function DashboardTour({ shouldRun }: DashboardTourProps) {
  useEffect(() => {
    if (!shouldRun) return;

    let destroyed = false;

    async function initTour() {
      const { driver } = await import("driver.js");
      await import("driver.js/dist/driver.css");

      const markTourCompleted = () => {
        if (!destroyed) {
          destroyed = true;
          fetch("/api/student/tour", { method: "PATCH" }).catch(() => {});
        }
      };

      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayOpacity: 0.72,
        smoothScroll: true,
        allowClose: true,
        popoverClass: "imhs-tour-popover",
        progressText: "Step {{current}} of {{total}}",
        nextBtnText: "Next &rarr;",
        prevBtnText: "&larr; Back",
        doneBtnText: "Got it!",
        steps: [
          {
            element: "#tour-device-badge",
            popover: {
              title: "Device Security Badge",
              description:
                "Your current device is locked and authenticated. Only this registered device can stream your IMHS video content, keeping your account exclusive and secure.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-stats-grid",
            popover: {
              title: "Progress & Metrics",
              description:
                "Track your enrolled courses, active programs, completed lessons, and overall completion percentage in real time.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-courses-section",
            popover: {
              title: "Course Directory & Video Player",
              description:
                "Click any program to access domain-locked HD video lectures, lab reference guides, and chapter progress tracking.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-ai-chat",
            popover: {
              title: "24/7 AI Assistant",
              description:
                "Need instant technical help or portal guidance? Click this floating button anytime to chat with the IMHS AI support assistant.",
              side: "left",
              align: "start",
            },
          },
          {
            element: "#tour-whatsapp-support",
            popover: {
              title: "Admin WhatsApp Escalation",
              description:
                "Request device resets, submit bank payment receipts, or contact the IMHS administrative desk directly on WhatsApp.",
              side: "right",
              align: "start",
            },
          },
        ],
        onDestroyStarted: () => {
          markTourCompleted();
          driverObj.destroy();
        },
      });

      // Small delay so the dashboard DOM is fully rendered before spotlighting
      setTimeout(() => {
        if (!destroyed) {
          driverObj.drive();
        }
      }, 600);
    }

    initTour();
  }, [shouldRun]);

  return null;
}