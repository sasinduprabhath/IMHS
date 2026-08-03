"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import {
  LogIn, Lock, Mail, MessageSquare, AlertCircle, ShieldCheck, Eye, EyeOff,
  GraduationCap, HeartPulse, Award, Stethoscope,
} from "lucide-react";

const FEATURES = [
  { icon: GraduationCap, text: "Access your full clinical curriculum" },
  { icon: HeartPulse, text: "HD video lectures & ECG masterclasses" },
  { icon: Award, text: "SLMC exam preparation modules" },
  { icon: Stethoscope, text: "Downloadable lab reference PDFs" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        const res = await fetch("/api/auth/session");
        const sessionData = await res.json();
        if (sessionData?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="w-full space-y-6"
    >
      {/* Card header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)", boxShadow: "0 4px 16px rgba(14,87,164,.30)" }}>
            <LogIn className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-ink">Sign in to your portal</h2>
        <p className="text-sm text-ink-muted font-sans">
          Enter the credentials provided by the IMHS administrative desk.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm text-[#EF4444] border"
          style={{ background: "rgba(239,68,68,.06)", borderColor: "rgba(239,68,68,.20)" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium text-xs">{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-sage" />
            <input
              type="email"
              required
              placeholder="student@imhs.edu.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white focus:shadow-glow transition-all duration-200 font-sans"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-sage" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white focus:shadow-glow transition-all duration-200 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-sage hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
              boxShadow: loading ? "none" : "0 4px 16px rgba(14,87,164,.35), 0 2px 8px rgba(14,87,164,.18)",
            }}
          >
            {loading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Authenticating…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In to Portal
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help link */}
      <div className="pt-3 border-t border-[#F1F5F9] text-center space-y-2">
        <p className="text-xs text-ink-muted">Forgot credentials or haven&apos;t received them yet?</p>
        <Link
          href={createCourseInquiryWALink()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E57A4] hover:text-[#F16726] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Contact Administrator on WhatsApp
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left Panel: Brand (hidden on mobile) ─────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #071120 0%, #0A1628 50%, #0C1A30 100%)",
        }}
      >
        {/* Mesh gradient blobs */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 20% 0%, rgba(14,87,164,.20) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(241,103,38,.10) 0%, transparent 50%)" }} />
        {/* Brand accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="IMHS Logo"
              width={160}
              height={50}
              className="h-10 w-auto object-contain brightness-0 invert opacity-90"
            />
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold border border-white/10 bg-white/5 px-3 py-1.5 rounded-pill">
              <ShieldCheck className="w-3 h-3" />
              Secure Academic Portal
            </div>
            <h1 className="text-3xl xl:text-4xl font-display font-bold text-white leading-[1.15]">
              Sri Lanka&apos;s Premier<br />
              <span className="text-[#60A5FA]">Healthcare Education</span><br />
              Platform
            </h1>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Access your full clinical curriculum — SLMC exam prep, pathology masterclasses, ECG training, and certification programs.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <span className="text-white/65 text-sm font-sans">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Footer stat */}
        <div className="relative z-10 flex items-center gap-6">
          {[
            { value: "3,500+", label: "Graduates" },
            { value: "2019", label: "Established" },
            { value: "4+", label: "Programs" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-display font-bold text-white">{value}</div>
              <div className="text-[10px] font-mono uppercase text-white/35 tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Login Form ───────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 40%, #ffffff 100%)" }}
      >
        {/* Subtle mesh */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(14,87,164,.06) 0%, transparent 55%)" }} />

        {/* Mobile logo (only shown on small screens) */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="IMHS" width={140} height={44} className="h-10 w-auto object-contain mx-auto" />
          </Link>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-white rounded-2xl p-8 sm:p-10"
          style={{ boxShadow: "0 8px 40px rgba(10,18,30,.10), 0 2px 8px rgba(10,18,30,.06)", border: "1px solid #E2E8F0" }}
        >
          <Suspense fallback={
            <div className="p-8 text-center font-mono text-xs text-sage">Loading authentication form...</div>
          }>
            <LoginForm />
          </Suspense>
        </motion.div>

        {/* Back to site link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 mt-6"
        >
          <Link href="/" className="text-xs text-ink-muted hover:text-ink font-sans transition-colors inline-flex items-center gap-1.5">
            ← Back to IMHS website
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
