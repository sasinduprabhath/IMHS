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
      ? "Zoom Classroom"
      : platform === "meet"
      ? "Google Meet"
      : platform === "teams"
      ? "Microsoft Teams"
      : "Live Classroom";

  return (
    <div className="my-5 relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-white to-blue-50/30 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200">
      {/* Top Accent Brand Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E57A4] via-blue-500 to-cyan-500" />

      <div className="space-y-4">
        {/* ── Top Meta Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Live Online Lecture
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-[#0E57A4]" />
              {platformTitle}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-[11px] font-mono font-semibold text-[#0E57A4]">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Authorized Student Access</span>
          </div>
        </div>

        {/* ── Topic / Lecture Title (if present) ── */}
        {topic && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0E57A4]">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Scheduled Lecture Topic</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug">
              {topic}
            </h3>
          </div>
        )}

        {/* ── Date & Time Schedule ── */}
        {(date || time) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {date && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700">
                <Calendar className="h-4 w-4 text-[#0E57A4]" />
                <span className="font-semibold">{date}</span>
              </div>
            )}
            {time && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700">
                <Clock className="h-4 w-4 text-[#F16726]" />
                <span className="font-semibold">{time}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Action Section: Big Centered CTA (Matching User Screenshot) ── */}
        <div className="pt-2 space-y-2.5 text-center">
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#0E57A4] hover:bg-[#0b4888] text-white px-6 py-4 text-base sm:text-lg font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-[1.008] active:scale-[0.99] cursor-pointer"
          >
            <Video className="h-6 w-6 text-white shrink-0" />
            <span>JOIN THE LIVE LECTURE</span>
          </a>

          <div>
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm sm:text-base font-semibold text-[#0E57A4] hover:text-[#0b4888] hover:underline transition-colors cursor-pointer"
            >
              Click here to join via {platform === "meet" ? "Google Meet" : platform === "teams" ? "Microsoft Teams" : "Zoom"}
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-sans pt-1">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Single-student session. Link sharing or external access is monitored.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
