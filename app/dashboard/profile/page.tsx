"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, Lock, CheckCircle2, ShieldCheck,
  Eye, EyeOff, KeyRound, AlertCircle, IdCard, BookOpen,
  ChevronRight,
} from "lucide-react";

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: "Password changed successfully." });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "w-full pl-10 pr-10 py-2.5 bg-linen/50 border border-chart-grid rounded-xl text-sm text-ink focus:outline-none focus:border-clinical-teal focus:bg-white transition-all duration-200";
  const labelClass = "block text-xs font-mono text-ink font-semibold mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── CANDIDATE REGISTRATION RECORD ─────────────────────────────── */}
      <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-chart-grid bg-linen/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Large initials avatar */}
            <div className="w-10 h-10 rounded-full bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-base">
              {initials}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">
                Candidate Registration Record
              </p>
              <h1 className="text-sm font-semibold text-ink">{user?.name || "—"}</h1>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase text-sage border border-chart-grid bg-linen px-2 py-0.5 rounded tracking-wider">
            Read-Only
          </span>
        </div>

        {/* Field rows with hairline dividers */}
        <div className="divide-y divide-chart-grid/60">
          {/* Name */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-7 h-7 rounded-lg bg-clinical-teal/8 border border-clinical-teal/15 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-clinical-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold">Full Name</p>
              <p className="text-sm font-semibold text-ink mt-0.5">{user?.name || "—"}</p>
            </div>
          </div>

          {/* Registration ID */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-7 h-7 rounded-lg bg-clinical-teal/8 border border-clinical-teal/15 flex items-center justify-center shrink-0">
              <IdCard className="w-3.5 h-3.5 text-clinical-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold">Registration ID</p>
              {user?.studentId ? (
                <span className="inline-block mt-0.5 text-sm font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {user.studentId}
                </span>
              ) : (
                <p className="text-sm text-sage italic mt-0.5">Assigned by administration</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-7 h-7 rounded-lg bg-clinical-teal/8 border border-clinical-teal/15 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5 text-clinical-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold">Registered Email</p>
              <p className="text-sm text-ink mt-0.5 truncate">{user?.email || "—"}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-7 h-7 rounded-lg bg-clinical-teal/8 border border-clinical-teal/15 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-clinical-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold">WhatsApp Phone</p>
              <p className="text-sm text-ink mt-0.5 font-mono">{user?.phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 bg-linen/30 border-t border-chart-grid/60">
          <p className="text-[11px] font-mono text-sage flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
            Identity records are managed by the IMHS admissions desk. Contact administration to update personal details.
          </p>
        </div>
      </div>

      {/* ── Change Security Password ───────────────────────────────────── */}
      <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-chart-grid bg-linen/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-clinical-teal" />
          </div>
          <h2 className="text-sm font-semibold text-ink">Change Security Password</h2>
        </div>

        <div className="p-6 space-y-4">
          <AnimatePresence mode="wait">
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 font-mono ${
                  statusMsg.type === "success"
                    ? "bg-clinical-teal/8 text-clinical-teal border border-clinical-teal/25"
                    : "bg-chart-red/8 text-chart-red border border-chart-red/25"
                }`}
              >
                {statusMsg.type === "success"
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                <span>{statusMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            {[
              { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
              { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(({ label, value, set, show, toggle }) => (
              <div key={label}>
                <label className={labelClass}>{label} <span className="text-chart-red">*</span></label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-sage" />
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className={fieldClass}
                  />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-3 text-sage hover:text-ink transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 rounded-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  Updating…
                </span>
              ) : (
                <><KeyRound className="w-4 h-4" /> Update Password</>
              )}
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}
