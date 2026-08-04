"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { AISupportChat } from "@/components/student/AISupportChat";

export function PublicFloatingControls() {
  const [showScrollUp, setShowScrollUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollUp(true);
      } else {
        setShowScrollUp(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* ── Scroll To Top Button ── */}
      <AnimatePresence>
        {showScrollUp && (
          <motion.button
            key="scroll-up"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#0E57A4]/20 text-[#0E57A4] shadow-lg flex items-center justify-center hover:bg-[#0E57A4] hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 group"
            title="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── AI Assistant Chatbot Widget (Accessible without login) ── */}
      <div className="pointer-events-auto">
        <AISupportChat triggerClassName="relative bottom-auto right-auto z-auto" />
      </div>
    </div>
  );
}
