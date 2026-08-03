"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ShieldCheck, Mail, RefreshCw, AlertCircle, CheckCircle2,
  MessageSquare, ArrowLeft, Clock, Clipboard,
} from "lucide-react";

const WA_LINK = `https://wa.me/94776828490?text=${encodeURIComponent(
  "Hello IMHS Support, I need help with my account login - my device may have been blocked."
)}`;

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const maskedEmail = searchParams.get("email") || "your email";
  const pendingUserId = searchParams.get("uid") || "";
  const expiresAt = searchParams.get("exp") || "";

  // Single string state for the 6-digit code (enables seamless mobile keyboard one-time-code auto-suggest & clipboard paste)
  const [otpValue, setOtpValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input automatically on mount
  useEffect(() => {
    if (expiresAt) {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(ms / 1000)));
    }
    inputRef.current?.focus();
  }, [expiresAt]);

  // Countdown tick
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  // Resend cooldown tick
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpValue(clean);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/\D/g, "").slice(0, 6);
      if (clean) {
        setOtpValue(clean);
        inputRef.current?.focus();
      }
    } catch {
      // If clipboard permissions denied, just focus the input
      inputRef.current?.focus();
    }
  };

  const handleSubmit = useCallback(async () => {
    if (otpValue.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }
    if (!pendingUserId) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingUserId, otp: otpValue }),
      });
      const data = await res.json();

      if (data.status === "SUCCESS") {
        setStatus("success");
        const result = await signIn("credentials", {
          redirect: false,
          verifiedToken: data.verifiedToken,
        });

        if (result?.error) {
          setStatus("error");
          setErrorMsg("Session creation failed. Please log in again.");
          return;
        }

        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();

      } else if (data.status === "EXPIRED") {
        setStatus("error");
        setErrorMsg("Your code has expired. Please log in again.");
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Incorrect code. Please try again.");
        if (data.attemptsRemaining !== undefined) {
          setAttemptsLeft(data.attemptsRemaining);
        }
        setOtpValue("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {
      setStatus("error");
      setErrorMsg("An unexpected error occurred. Please try again.");
    }
  }, [otpValue, pendingUserId, router]);

  // Auto-submit when all 6 digits are typed
  useEffect(() => {
    if (otpValue.length === 6 && status === "idle") {
      handleSubmit();
    }
  }, [otpValue, status, handleSubmit]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    router.push("/login");
  };

  const isExpired = secondsLeft <= 0;
  const digits = Array.from({ length: 6 }, (_, i) => otpValue[i] || "");

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)", boxShadow: "0 6px 20px rgba(14,87,164,.30)" }}
        >
          <Mail className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Check your email</h2>
          <p className="text-sm text-ink-muted mt-1">
            We sent a 6-digit code to <strong className="text-ink">{maskedEmail}</strong>
          </p>
        </div>
      </div>

      {/* Countdown timer */}
      <div className="flex items-center justify-center gap-2">
        <Clock className={`w-4 h-4 ${isExpired ? "text-red-400" : "text-[#0E57A4]"}`} />
        <span className={`text-sm font-mono font-semibold ${isExpired ? "text-red-500" : secondsLeft < 60 ? "text-amber-500" : "text-[#0E57A4]"}`}>
          {isExpired ? "Code expired" : `Expires in ${formatTime(secondsLeft)}`}
        </span>
      </div>

      {/* Error / Success alert */}
      <AnimatePresence mode="wait">
        {status === "error" && errorMsg && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium border"
            style={{ background: "rgba(239,68,68,.06)", borderColor: "rgba(239,68,68,.20)", color: "#EF4444" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-medium border"
            style={{ background: "rgba(16,185,129,.06)", borderColor: "rgba(16,185,129,.20)", color: "#10B981" }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Verified! Redirecting to your dashboard…</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Single Input Field with 6 Visual Box Overlay ── */}
      <div
        className="relative cursor-pointer group"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Invisible real HTML input: triggers mobile keyboard one-time-code auto-suggest & full string paste */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={otpValue}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={status === "loading" || status === "success" || isExpired}
          className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Enter 6-digit verification code"
        />

        {/* Visual 6 boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 pointer-events-none">
          {digits.map((d, i) => {
            const isFocused = otpValue.length === i || (otpValue.length === 6 && i === 5);
            return (
              <React.Fragment key={i}>
                {i === 3 && (
                  <div className="flex items-center">
                    <div className="w-3 h-0.5 rounded-full bg-[#CBD5E1]" />
                  </div>
                )}
                <div
                  className="w-11 h-14 sm:w-13 sm:h-16 flex items-center justify-center text-2xl font-display font-bold rounded-xl border-2 transition-all duration-150"
                  style={{
                    borderColor: isFocused ? "#0E57A4" : d ? "#3B82F6" : "#E2E8F0",
                    background: isFocused ? "#EBF3FA" : d ? "#F8FAFC" : "#ffffff",
                    color: "#0A121E",
                    boxShadow: isFocused ? "0 0 0 3px rgba(14,87,164,.15)" : "none",
                  }}
                >
                  {d}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Paste from Clipboard Helper */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0E57A4] bg-[#EBF3FA] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors"
        >
          <Clipboard className="w-3.5 h-3.5" />
          Paste code from clipboard
        </button>
      </div>

      {/* Attempts remaining indicator */}
      {attemptsLeft < 5 && attemptsLeft > 0 && (
        <p className="text-center text-xs text-amber-500 font-mono font-semibold">
          ⚠ {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={otpValue.length !== 6 || status === "loading" || status === "success" || isExpired}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
          boxShadow: otpValue.length === 6 ? "0 4px 16px rgba(14,87,164,.35)" : "none",
        }}
      >
        {status === "loading" ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            Verifying…
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Verified!
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Verify Code
          </>
        )}
      </button>

      {/* Resend / back links */}
      <div className="pt-2 border-t border-[#F1F5F9] space-y-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <span>Didn&apos;t receive it?</span>
          {resendCooldown > 0 ? (
            <span className="font-mono text-sage">Resend in {resendCooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="font-semibold text-[#0E57A4] hover:text-[#F16726] transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Go back &amp; resend
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-ink-muted">
          <MessageSquare className="w-3.5 h-3.5" />
          <Link href={WA_LINK} target="_blank" className="font-semibold text-[#0E57A4] hover:text-[#F16726] transition-colors">
            Contact IMHS Support on WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="w-full flex-1 min-h-[calc(100vh-68px)] flex items-stretch font-sans overflow-hidden">
      {/* ── Left brand panel (same as login) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-center gap-8 p-10 xl:p-12 relative overflow-hidden self-stretch"
        style={{ background: "linear-gradient(160deg, #071120 0%, #0A1628 50%, #0C1A30 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 20% 0%, rgba(14,87,164,.20) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(241,103,38,.10) 0%, transparent 50%)" }} />
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(14,87,164,.15)", border: "1px solid rgba(14,87,164,.30)" }}>
            <ShieldCheck className="w-8 h-8 text-[#60A5FA]" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-display font-bold text-white leading-tight">
              Two-Factor<br />
              <span className="text-[#60A5FA]">Verification</span>
            </h1>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Your account is protected by email verification. Enter the code we sent to your inbox to complete login.
            </p>
          </div>
          <ul className="space-y-2.5">
            {[
              "One-time code, expires in 10 minutes",
              "Check spam folder if not received",
              "Contact WhatsApp support if locked out",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
                <span className="text-white/55 text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-[10px] font-mono text-white/20 uppercase tracking-widest pt-4 border-t border-white/10">
          IMHS · Secure Portal · 2FA Protected
        </div>
      </div>

      {/* ── Right: OTP form panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 relative overflow-hidden self-stretch"
        style={{ background: "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 40%, #ffffff 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(14,87,164,.06) 0%, transparent 55%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-md bg-white rounded-2xl p-5 sm:p-6"
          style={{ boxShadow: "0 8px 40px rgba(10,18,30,.10), 0 2px 8px rgba(10,18,30,.06)", border: "1px solid #E2E8F0" }}
        >
          <Suspense fallback={<div className="text-center text-xs text-sage font-mono">Loading…</div>}>
            <OtpForm />
          </Suspense>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mt-2"
        >
          <Link href="/login" className="text-xs text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3" /> Back to login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
