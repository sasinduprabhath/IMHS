"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { LogIn, Lock, Mail, MessageSquare, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";

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

  const inputBase = "w-full pl-10 pr-4 py-3 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink placeholder:text-sage focus:outline-none focus:border-clinical-teal focus:bg-white transition-all duration-200 font-sans";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-surface border border-chart-grid rounded-card p-7 sm:p-9 shadow-paper-stack space-y-6"
    >
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-clinical-teal/10 rounded border border-clinical-teal/20 flex items-center justify-center">
            <LogIn className="w-4 h-4 text-clinical-teal" />
          </div>
          <h2 className="text-xl font-display font-semibold text-ink">Portal Authentication</h2>
        </div>
        <p className="text-xs text-ink-muted font-sans">
          Enter your credentials provided by the IMHS administrative desk.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-chart-red-light border border-chart-red/30 p-3.5 rounded text-xs text-chart-red flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-mono text-ink font-medium">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3.5 text-sage" />
            <input
              type="email" required placeholder="student@imhs.edu.lk"
              value={email} onChange={e => setEmail(e.target.value)}
              className={inputBase}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono text-ink font-medium">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3.5 text-sage" />
            <input
              type={showPassword ? "text" : "password"} required placeholder="••••••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              className={`${inputBase} pr-10`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-sage hover:text-ink transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 font-semibold py-3 text-sm bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 shadow-md transition-colors font-sans"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2 text-white">
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-white font-semibold">
                <LogIn className="w-4 h-4 text-white shrink-0" />
                Sign In to Portal
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="pt-3 border-t border-chart-grid/60 text-center space-y-2">
        <p className="text-xs text-ink-muted">Forgot credentials or haven&apos;t received them yet?</p>
        <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-clinical-teal hover:text-chart-red transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          Contact Administrator on WhatsApp
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linen flex flex-col font-sans">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-4 pt-28 pb-16">
        <AnimatedGrid className="text-chart-grid/30" />
        <GlowOrb color="#0E57A4" size={500} className="-top-32 -left-32 opacity-15" />

        <div className="relative z-10 w-full max-w-md space-y-6">
          {/* Brand Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <span className="inline-block font-mono text-[11px] uppercase tracking-widest bg-clinical-teal-surface text-clinical-teal px-3 py-1 rounded font-bold border border-clinical-teal/20">
              <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 text-clinical-teal" />
              INVITE-ONLY STUDENT & ADMIN PORTAL
            </span>
          </motion.div>

          <Suspense fallback={
            <div className="bg-surface border border-chart-grid p-8 rounded-card text-center font-mono text-xs text-sage">
              Loading authentication form...
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
