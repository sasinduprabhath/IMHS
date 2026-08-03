"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import {
  LogIn, Lock, Mail, MessageSquare, AlertCircle,
  ShieldCheck, Eye, EyeOff, GraduationCap, HeartPulse, Award, Stethoscope,
  Smartphone,
} from "lucide-react";

const FEATURES = [
  { icon: GraduationCap, text: "Access your full clinical curriculum" },
  { icon: HeartPulse,    text: "HD video lectures & ECG masterclasses" },
  { icon: Award,         text: "SLMC exam preparation modules" },
  { icon: Stethoscope,   text: "Downloadable lab reference PDFs" },
];

// ─────────────────────────────────────────────────────────────
// Device fingerprinting — runs entirely client-side
// ─────────────────────────────────────────────────────────────
async function collectDeviceSignature(): Promise<string> {
  try {
    const parts: string[] = [
      navigator.userAgent,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      String(navigator.hardwareConcurrency || 0),
      navigator.language || "",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    ];

    // WebGL GPU renderer (most unique per-device signal)
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          parts.push(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
          parts.push(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)   || "");
        }
      }
    } catch {}

    const raw = parts.join("|");

    // SHA-256 hash via Web Crypto API
    const encoded = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", encoded);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback fingerprint if crypto is unavailable
    return `fallback-${navigator.userAgent.slice(0, 32)}-${screen.width}`;
  }
}

// ─────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [error, setError]           = useState("");
  const [errorType, setErrorType]   = useState<"device" | "general" | null>(null);
  const [loading, setLoading]       = useState(false);
  const [deviceSig, setDeviceSig]   = useState("");

  // Collect device fingerprint silently on mount
  useEffect(() => {
    collectDeviceSignature().then(setDeviceSig);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType(null);
    setLoading(true);

    try {
      // Step 1 — pre-login: validates password, device, generates OTP
      const res = await fetch("/api/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceSignature: deviceSig }),
      });
      const data = await res.json();

      if (data.status === "ADMIN_BYPASS") {
        // Admin: use standard NextAuth credentials flow
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (result?.error) {
          setErrorType("general");
          setError("Invalid admin credentials.");
        } else {
          router.push("/admin");
          router.refresh();
        }
        return;
      }

      if (data.status === "OTP_SENT") {
        // Redirect to OTP verification page
        const params = new URLSearchParams({
          email:  data.maskedEmail  || "",
          uid:    data.pendingUserId || "",
          exp:    data.expiresAt    || "",
        });
        router.push(`/verify-otp?${params.toString()}`);
        return;
      }

      if (data.status === "DEVICE_LOCKED") {
        setErrorType("device");
        setError(data.message || "Account is locked to your primary device.");
        return;
      }

      // Generic error
      setErrorType("general");
      setError(data.message || "Invalid email or password.");

    } catch {
      setErrorType("general");
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
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)", boxShadow: "0 4px 16px rgba(14,87,164,.30)" }}
          >
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
          className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-medium border"
          style={{
            background: errorType === "device" ? "rgba(241,103,38,.06)" : "rgba(239,68,68,.06)",
            borderColor: errorType === "device" ? "rgba(241,103,38,.25)" : "rgba(239,68,68,.20)",
            color:       errorType === "device" ? "#C2410C" : "#EF4444",
          }}
        >
          {errorType === "device" ? (
            <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1.5">
            <span>{error}</span>
            {errorType === "device" && (
              <div>
                <Link
                  href={createCourseInquiryWALink()}
                  target="_blank"
                  className="underline font-semibold"
                >
                  Contact IMHS Support on WhatsApp →
                </Link>
              </div>
            )}
          </div>
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
              className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white transition-all duration-200 font-sans"
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
              className="w-full pl-10 pr-11 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white transition-all duration-200 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPassword)}
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
                Verifying…
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

      {/* 2FA info badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EBF3FA] border border-[#BFDBFE]">
        <ShieldCheck className="w-4 h-4 text-[#0E57A4] shrink-0" />
        <p className="text-[11px] text-[#1E40AF] font-sans leading-snug">
          <strong>2-Factor Secured</strong> — a verification code will be emailed to you after password check.
        </p>
      </div>

      {/* Help link */}
      <div className="pt-2 border-t border-[#F1F5F9] text-center space-y-2">
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

// ─────────────────────────────────────────────────────────────
// Page wrapper (split-panel layout)
// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #071120 0%, #0A1628 50%, #0C1A30 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 20% 0%, rgba(14,87,164,.20) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(241,103,38,.10) 0%, transparent 50%)" }} />
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

        <div className="relative z-10">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/footer-logo.png" alt="IMHS Logo" className="h-10 w-auto object-contain brightness-0 invert opacity-90" />
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold border border-white/10 bg-white/5 px-3 py-1.5 rounded-full">
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

        <div className="relative z-10 flex items-center gap-6">
          {[
            { value: "3,500+", label: "Graduates" },
            { value: "2019",   label: "Established" },
            { value: "4+",     label: "Programs" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-display font-bold text-white">{value}</div>
              <div className="text-[10px] font-mono uppercase text-white/35 tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 40%, #ffffff 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(14,87,164,.06) 0%, transparent 55%)" }} />

        <div className="lg:hidden mb-8 text-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="IMHS" className="h-10 w-auto object-contain mx-auto" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-white rounded-2xl p-8 sm:p-10"
          style={{ boxShadow: "0 8px 40px rgba(10,18,30,.10), 0 2px 8px rgba(10,18,30,.06)", border: "1px solid #E2E8F0" }}
        >
          <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-sage">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </motion.div>

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
