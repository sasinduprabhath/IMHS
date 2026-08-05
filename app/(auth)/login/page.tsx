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
  { icon: HeartPulse, text: "HD video lectures & ECG masterclasses" },
  { icon: Award, text: "SLMC exam preparation modules" },
  { icon: Stethoscope, text: "Downloadable lab reference PDFs" },
];

// ─────────────────────────────────────────────────────────────
// Device fingerprinting - runs entirely client-side
// ─────────────────────────────────────────────────────────────
async function collectDeviceSignature(): Promise<{ hash: string; info: string }> {
  try {
    const ua = navigator.userAgent;
    let osCategory = "desktop";
    let os = "Desktop";
    if (ua.includes("Windows")) { osCategory = "windows"; os = "Windows PC"; }
    else if (ua.includes("Mac OS")) { osCategory = "mac"; os = "macOS"; }
    else if (ua.includes("Android")) { osCategory = "android"; os = "Android Phone"; }
    else if (ua.includes("iPhone") || ua.includes("iPad")) { osCategory = "ios"; os = "iOS Device"; }
    else if (ua.includes("Linux")) { osCategory = "linux"; os = "Linux"; }

    let browser = "Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Firefox")) browser = "Firefox";

    const info = `${os} · ${browser} (${screen.width}x${screen.height})`;

    // Hardware-first, OS-Update Proof fingerprint components
    // Excludes volatile version strings (e.g. Chrome/122 or Android/14)
    const parts: string[] = [
      osCategory,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      String(navigator.hardwareConcurrency || 0),
      String((navigator as unknown as { deviceMemory?: number }).deviceMemory || 0),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    ];

    // WebGL Hardware GPU Fingerprint (Unmasked GPU Renderer + Vendor)
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          parts.push(String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || ""));
          parts.push(String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || ""));
        }
      }
    } catch { }

    // Canvas rendering signature (hardware GPU rasterization output)
    try {
      const canvas2 = document.createElement("canvas");
      canvas2.width = 200;
      canvas2.height = 40;
      const ctx = canvas2.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("IMHS-DEVICE-LOCK-V1", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("IMHS-DEVICE-LOCK-V1", 4, 17);
        parts.push(canvas2.toDataURL().slice(-50));
      }
    } catch { }

    const raw = parts.join("|");
    const encoded = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", encoded);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash = hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");

    return { hash, info };
  } catch {
    return {
      hash: `fallback-${screen.width}x${screen.height}-${navigator.hardwareConcurrency || 0}`,
      info: `Web Browser (${screen.width}x${screen.height})`,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"device" | "general" | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceSig, setDeviceSig] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");

  // Collect device fingerprint silently on mount
  useEffect(() => {
    collectDeviceSignature().then(({ hash, info }) => {
      setDeviceSig(hash);
      setDeviceInfo(info);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType(null);
    setWaLink(null);
    setLoading(true);

    try {
      // Step 1 - pre-login: validates password, device, generates OTP
      const res = await fetch("/api/auth/pre-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceSignature: deviceSig, deviceInfo }),
      });
      const data = await res.json();

      if (data.status === "ADMIN_BYPASS") {
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
        const params = new URLSearchParams({
          email: data.maskedEmail || "",
          uid: data.pendingUserId || "",
          exp: data.expiresAt || "",
        });
        router.push(`/verify-otp?${params.toString()}`);
        return;
      }

      if (data.status === "DEVICE_LOCKED") {
        setErrorType("device");
        setError(data.message || "Account is locked to your primary device.");
        setWaLink(data.waLink || null);
        return;
      }

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
      className="w-full space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)", boxShadow: "0 4px 16px rgba(14,87,164,.30)" }}
          >
            <LogIn className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-ink">Sign in to your portal</h2>
        <p className="text-xs sm:text-sm text-ink-muted font-sans">
          Enter the credentials provided by the IMHS administrative desk.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium border"
          style={{
            background: errorType === "device" ? "rgba(241,103,38,.06)" : "rgba(239,68,68,.06)",
            borderColor: errorType === "device" ? "rgba(241,103,38,.25)" : "rgba(239,68,68,.20)",
            color: errorType === "device" ? "#C2410C" : "#EF4444",
          }}
        >
          {errorType === "device" ? (
            <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="space-y-2">
            <span>{error}</span>
            {errorType === "device" && waLink && (
              <div className="pt-1">
                <Link
                  href={waLink}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95"
                  style={{ background: "linear-gradient(135deg, #F16726 0%, #D95316 100%)" }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Request Device Unlock on WhatsApp →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="block text-xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-sage" />
            <input
              type="email"
              required
              placeholder="student@imhs.edu.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white transition-all duration-200 font-sans"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono font-semibold text-ink-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-sage" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-11 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-ink placeholder:text-sage/60 focus:outline-none focus:border-[#0E57A4] focus:bg-white transition-all duration-200 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPassword)}
              className="absolute right-3.5 top-3 text-sage hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
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
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EBF3FA] border border-[#BFDBFE]">
        <ShieldCheck className="w-4 h-4 text-[#0E57A4] shrink-0" />
        <p className="text-[11px] text-[#1E40AF] font-sans leading-snug">
          <strong>2-Factor Secured</strong> - a verification code will be emailed to you after password check.
        </p>
      </div>

      {/* Help link */}
      <div className="pt-2 border-t border-[#F1F5F9] text-center space-y-1">
        <p className="text-[11px] text-ink-muted">Forgot credentials or haven&apos;t received them yet?</p>
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
    <div className="w-full flex-1 min-h-screen pt-[68px] flex items-stretch font-sans overflow-hidden">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-center p-8 xl:p-12 relative overflow-hidden self-stretch"
        style={{ background: "linear-gradient(160deg, #071120 0%, #0A1628 50%, #0C1A30 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 20% 0%, rgba(14,87,164,.20) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(241,103,38,.10) 0%, transparent 50%)" }} />
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

        {/* Vertically centered content container */}
        <div className="my-auto space-y-8 max-w-xl mx-auto w-full relative z-10">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold border border-white/10 bg-white/5 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Secure Academic Portal
              </div>
              <h1 className="text-3xl xl:text-4xl font-display font-bold text-white leading-[1.15]">
                Sri Lanka&apos;s Premier<br />
                <span className="text-[#60A5FA]">Healthcare Education</span><br />
                Platform
              </h1>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed max-w-sm">
                Access your full clinical curriculum - SLMC exam prep, pathology masterclasses, ECG training, and certification programs.
              </p>
            </div>
            <ul className="space-y-2.5">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#60A5FA]" />
                  </div>
                  <span className="text-white/65 text-xs sm:text-sm font-sans">{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-8 pt-6 border-t border-white/10">
            {[
              { value: "3,500+", label: "Graduates" },
              { value: "2019", label: "Established" },
              { value: "4+", label: "Programs" },
            ].map(({ value, label }) => (
              <div key={label} className="text-left">
                <div className="text-lg xl:text-xl font-display font-bold text-white leading-none">{value}</div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden self-stretch"
        style={{ background: "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 40%, #ffffff 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(14,87,164,.06) 0%, transparent 55%)" }} />

        {/* Vertically centered form container */}
        <div className="my-auto w-full max-w-md flex flex-col items-center space-y-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-2xl p-6 sm:p-7"
            style={{ boxShadow: "0 8px 40px rgba(10,18,30,.10), 0 2px 8px rgba(10,18,30,.06)", border: "1px solid #E2E8F0" }}
          >
            <Suspense fallback={<div className="p-4 text-center font-mono text-xs text-sage">Loading…</div>}>
              <LoginForm />
            </Suspense>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/" className="text-xs text-ink-muted hover:text-ink font-sans transition-colors inline-flex items-center gap-1.5">
              ← Back to IMHS website
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
