"use client";

import React, { useState, useEffect } from "react";
import { LiveChatBox } from "@/components/chat/LiveChatBox";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentChatWidget({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread messages count in background
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch("/api/chat/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        // Silently ignore network hiccup
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // When widget opens, mark count as 0 locally
  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* ── Floating Launcher Button (Left of AI bot or standalone bottom-right) ── */}
      <div className="fixed bottom-6 right-24 z-40">
        <button
          onClick={handleOpen}
          aria-label="Open Academic Desk Live Chat"
          className="relative group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#0E57A4] to-[#0A3D73] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 backdrop-blur-md"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#F16726] text-white text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full ring-2 ring-white animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold font-sans tracking-wide hidden sm:inline">
            Admin Desk Chat
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
        </button>
      </div>

      {/* ── Slide-over Chat Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 sm:hidden"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[calc(100vh-32px)] flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-white"
            >
              {/* Close Button Header Overlay */}
              <div className="absolute top-3.5 right-3.5 z-20">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Body */}
              <LiveChatBox
                currentUserId={user.id}
                currentUserRole="STUDENT"
                targetName="IMHS Academic Desk"
                targetSubtext="Official Academic & Student Administration"
                className="h-full rounded-2xl border-0"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
