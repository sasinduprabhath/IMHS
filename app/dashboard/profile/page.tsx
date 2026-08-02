"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, Lock, CheckCircle2, ShieldCheck,
  Eye, EyeOff, KeyRound, AlertCircle
} from "lucide-react";

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (newPassword !== confirmPassword) { setStatusMsg({ type: "error", text: "New passwords do not match." }); return; }
    if (newPassword.length < 6) { setStatusMsg({ type: "error", text: "Password must be at least 6 characters long." }); return; }
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
    } finally { setIsSubmitting(false); }
  };

  const inputClass = "w-full pl-10 pr-10 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:bg-white transition-all duration-200";
  const labelClass = "block text-xs font-mono text-ink font-medium mb-1.5";

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* ── Page Header ── */}
      <div className="pb-5 border-b border-chart-grid">
        <span className="font-mono text-xs text-chart-red uppercase font-semibold tracking-wider">ACCOUNT SETTINGS</span>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink mt-0.5">Student Profile & Security</h1>
        <p className="text-xs text-ink-muted mt-1 font-sans">
          Identity records are managed by the IMHS admissions desk. You may update your security password below.
        </p>
      </div>

      {/* ── Read-Only Profile Card ── */}
      <div className="bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
        <div className="flex items-center gap-3 px-6 py-4 bg-linen/40 border-b border-chart-grid">
          <div className="w-8 h-8 bg-clinical-teal/10 border border-clinical-teal/20 rounded flex items-center justify-center">
            <User className="w-4 h-4 text-clinical-teal" />
          </div>
          <h2 className="text-base font-display font-semibold text-ink">Student Identity Record</h2>
          <span className="ml-auto text-[10px] font-mono text-sage bg-linen border border-chart-grid px-2 py-0.5 rounded">
            READ-ONLY
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: User, label: "Student Name", value: user?.name || "N/A" },
              { icon: Mail, label: "Registered Email", value: user?.email || "N/A" },
              { icon: Phone, label: "WhatsApp Phone", value: (user as any)?.phone || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-linen/60 border border-chart-grid rounded p-4 space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-sage">
                  <Icon className="w-3 h-3 text-clinical-teal" /> {label}
                </span>
                <span className="font-semibold text-ink block text-sm truncate">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-mono text-sage mt-4 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
            To change your name or phone number, please submit a request to your WhatsApp administrator.
          </p>
        </div>
      </div>

      {/* ── Change Password Form ── */}
      <div className="bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
        <div className="flex items-center gap-3 px-6 py-4 bg-linen/40 border-b border-chart-grid">
          <div className="w-8 h-8 bg-clinical-teal/10 border border-clinical-teal/20 rounded flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-clinical-teal" />
          </div>
          <h2 className="text-base font-display font-semibold text-ink">Update Access Password</h2>
        </div>
        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {statusMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`p-3.5 rounded text-xs flex items-start gap-2 font-mono ${statusMsg.type === "success"
                  ? "bg-clinical-teal/8 text-clinical-teal border border-clinical-teal/25"
                  : "bg-chart-red/8 text-chart-red border border-chart-red/25"}`}
              >
                {statusMsg.type === "success"
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                <span>{statusMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
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
                    required value={value}
                    onChange={e => set(e.target.value)}
                    className={inputClass}
                  />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-3 text-sage hover:text-ink transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <Button type="submit" disabled={isSubmitting} className="gap-2 font-semibold">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  Updating...
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
