"use client";

import React, { useState } from "react";
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  ShieldCheck,
  Key,
  Radio,
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
  meetingId,
  passcode,
  date,
  time,
  topic,
}: LiveMeetingInfo) {
  const [copiedType, setCopiedType] = useState<"all" | "id" | "passcode" | "url" | null>(null);

  const handleCopyAll = async () => {
    try {
      let textToCopy = `IMHS Live Class\n`;
      if (topic) textToCopy += `Topic: ${topic}\n`;
      if (date) textToCopy += `Date: ${date}\n`;
      if (time) textToCopy += `Time: ${time}\n`;
      if (meetingId) textToCopy += `Meeting ID: ${meetingId}\n`;
      if (passcode) textToCopy += `Passcode: ${passcode}\n`;
      textToCopy += `Join: ${meetingUrl}`;

      await navigator.clipboard.writeText(textToCopy);
      setCopiedType("all");
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyItem = async (type: "id" | "passcode" | "url", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

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
      {/* ── Top Glow & Header ── */}
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

      {/* ── Action Buttons & Credentials Grid ── */}
      <div className="space-y-4 p-5 sm:p-6">
        {/* Primary CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Join Meeting Button */}
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0E57A4] via-blue-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.01] hover:from-[#0b4787] hover:to-cyan-500 active:scale-[0.99]"
          >
            <Video className="h-4 w-4 text-cyan-200" />
            <span>Join Live Class</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>

          {/* Copy All Credentials Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white/90 transition-all hover:bg-white/10 hover:border-white/25 active:scale-[0.99] cursor-pointer"
          >
            {copiedType === "all" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Details Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-cyan-400" />
                <span>Copy Details</span>
              </>
            )}
          </button>
        </div>

        {/* Credentials Badges (Meeting ID & Passcode) */}
        {(meetingId || passcode) && (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
            {meetingId && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 backdrop-blur-xs">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50 block">
                    Meeting ID
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-bold tracking-wider text-cyan-300 select-all">
                    {meetingId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyItem("id", meetingId)}
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  title="Copy Meeting ID"
                >
                  {copiedType === "id" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}

            {passcode && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 backdrop-blur-xs">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-white/50 block">
                    Passcode
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-bold tracking-wider text-amber-300 select-all">
                    {passcode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyItem("passcode", passcode)}
                  className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  title="Copy Passcode"
                >
                  {copiedType === "passcode" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Anti-Leak / Security Notice Footer ── */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 text-[11px] text-amber-200/90 flex items-start gap-2">
          <Key className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="leading-relaxed font-sans">
            <strong className="text-amber-300">Security Notice:</strong> Access to this live class is licensed exclusively for enrolled IMHS students. Sharing credentials or forwarding links to external parties violates student terms and is monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
