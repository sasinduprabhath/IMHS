"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { VitalLine } from "@/components/ui/vital-line";
import { DoseCurve } from "@/components/marketing/DoseCurve";
import { ECGScanWave, RxCredentialBadge } from "@/components/marketing/PharmacyAnimations";
import { RevealOnScroll, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import {
  PhoneCall, BookOpen, CheckCircle2, Award, ShieldCheck, GraduationCap,
  ArrowRight, UserCheck, FileCheck, KeyRound, Microscope, Users, Star,
  ChevronRight, Play, HeartPulse, Stethoscope, Sparkles, Mail, Phone,
  MessageSquare, Send, Images, ExternalLink, ChevronLeft, Zap, Lock,
  Download, Monitor, Wifi, TrendingUp, Clock, BadgeCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course {
  id: string; title: string; slug: string;
  description: string; price: number; coverImage: string | null;
}
interface FacultyMember {
  id: string; name: string; title: string; bio: string; photoUrl: string | null;
}
interface Testimonial {
  id: string; studentName: string; courseTaken: string | null; quote: string;
}
interface HomePageClientProps {
  courses: Course[];
  faculty: FacultyMember[];
  testimonials: Testimonial[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const STAT_ITEMS = [
  { value: "3,500+", label: "Alumni Graduates", icon: GraduationCap },
  { value: "2019",   label: "Est. Maharagama, LK", icon: Award },
  { value: "98%",    label: "SLMC Pass Rate", icon: BadgeCheck },
  { value: "4+",     label: "Active Programs", icon: BookOpen },
];

const HOW_IT_WORKS = [
  { step: "01", icon: PhoneCall,  title: "Contact Admin on WhatsApp",    body: "Message the coordinator with your name and course of interest." },
  { step: "02", icon: FileCheck,  title: "Submit Payment Proof",          body: "Send your payment receipt. Enrollment confirmed within 24 hours." },
  { step: "03", icon: KeyRound,   title: "Receive Portal Login",          body: "Student credentials delivered to your WhatsApp for instant access." },
  { step: "04", icon: UserCheck,  title: "Start Learning Instantly",      body: "Log in to your dashboard and begin clinical video modules right away." },
];

const CONVOCATION_CARDS = [
  { id: "conv-1", type: "photo" as const, title: "Convocation 2024", placeholder: "bg-gradient-to-br from-[#0E57A4]/20 to-[#2172C9]/30" },
  { id: "conv-2", type: "photo" as const, title: "Academic Honours", placeholder: "bg-gradient-to-br from-[#F16726]/15 to-[#0E57A4]/20" },
  { id: "conv-3", type: "photo" as const, title: "Faculty & Graduates", placeholder: "bg-gradient-to-br from-[#4A8B7A]/20 to-[#0E57A4]/15" },
  { id: "conv-4", type: "video" as const, title: "Ceremony Highlights", placeholder: "bg-gradient-to-br from-[#0A2540]/60 to-[#0E57A4]/40" },
];

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
function LaserScanBeam({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute inset-x-0 h-[2px] z-10 pointer-events-none ${className ?? ""}`}
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.7) 40%, rgba(14,87,164,0.9) 60%, transparent 100%)",
        boxShadow: "0 0 12px 3px rgba(56,189,248,0.45)",
      }}
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function PulseDot({ color = "#22c55e" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

// ─── Contact form type ────────────────────────────────────────────────────────
interface ContactForm { name: string; phone: string; email: string; message: string; }

// ─── Component ───────────────────────────────────────────────────────────────
export function HomePageClient({ courses, faculty, testimonials }: HomePageClientProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax scroll for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);

  // Contact form
  const [contactForm, setContactForm] = useState<ContactForm>({ name: "", phone: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) return;
    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactStatus(res.ok ? "sent" : "error");
    } catch {
      setContactStatus("error");
    }
  };

  const heroVariant = {
    hidden: { opacity: 0, y: 24 },
    show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" as const } }),
  };

  const primaryFaculty = faculty[0] ?? null;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-white">

      {/* ══════════════════════════════════════════════════════════════
          §1 · HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[calc(100vh-68px)] flex items-center overflow-hidden bg-white"
        aria-label="Hero"
      >
        {/* Background mesh glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(14,87,164,0.10) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(241,103,38,0.07) 0%, transparent 70%)" }} />
          {/* Hairline dot grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #0E57A4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ── Left: Text ── */}
          <div className="space-y-7">
            {/* Eyebrow badge */}
            <motion.div custom={0} variants={heroVariant} initial="hidden" animate="show">
              <div className="inline-flex items-center gap-2.5 bg-[#EBF3FA] border border-[#0E57A4]/20 rounded-full px-4 py-1.5">
                <PulseDot color="#22c55e" />
                <span className="text-[11px] font-mono font-bold text-[#0E57A4] uppercase tracking-widest">
                  Now Enrolling · Batch 2025
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div custom={0.1} variants={heroVariant} initial="hidden" animate="show" className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-display font-extrabold text-[#0B192C] leading-[1.1] tracking-tight">
                Sri Lanka&apos;s Best
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-display font-extrabold leading-[1.1] tracking-tight">
                <span className="relative inline-block text-[#0E57A4]">
                  Healthcare
                  {/* Dose-curve underline */}
                  <span className="absolute -bottom-2 left-0 right-0 pointer-events-none">
                    <DoseCurve variant="hero" className="h-[14px]" />
                  </span>
                </span>
                <span className="text-[#0B192C]"> Education</span>
              </h1>
            </motion.div>

            {/* Subtitle with ECG accent */}
            <motion.div custom={0.2} variants={heroVariant} initial="hidden" animate="show" className="space-y-2">
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg font-sans">
                SLMC-aligned pharmacy programs, world-class clinical faculty, and a direct WhatsApp enrollment path trusted by{" "}
                <span className="font-semibold text-[#0B192C]">3,500+ graduates</span> since 2019.
              </p>
              {/* ECG pulse under subtitle */}
              <VitalLine variant="hero" className="text-[#F16726] opacity-60 h-5" />
            </motion.div>

            {/* CTAs */}
            <motion.div custom={0.3} variants={heroVariant} initial="hidden" animate="show"
              className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <a
                href={createCourseInquiryWALink()}
                target="_blank" rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-mono font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)" }}
              >
                {/* Ambient orange glow ring on hover */}
                <span aria-hidden="true" className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: "0 0 0 4px rgba(241,103,38,0.25)" }} />
                <PhoneCall className="w-4 h-4" />
                Enroll on WhatsApp
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-mono font-bold border-2 border-[#0E57A4] text-[#0E57A4] hover:bg-[#0E57A4] hover:text-white transition-all"
              >
                Browse Programs
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Social proof avatars */}
            <motion.div custom={0.4} variants={heroVariant} initial="hidden" animate="show"
              className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {["#0E57A4","#F16726","#4A8B7A","#7C3AED","#0B192C"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: c }}>
                    {["KP","AS","NF","RM","TW"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-[#F16726] text-[#F16726]" />)}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Over <strong className="text-[#0B192C]">3,500+</strong> active students</p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: 3D Parallax Image Stack ── */}
          <motion.div custom={0.2} variants={heroVariant} initial="hidden" animate="show" className="relative">
            {/* 3D tilt card wrapper */}
            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60"
            >
              {/* Hero image – 3:4 portrait card */}
              <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#EBF3FA] to-[#dbeafe]">
                {primaryFaculty?.photoUrl ? (
                  <Image
                    src={formatGoogleDriveImageUrl(primaryFaculty.photoUrl) || primaryFaculty.photoUrl}
                    alt={primaryFaculty.name}
                    fill
                    className="object-cover object-top"
                    priority
                    unoptimized={primaryFaculty.photoUrl.startsWith("http")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 p-8">
                      <div className="w-20 h-20 bg-[#0E57A4]/10 rounded-full flex items-center justify-center mx-auto">
                        <Stethoscope className="w-10 h-10 text-[#0E57A4]/60" />
                      </div>
                      <p className="text-sm font-mono text-slate-400">IMHS Faculty</p>
                    </div>
                  </div>
                )}

                {/* Laser scanner beam over image */}
                <LaserScanBeam />

                {/* ── Glassmorphic Overlay Badges ── */}
                {/* Top-left: SLMC pass rate */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="absolute -top-3 -left-4 z-20"
                >
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl px-3.5 py-2.5">
                    <span className="text-base">🏆</span>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#0E57A4] uppercase tracking-wide">SLMC Pass Rate</p>
                      <p className="text-lg font-display font-extrabold text-[#0B192C] leading-none">98%</p>
                    </div>
                    <PulseDot color="#22c55e" />
                  </div>
                </motion.div>

                {/* Bottom-right: Next batch tag */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -bottom-3 -right-4 z-20"
                >
                  <div className="flex items-center gap-2 bg-[#0B192C]/90 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl px-3.5 py-2.5">
                    <PulseDot color="#F16726" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Next Batch</p>
                      <p className="text-xs font-mono font-bold text-white">Sunday · 9:00 AM</p>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B192C]/60 to-transparent pointer-events-none" />
                {/* Name badge at bottom */}
                {primaryFaculty && (
                  <div className="absolute bottom-4 left-4 z-10">
                    <RxCredentialBadge label="SLMC PREP" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Decorative background blob behind image card */}
            <div aria-hidden="true"
              className="absolute -z-10 -bottom-6 -right-6 w-3/4 h-3/4 rounded-3xl opacity-30"
              style={{ background: "linear-gradient(135deg, #0E57A4 0%, #4A8B7A 100%)", filter: "blur(32px)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §2 · STATS STRIP
      ══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-[#0A2540]" aria-label="Key Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STAT_ITEMS.map(({ value, label, icon: Icon }) => (
            <RevealOnScroll key={label}>
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className="w-5 h-5 text-[#38BDF8]" />
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-white">{value}</p>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{label}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §3 · BENTO FEATURES GRID — "Why Choose IMHS"
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]" aria-label="Why Choose IMHS">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section header */}
          <RevealOnScroll className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#0E57A4] bg-[#EBF3FA] border border-[#0E57A4]/15 px-3.5 py-1 rounded-full uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Why IMHS
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0B192C] leading-tight">
              Built for Clinical Excellence
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-sans leading-relaxed">
              Four pillars that set IMHS apart from every other pharmacy program in Sri Lanka.
            </p>
          </RevealOnScroll>

          {/* Asymmetric 2×2 Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">

            {/* CARD 1 — Large: Clinical Precision (spans 2 rows on desktop) */}
            <RevealOnScroll className="md:row-span-2 lg:col-span-1">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="h-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col gap-5 hover:border-[#0E57A4]/40 hover:shadow-lg transition-all overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#EBF3FA]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-[#EBF3FA] flex items-center justify-center shrink-0">
                  <HeartPulse className="w-6 h-6 text-[#0E57A4]" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-[#0B192C] mb-2">Clinical Precision Curriculum</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-sans">
                    Every module authored and reviewed by practicing consultants from teaching hospitals. 100% SLMC examination-syllabus aligned.
                  </p>
                </div>
                {/* Live ECG trace */}
                <div className="mt-auto space-y-2">
                  <ECGScanWave className="opacity-70" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["SLMC Aligned", "Hospital Faculty", "ECG & Pathology"].map(t => (
                      <span key={t} className="text-[10px] font-mono bg-[#EBF3FA] text-[#0E57A4] border border-[#0E57A4]/15 px-2.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>

            {/* CARD 2 — 24/7 WhatsApp Support */}
            <RevealOnScroll>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 hover:border-[#0E57A4]/40 hover:shadow-lg transition-all relative group overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                    <PulseDot color="#22c55e" />
                    <span className="text-[10px] font-mono text-green-700 font-semibold">Live Desk</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-[#0B192C] mb-1.5">24/7 WhatsApp Support</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-sans">
                    Dedicated coordinator + direct faculty Q&A, all on WhatsApp. Average response under 15 minutes.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-mono text-slate-400">Always online · Sri Lanka & Overseas</span>
                </div>
              </motion.div>
            </RevealOnScroll>

            {/* CARD 3 — Vimeo HD Modules */}
            <RevealOnScroll>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 hover:border-[#0E57A4]/40 hover:shadow-lg transition-all relative group overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">Domain-Locked</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 text-[#F16726]" />
                </div>
                {/* Thumbnail preview */}
                <div className="w-full aspect-video bg-gradient-to-br from-[#0B192C] to-[#0E57A4]/60 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/70">Vimeo HD · Secured</span>
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-[#0B192C] mb-1">On-Demand HD Modules</h3>
                  <p className="text-sm text-slate-500 font-sans leading-relaxed">Vimeo-hosted clinical lectures — pause, rewind, re-watch without limits.</p>
                </div>
              </motion.div>
            </RevealOnScroll>

            {/* CARD 4 — Downloadable Resources (spans 2 cols on lg) */}
            <RevealOnScroll className="lg:col-span-2">
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-start gap-6 hover:border-[#0E57A4]/40 hover:shadow-lg transition-all relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#EBF3FA]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-[#0B192C] mb-1">Downloadable Case Resources</h3>
                    <p className="text-sm text-slate-500 font-sans leading-relaxed">
                      ECG trace libraries, pathology slide banks, and PDF checklists for ward reference — all included in your enrollment.
                    </p>
                  </div>
                  {/* File preview pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "ECG Trace Library.pdf", color: "bg-red-50 text-red-700 border-red-200" },
                      { label: "Pathology Slides.pdf",  color: "bg-blue-50 text-blue-700 border-blue-200" },
                      { label: "SLMC Checklist.pdf",    color: "bg-green-50 text-green-700 border-green-200" },
                      { label: "Case Studies Bank.pdf", color: "bg-purple-50 text-purple-700 border-purple-200" },
                    ].map(({ label, color }) => (
                      <span key={label} className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${color}`}>
                        <FileCheck className="w-3 h-3" /> {label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §4 · COURSES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white" aria-label="Programs">
        <div className="max-w-7xl mx-auto space-y-12">
          <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#F16726] bg-orange-50 border border-orange-200 px-3.5 py-1 rounded-full uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" /> Active Programs
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0B192C] leading-tight">
                Enroll in a Course Today
              </h2>
            </div>
            <Link href="/courses" className="group inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#0E57A4] hover:text-[#0B192C] transition-colors shrink-0">
              See All Programs <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </RevealOnScroll>

          {courses.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const coverSrc = course.coverImage
                  ? formatGoogleDriveImageUrl(course.coverImage) || course.coverImage
                  : null;
                const waLink = createCourseInquiryWALink(course.title);
                return (
                  <StaggerItem key={course.id}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                    >
                      {/* Poster */}
                      <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-[#EBF3FA] to-[#dbeafe] overflow-hidden">
                        {coverSrc ? (
                          <Image src={coverSrc} alt={course.title} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized={coverSrc.startsWith("http")} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-[#0E57A4]/30" />
                          </div>
                        )}
                        {/* Price tag */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                          <p className="text-sm font-mono font-bold text-[#0E57A4]">{formatCurrency(course.price)}</p>
                        </div>
                      </div>
                      {/* Body */}
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <h3 className="text-base font-display font-bold text-[#0B192C] leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-sans line-clamp-2 leading-relaxed">{course.description}</p>
                        <div className="mt-auto flex gap-2 pt-2">
                          <a href={waLink} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0E57A4] hover:bg-[#0B192C] text-white text-xs font-mono font-bold py-2.5 px-4 rounded-full transition-colors">
                            <PhoneCall className="w-3.5 h-3.5" /> Enroll Now
                          </a>
                          <Link href={`/courses/${course.slug}`}
                            className="flex items-center justify-center gap-1 border border-slate-200 hover:border-[#0E57A4] text-slate-500 hover:text-[#0E57A4] text-xs font-mono py-2.5 px-4 rounded-full transition-colors">
                            Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerChildren>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §5 · DARK FACULTY SPOTLIGHT
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ background: "#0B192C" }}
        aria-label="Senior Faculty"
      >
        {/* Glow accents */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #0E57A4 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #4ADE80 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section label */}
          <RevealOnScroll className="text-center mb-14 space-y-3">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-3.5 py-1 rounded-full uppercase tracking-widest">
              <Stethoscope className="w-3.5 h-3.5" /> Senior Faculty
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
              Learn from Sri Lanka&apos;s Top{" "}
              <span className="text-[#38BDF8]">Clinical Minds</span>
            </h2>
          </RevealOnScroll>

          {/* Faculty spotlight card */}
          {primaryFaculty && (
            <RevealOnScroll>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
                {/* Photo with laser scan */}
                <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[3/4]">
                    {primaryFaculty.photoUrl ? (
                      <Image
                        src={formatGoogleDriveImageUrl(primaryFaculty.photoUrl) || primaryFaculty.photoUrl}
                        alt={primaryFaculty.name}
                        fill
                        className="object-cover object-top"
                        unoptimized={primaryFaculty.photoUrl.startsWith("http")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0E57A4]/30 to-[#4A8B7A]/20">
                        <GraduationCap className="w-20 h-20 text-[#38BDF8]/40" />
                      </div>
                    )}
                    {/* Laser scan beam in teal on dark */}
                    <LaserScanBeam className="opacity-60" />
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B192C]/90 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <p className="text-base font-display font-bold text-white leading-tight">{primaryFaculty.name}</p>
                      <p className="text-xs font-mono text-[#38BDF8] mt-0.5">{primaryFaculty.title}</p>
                    </div>
                  </div>
                  {/* Neon glow blob behind photo */}
                  <div aria-hidden="true"
                    className="absolute -z-10 -bottom-6 left-0 right-0 h-1/2 opacity-25 blur-3xl"
                    style={{ background: "linear-gradient(180deg, #38BDF8 0%, #0E57A4 100%)" }}
                  />
                </div>

                {/* Bio + credentials */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-snug">
                      {primaryFaculty.name}
                    </h3>
                    <p className="text-sm font-mono text-[#38BDF8]">{primaryFaculty.title}</p>
                  </div>

                  {/* Neon credential pills */}
                  <div className="flex flex-wrap gap-2">
                    {["Ph.D. Pharmaceutical Sciences", "B.Pharm Hons", "Senior Lecturer — IMHS", "15+ Years Clinical Teaching"].map(c => (
                      <span key={c}
                        className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border"
                        style={{ color: "#4ADE80", borderColor: "rgba(74,222,128,0.25)", backgroundColor: "rgba(74,222,128,0.07)" }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Bio text */}
                  <p className="text-sm text-slate-400 font-sans leading-relaxed line-clamp-4">{primaryFaculty.bio}</p>

                  {/* Vital line accent in teal */}
                  <VitalLine variant="divider" className="text-[#38BDF8] opacity-40" />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/dr-isuru-wijesinghe"
                      className="group inline-flex items-center justify-center gap-2 bg-[#38BDF8] hover:bg-[#0ea5e9] text-[#0B192C] text-xs font-mono font-bold px-6 py-3 rounded-full transition-colors">
                      Full Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/consultation"
                      className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#38BDF8]/50 text-white hover:text-[#38BDF8] text-xs font-mono font-bold px-6 py-3 rounded-full transition-colors">
                      Book 1-on-1 Session
                    </Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          )}

          {/* Other faculty row */}
          {faculty.length > 1 && (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {faculty.slice(1).map((f) => {
                const fSrc = f.photoUrl ? formatGoogleDriveImageUrl(f.photoUrl) || f.photoUrl : null;
                return (
                  <RevealOnScroll key={f.id}>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex gap-4 hover:bg-white/8 transition-colors">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#0E57A4]/20">
                        {fSrc ? (
                          <Image src={fSrc} alt={f.name} fill className="object-cover object-top"
                            unoptimized={fSrc.startsWith("http")} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <GraduationCap className="w-7 h-7 text-[#38BDF8]/40" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-white leading-snug">{f.name}</p>
                        <p className="text-[11px] font-mono text-[#38BDF8] mt-0.5">{f.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans">{f.bio}</p>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §6 · HOW IT WORKS — 4-Step Enrollment Workflow
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]" aria-label="How To Enroll">
        <div className="max-w-5xl mx-auto space-y-12">
          <RevealOnScroll className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#0E57A4] bg-[#EBF3FA] border border-[#0E57A4]/15 px-3.5 py-1 rounded-full uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" /> Enrollment in 4 Steps
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0B192C]">
              From WhatsApp to Portal in 24 Hours
            </h2>
          </RevealOnScroll>

          <div className="relative">
            {/* Dose-curve connector (desktop only, hidden on mobile) */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 pointer-events-none">
              <DoseCurve variant="timeline" steps={4} className="w-full opacity-30" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
                <RevealOnScroll key={step}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-[#0E57A4]/40 hover:shadow-md transition-all text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-[#EBF3FA] border-2 border-[#0E57A4]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#0E57A4]" />
                    </div>
                    <p className="text-xs font-mono font-bold text-[#F16726]">Step {step}</p>
                    <h3 className="text-sm font-display font-bold text-[#0B192C] leading-snug">{title}</h3>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">{body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          {/* Enroll CTA */}
          <RevealOnScroll className="text-center">
            <a href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 bg-[#0E57A4] hover:bg-[#0B192C] text-white text-sm font-mono font-bold px-8 py-4 rounded-full shadow-lg shadow-[#0E57A4]/30 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <PhoneCall className="w-4 h-4" />
              Start Your Enrollment on WhatsApp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </RevealOnScroll>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §7 · CONVOCATION GALLERY SCROLL
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white" aria-label="Convocation Gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#4A8B7A] bg-teal-50 border border-teal-200 px-3.5 py-1 rounded-full uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" /> Convocation 2024
              </span>
              <h2 className="text-3xl font-display font-extrabold text-[#0B192C]">Our Graduating Class</h2>
            </div>
            <Link href="/gallery" className="group inline-flex items-center gap-1.5 text-sm font-mono font-semibold text-[#0E57A4] hover:text-[#0B192C] transition-colors shrink-0">
              <Images className="w-4 h-4" /> Full Gallery <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </RevealOnScroll>

          {/* Horizontal scroll cards */}
          <div ref={galleryRef} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {CONVOCATION_CARDS.map((card, i) => (
              <Link href="/gallery" key={card.id}
                className={`snap-start shrink-0 relative rounded-2xl overflow-hidden border border-slate-200 group
                  ${i === 0 ? "w-72 sm:w-96" : "w-60 sm:w-72"}`}>
                <div className={`w-full aspect-[3/4] ${card.placeholder} relative`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {card.type === "video"
                      ? <Play className="w-10 h-10 text-white/60 fill-white/40" />
                      : <Images className="w-10 h-10 text-white/40" />}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B192C]/80 to-transparent p-4">
                    <p className="text-xs font-display font-bold text-white">{card.title}</p>
                    <p className="text-[10px] font-mono text-white/50 mt-0.5">IMHS General Convocation 2024</p>
                  </div>
                  {card.type === "video" && (
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <p className="text-[9px] font-mono text-white font-bold">VIDEO</p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          §8 · TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]" aria-label="Student Testimonials">
          <div className="max-w-6xl mx-auto space-y-12">
            <RevealOnScroll className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#0E57A4] bg-[#EBF3FA] border border-[#0E57A4]/15 px-3.5 py-1 rounded-full uppercase tracking-widest">
                <Star className="w-3.5 h-3.5 fill-current" /> Student Voices
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0B192C]">
                Graduates Who Made It
              </h2>
            </RevealOnScroll>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-all relative overflow-hidden"
                  >
                    {/* Rx quote glyph */}
                    <span aria-hidden="true"
                      className="absolute -top-3 -left-1 text-[72px] font-serif font-bold text-[#F16726]/10 leading-none select-none pointer-events-none">
                      ℞
                    </span>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-[#F16726] text-[#F16726]" />)}
                    </div>
                    <blockquote className="text-sm text-slate-600 font-sans leading-relaxed italic flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EBF3FA] flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono font-bold text-[#0E57A4]">{t.studentName[0]}</span>
                      </div>
                      <div>
                        <p className="text-xs font-display font-bold text-[#0B192C]">{t.studentName}</p>
                        {t.courseTaken && <p className="text-[10px] font-mono text-slate-400">{t.courseTaken}</p>}
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          §9 · CONTACT BAND
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0A2540]" aria-label="Contact IMHS">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: chips */}
            <RevealOnScroll className="space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-3.5 py-1 rounded-full uppercase tracking-widest">
                  <Mail className="w-3.5 h-3.5" /> Get In Touch
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white leading-tight">
                  Start Your IMHS Journey Today
                </h2>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">
                  Our admissions team typically responds within 15 minutes on WhatsApp.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: "WhatsApp Direct", value: "+94 77 802 5050" },
                  { icon: Mail,  label: "Email",            value: "info@imhs.edu.lk" },
                  { icon: Stethoscope, label: "Campus", value: "Maharagama, Western Province, LK" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <Icon className="w-4 h-4 text-[#38BDF8] shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase">{label}</p>
                      <p className="text-sm font-mono font-semibold text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            {/* Right: form */}
            <RevealOnScroll>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {[
                  { id: "name",  type: "text",  placeholder: "Your Full Name *",     key: "name" as const },
                  { id: "phone", type: "tel",   placeholder: "WhatsApp Number *",     key: "phone" as const },
                  { id: "email", type: "email", placeholder: "Email (optional)",      key: "email" as const },
                ].map(({ id, type, placeholder, key }) => (
                  <input
                    key={id}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={contactForm[key]}
                    onChange={e => setContactForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm font-sans px-4 py-3 rounded-xl focus:outline-none focus:border-[#38BDF8]/50"
                  />
                ))}
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Your Message or Course Interest *"
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-white/5 border border-white/15 text-white placeholder:text-slate-500 text-sm font-sans px-4 py-3 rounded-xl focus:outline-none focus:border-[#38BDF8]/50 resize-none"
                />
                <AnimatePresence mode="wait">
                  {contactStatus === "sent" ? (
                    <motion.div key="sent"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-green-400 text-sm font-mono font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Message sent! We&apos;ll WhatsApp you shortly.
                    </motion.div>
                  ) : (
                    <motion.button key="btn"
                      type="submit"
                      disabled={contactStatus === "sending"}
                      whileHover={{ scale: 1.01 }}
                      className="w-full flex items-center justify-center gap-2 bg-[#0E57A4] hover:bg-[#1a6fc4] disabled:opacity-50 text-white text-sm font-mono font-bold py-3.5 px-6 rounded-full transition-colors">
                      {contactStatus === "sending" ? "Sending..." : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
