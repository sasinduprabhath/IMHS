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
        doneBtnText: "Done",
        steps: [
          {
            element: "#tour-device-badge",
            popover: {
              title: "Device Security",
              description:
                "Your current device is locked and authenticated. Only this registered device can stream your IMHS video content, keeping your access secure and exclusive.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-stats-grid",
            popover: {
              title: "Your Progress Stats",
              description:
                "Track your enrolled courses, active programs, completed lessons, and overall progress percentage all at a glance from this dashboard.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-courses-grid",
            popover: {
              title: "My Enrolled Programs",
              description:
                "Click any course card to open your domain-locked video lectures, downloadable PDF lab references, and chapter-by-chapter progress tracker.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-ai-chat",
            popover: {
              title: "24/7 AI Assistant",
              description:
                "Got a portal question or need help navigating a feature? Click this button anytime to chat with the IMHS AI support assistant, instant answers day or night.",
              side: "left",
              align: "start",
            },
          },
          {
            element: "#tour-whatsapp-link",
            popover: {
              title: "WhatsApp Admin Support",
              description:
                "Need a device reset, want to submit a bank payment receipt, or have an urgent access issue? Click here to reach the IMHS administrative desk directly on WhatsApp.",
              side: "right",
              align: "start",
            },
          },
        ],
        onDestroyStarted: () => {
          if (!destroyed) {
            destroyed = true;
            fetch("/api/student/tour", { method: "PATCH" }).catch(() => {});
          }
          driverObj.destroy();
        },
      });

      // Small delay so the dashboard fully renders before spotlighting
      setTimeout(() => {
        if (!destroyed) {
          driverObj.drive();
        }
      }, 800);
    }

    initTour();
  }, [shouldRun]);

  return null;
}