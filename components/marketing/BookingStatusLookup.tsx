"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";

export function BookingStatusLookup() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch(`/api/consultations/status?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking not found.");
      }

      setResult(data.booking);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to search booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-chart-grid rounded-card p-6 sm:p-8 shadow-paper max-w-3xl mx-auto space-y-6">
      <div className="border-b border-chart-grid pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 px-2.5 py-1 rounded-full">
            REAL-TIME APPOINTMENT TRACKER
          </span>
          <h3 className="text-xl font-display font-bold text-ink mt-2">
            Check Your Consultation Status &amp; Video Link
          </h3>
        </div>
      </div>

      <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Enter your Reference Code (e.g. IMHS-BOOK-8921)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-white border border-chart-grid rounded-card pl-10 pr-4 py-3 text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-mono font-bold px-6 py-3 rounded-card transition-colors shrink-0 shadow-xs"
        >
          {loading ? "Searching..." : "Track Booking"}
        </button>
      </form>

      {errorMsg && (
        <div className="bg-chart-red/10 border border-chart-red/30 text-chart-red p-4 rounded-card text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {result && (
        <div className="bg-linen/50 border border-chart-grid p-6 rounded-card space-y-4 text-xs font-mono text-ink animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-chart-grid pb-3">
            <span className="font-bold text-clinical-teal text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> {result.bookingCode}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-ink-muted">Status:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full ${
                  result.status === "CONFIRMED"
                    ? "bg-clinical-teal text-white"
                    : result.status === "COMPLETED"
                    ? "bg-linen text-ink border border-chart-grid"
                    : result.status === "CANCELLED"
                    ? "bg-chart-red/10 text-chart-red border border-chart-red/30"
                    : "bg-chart-orange/10 text-chart-orange border border-chart-orange/30 animate-pulse"
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-ink-muted block text-[10px] uppercase">Student Name:</span>
              <span className="font-bold text-ink">{result.studentName}</span>
            </div>
            <div>
              <span className="text-ink-muted block text-[10px] uppercase">Session Type:</span>
              <span className="font-semibold text-ink">{result.sessionType.replace(/_/g, " ")} ({result.durationMins} Mins)</span>
            </div>
            <div>
              <span className="text-ink-muted block text-[10px] uppercase">Scheduled Date &amp; Time:</span>
              <span className="font-bold text-ink">
                {new Date(result.bookingDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} @ {result.timeSlot}
              </span>
            </div>
          </div>

          {/* Meeting Link Notification Box */}
          <div className="pt-3 border-t border-chart-grid">
            {result.meetingLink ? (
              <div className="bg-clinical-teal/10 border border-clinical-teal/30 p-4 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-clinical-teal flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Google Meet Video Room Ready!
                  </span>
                  <p className="text-[11px] text-ink-muted font-sans">
                    Dr. Isuru Wijesinghe has confirmed your session. Click below to join the video room.
                  </p>
                </div>
                <a
                  href={result.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-clinical-teal text-white hover:bg-clinical-teal-hover text-xs font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Video className="w-3.5 h-3.5" /> Join Video Call <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="bg-chart-orange/10 border border-chart-orange/30 p-4 rounded-card text-xs text-ink space-y-1">
                <span className="font-bold text-chart-orange flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Pending Video Room Link Assignment
                </span>
                <p className="text-[11px] text-ink-muted font-sans">
                  Your appointment request is registered. Once approved by administration, your Google Meet video link will appear right here and will be sent via WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
