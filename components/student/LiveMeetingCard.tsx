"use client";

import React from "react";
import {
  Video,
  ExternalLink,
  Calendar,
  Clock,
  ShieldCheck,
  Lock,
  Sparkles,
} from "lucide-react";

export interface LiveMeetingInfo {
  platform?: "zoom" | "meet" | "teams" | "live";
  meetingUrl: string;
  meetingId?: string | null;
  passcode?: string | null;
  date?: string | null;
  time?: string | null;
  topic?: string | null;
}

export function LiveMeetingCard({
  platform = "zoom",
  meetingUrl,
  date,
  time,
  topic,
}: LiveMeetingInfo) {
  const platformTitle =
    platform === "zoom"
      ? "Zoom Live Classroom"
      : platform === "meet"
      ? "Google Meet Live Class"
      : platform === "teams"
      ? "Microsoft Teams Live"
      : "Live Online Classroom";

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 text-white shadow-xl">
      {/* ── Header ── */}
      <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Live Indicator + Platform */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Online Lecture
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] font-medium text-white/70">
              {platformTitle}
            </span>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-0.5 text-[10px] font-mono font-semibold text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Enrolled Student Session</span>
          </div>
        </div>

        {/* Topic / Lecture Title (if present) */}
        {topic && (
          <div className="mt-3 flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <h4 className="font-display text-base font-bold text-white sm:text-lg">
              {topic}
            </h4>
          </div>
        )}

        {/* Date & Time pills (if present) */}
        {(date || time) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 font-mono text-xs">
            {date && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                {date}
              </span>
            )}
            {time && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {time}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Single Direct Join Button ── */}
      <div className="space-y-3.5 p-5 sm:p-6">
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0E57A4] via-blue-600 to-cyan-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.01] hover:from-[#0b4787] hover:to-cyan-500 active:scale-[0.99] cursor-pointer"
        >
          <Video className="h-5 w-5 text-cyan-200" />
          <span>Join Live Class</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </a>

        {/* ── Security Notice Footer ── */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2 text-[11px] text-amber-200/90 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="leading-relaxed font-sans">
            <strong className="text-amber-300">Protected Session:</strong> Access is exclusively for enrolled students. Link sharing and external forwarding are strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
