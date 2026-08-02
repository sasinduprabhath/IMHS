"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Lock, CheckCircle2, ShieldCheck,
  Eye, EyeOff, KeyRound, AlertCircle, IdCard,
  GraduationCap, MessageCircle,
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

  return (
    <div className="space-y-6">

      {/* ── Hero Profile Banner ──────────────────────────────────────────── */}
      <div className="relative bg-clinical-teal-surface border border-clinical-teal/20 rounded-2xl overflow-hidden p-6 md:p-8">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-3xl shadow-lg border-2 border-white/30 shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <span className="inline-block font-mono text-[10px] uppercase font-bold tracking-widest text-clinical-teal bg-white/80 border border-clinical-teal/20 px-2.5 py-0.5 rounded">
              IMHS CLINICAL CANDIDATE
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink leading-tight">
              {user?.name || "—"}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {user?.studentId ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-clinical-teal bg-white border border-clinical-teal/20 px-2.5 py-1 rounded-lg shadow-xs">
                  <IdCard className="w-3.5 h-3.5" />
                  {user.studentId}
                </span>
              ) : (
                <span className="text-xs font-mono text-sage italic">Reg ID pending assignment</span>
              )}
              <span className="text-xs font-mono text-sage">{user?.email}</span>
            </div>
          </div>

          {/* Role badge */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-clinical-teal bg-white border border-clinical-teal/20 px-3 py-1 rounded-full">
              <GraduationCap className="w-3 h-3" /> Student
            </span>
            <span className="text-[10px] font-mono text-sage">Since {
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                : "IMHS Portal"
            }</span>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left col: Registration Record (3/5 width) ── */}
        <div className="lg:col-span-3 bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-chart-grid bg-linen/40">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold">
                Candidate Registration Record
              </p>
              <p className="text-xs text-ink-muted mt-0.5">Official identity details managed by IMHS</p>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase text-sage border border-chart-grid bg-linen px-2.5 py-1 rounded-lg tracking-wider">
              Read-Only
            </span>
          </div>

          {/* Field rows */}
          <div className="divide-y divide-chart-grid/50">
            {[
              {
                icon: User,
                label: "Full Name",
                value: user?.name,
                mono: false,
              },
              {
                icon: IdCard,
                label: "Registration ID",
                value: user?.studentId || null,
                mono: true,
                badge: true,
              },
              {
                icon: Mail,
                label: "Registered Email",
                value: user?.email,
                mono: false,
              },
              {
                icon: Phone,
                label: "WhatsApp Phone",
                value: user?.phone,
                mono: true,
              },
            ].map(({ icon: Icon, label, value, mono, badge }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4 group hover:bg-linen/20 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-clinical-teal/8 border border-clinical-teal/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-clinical-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold leading-none mb-1">
                    {label}
                  </p>
                  {badge && !value ? (
                    <p className="text-sm text-sage italic">Assigned by administration</p>
                  ) : badge && value ? (
                    <span className="inline-block text-sm font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                      {value}
                    </span>
                  ) : (
                    <p className={`text-sm text-ink ${mono ? "font-mono" : "font-medium"} truncate`}>
                      {value || "—"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-linen/30 border-t border-chart-grid/60">
            <p className="text-[11px] font-mono text-sage flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
              To update your name or phone, contact your WhatsApp administrator.
            </p>
          </div>
        </div>

        {/* ── Right col: Quick Info (2/5 width) ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account Status card */}
          <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sage font-bold">Account Status</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted font-sans">Portal Access</span>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal inline-block animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted font-sans">Account Type</span>
                <span className="text-xs font-mono font-bold text-ink">Student</span>
              </div>
              {user?.studentId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-muted font-sans">Reg ID</span>
                  <span className="text-xs font-mono font-bold text-clinical-teal">{user.studentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Support card */}
          <div className="bg-white border border-chart-grid rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-sage font-bold">Need Help?</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              For enrollment issues, Reg ID updates, or account queries — contact the IMHS admin desk.
            </p>
            <a
              href={`https://wa.me/94778025050?text=${encodeURIComponent(
                `Hello IMHS, I need help with my student portal account.${user?.studentId ? ` My Reg ID is ${user.studentId}.` : ""}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl border border-chart-grid hover:border-clinical-teal/40 hover:bg-clinical-teal/5 transition-all text-xs font-semibold text-ink"
            >
              <MessageCircle className="w-3.5 h-3.5 text-clinical-teal" />
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* ── Change Security Password ─────────────────────────────────────── */}
      <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-chart-grid bg-linen/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-clinical-teal/10 border border-clinical-teal/20 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-clinical-teal" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink">Change Security Password</h2>
            <p className="text-[11px] text-sage mt-0.5">You must verify your current password first</p>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`mb-4 p-3.5 rounded-xl text-xs flex items-start gap-2 font-mono ${
                  statusMsg.type === "success"
                    ? "bg-clinical-teal/8 text-clinical-teal border border-clinical-teal/25"
                    : "bg-chart-red/8 text-chart-red border border-chart-red/25"
                }`}
              >
                {statusMsg.type === "success"
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                }
                <span>{statusMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordChange}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
                { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map(({ label, value, set, show, toggle }) => (
                <div key={label}>
                  <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
                    {label} <span className="text-chart-red">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-sage pointer-events-none" />
                    <input
                      type={show ? "text" : "password"}
                      required
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-linen/50 border border-chart-grid rounded-xl text-sm text-ink focus:outline-none focus:border-clinical-teal focus:bg-white transition-all duration-200 placeholder:text-sage/40"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-3 text-sage hover:text-ink transition-colors"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Updating…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
              <p className="text-[11px] font-mono text-sage">Min. 6 characters required</p>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
