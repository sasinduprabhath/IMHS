"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VitalLine } from "@/components/ui/vital-line";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { DoseCurve } from "@/components/marketing/DoseCurve";
import { BlisterDivider } from "@/components/marketing/BlisterDivider";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import {
  MedicalScannerBeam,
} from "@/components/marketing/PharmacyAnimations";
import {
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
  HoverCard,
} from "@/components/ui/animations";
import {
  CourseCardSkeleton,
} from "@/components/ui/skeleton";
import {
  PhoneCall,
  BookOpen,
  CheckCircle2,
  Award,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  UserCheck,
  FileCheck,
  KeyRound,
  Microscope,
  Users,
  Star,
  ChevronRight,
  Play,
  HeartPulse,
  Stethoscope,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Images,
  ExternalLink,
  ChevronLeft,
  FileText,
  Lock,
  Download,
  Activity,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  coverImage: string | null;
}

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
}

interface Testimonial {
  id: string;
  studentName: string;
  courseTaken: string | null;
  quote: string;
}

interface HomePageClientProps {
  courses: Course[];
  faculty: FacultyMember[];
  testimonials: Testimonial[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const STAT_ITEMS = [
  { value: "3,500+", label: "Alumni Graduates", icon: GraduationCap },
  { value: "2019", label: "Est. Maharagama, LK", icon: Award },
  { value: "6", label: "Senior Consultants", icon: Stethoscope },
  { value: "4+", label: "Active Programs", icon: BookOpen },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: PhoneCall,
    title: "Contact Admin on WhatsApp",
    body: "Message the coordinator on WhatsApp with your name and course of interest.",
  },
  {
    step: "02",
    icon: FileCheck,
    title: "Submit Payment Proof",
    body: "Send your payment receipt to the coordinator. Enrollment is confirmed within 24 hours.",
  },
  {
    step: "03",
    icon: KeyRound,
    title: "Receive Portal Credentials",
    body: "Your student login credentials are delivered to your WhatsApp for immediate portal access.",
  },
  {
    step: "04",
    icon: UserCheck,
    title: "Start Learning Instantly",
    body: "Log in to your student dashboard and begin watching clinical video modules right away.",
  },
];

const CONVOCATION_CARDS = [
  {
    id: "conv-1",
    type: "photo" as const,
    title: "Convocation Ceremony 2024",
    subtitle: "IMHS General Convocation 2024",
    src: "/gallery",
    placeholder: "bg-gradient-to-br from-[#0E57A4]/20 to-[#2172C9]/30",
  },
  {
    id: "conv-2",
    type: "photo" as const,
    title: "Academic Gowns & Honours",
    subtitle: "IMHS General Convocation 2024",
    src: "/gallery",
    placeholder: "bg-gradient-to-br from-[#F16726]/15 to-[#0E57A4]/20",
  },
  {
    id: "conv-3",
    type: "photo" as const,
    title: "Faculty & Graduates",
    subtitle: "IMHS General Convocation 2024",
    src: "/gallery",
    placeholder: "bg-gradient-to-br from-[#4A8B7A]/20 to-[#0E57A4]/15",
  },
  {
    id: "conv-4",
    type: "video" as const,
    title: "Ceremony Highlights Reel",
    subtitle: "IMHS General Convocation 2024",
    src: "/gallery",
    placeholder: "bg-gradient-to-br from-[#0A2540]/60 to-[#0E57A4]/40",
  },
  {
    id: "conv-5",
    type: "video" as const,
    title: "Keynote Address",
    subtitle: "IMHS General Convocation 2024",
    src: "/gallery",
    placeholder: "bg-gradient-to-br from-[#0E57A4]/40 to-[#F16726]/25",
  },
];

// ─── Hero animation variants ───────────────────────────────────────────────
const heroVariant = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  }),
};

// ─── Contact form state type ───────────────────────────────────────────────
interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function HomePageClient({ courses, faculty, testimonials }: HomePageClientProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Contact form
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) return;
    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email || undefined,
          message: contactForm.message,
        }),
      });
      if (res.ok) {
        setContactStatus("sent");
        setContactForm({ name: "", phone: "", email: "", message: "" });
      } else {
        setContactStatus("error");
      }
    } catch {
      setContactStatus("error");
    }
  };

  const scrollGallery = (dir: "left" | "right") => {
    if (!galleryRef.current) return;
    galleryRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <div className="space-y-0 overflow-x-hidden bg-surface font-sans">

      {/* ── 1. UPGRADED HERO SECTION (HeroPharmacyScene) ───────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16 border-b border-[#E2E8F0] overflow-hidden"
        style={{ background: "linear-gradient(160deg, #EBF3FA 0%, #F8FAFC 45%, #ffffff 100%)" }}
      >
        {/* Multi-layer ambient radial mesh glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 60% at 15% 0%, rgba(14,87,164,0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 100%, rgba(241,103,38,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">

          {/* Left Column Typography & Micro-SVG Integration */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start relative">

            {/* Eyebrow Pill */}
            <motion.div
              custom={0}
              variants={heroVariant}
              initial="hidden"
              animate="show"
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#0E57A4] bg-[#EBF3FA] border border-[#BFDBFE] px-4 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0E57A4] animate-pulse" />
                SLMC-ALIGNED PHARMACY EDUCATION
              </span>
            </motion.div>

            {/* Headline with Pharmacokinetic Dose Curve Underline */}
            <motion.div
              custom={0.1}
              variants={heroVariant}
              initial="hidden"
              animate="show"
              className="w-full"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-ink leading-[1.08] tracking-tight text-center lg:text-left">
                Sri Lanka&apos;s Best{" "}
                <motion.span
                  custom={0.2}
                  variants={heroVariant}
                  initial="hidden"
                  animate="show"
                  className="relative inline-block text-[#F16726]"
                >
                  Healthcare
                  {/* Dose Curve - Pharmacokinetic absorption curve SVG */}
                  <span className="absolute -bottom-5 left-0 w-full pointer-events-none">
                    <DoseCurve variant="hero" />
                  </span>
                </motion.span>{" "}
                Education
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              custom={0.4}
              variants={heroVariant}
              initial="hidden"
              animate="show"
              className="text-base sm:text-lg text-ink-muted max-w-xl font-sans leading-relaxed text-center lg:text-left mx-auto lg:mx-0 pt-2"
            >
              Experience top-tier medical education, SLMC exam preparation, and career opportunities with us. Join our prestigious community today!
            </motion.p>

            {/* Live Vital ECG Line SVG */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md py-1 mx-auto lg:mx-0"
            >
              <VitalLine variant="hero" animated={true} />
            </motion.div>

            {/* Hero Image - Mobile View Only */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="block lg:hidden w-full my-3"
            >
              <div className="relative h-[280px] sm:h-[360px] w-full rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-linen mx-auto">
                <MedicalScannerBeam />
                <Image
                  src="/hero.jpg"
                  alt="Sri Lanka Best Healthcare Education"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </motion.div>

            {/* CTA Action Pair */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2 w-full">
              <motion.div
                custom={0.55}
                variants={heroVariant}
                initial="hidden"
                animate="show"
                className="w-full sm:w-auto"
              >
                <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white font-bold text-sm px-8 py-4 rounded-full tracking-wide transition-all duration-200 group"
                    style={{
                      background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
                      boxShadow: "0 0 24px rgba(241,103,38,0.30), 0 4px 20px rgba(14,87,164,0.35)",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-[#F16726] animate-pulse" />
                    <span>Enroll on WhatsApp</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                custom={0.65}
                variants={heroVariant}
                initial="hidden"
                animate="show"
                className="w-full sm:w-auto"
              >
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-bold text-sm px-8 py-4 rounded-full bg-white transition-all duration-200 text-ink hover:border-[#0E57A4]/50 group"
                    style={{ border: "2px solid #E2E8F0" }}
                  >
                    <span>Browse Programs</span>
                    <ArrowRight className="w-4 h-4 text-[#0E57A4] group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Social Proof Badge */}
            <motion.div
              custom={0.75}
              variants={heroVariant}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3 pt-3"
            >
              <div className="flex -space-x-2">
                {[
                  { initials: "DR", bg: "bg-[#0E57A4]" },
                  { initials: "RN", bg: "bg-[#F16726]" },
                  { initials: "ST", bg: "bg-[#4A8B7A]" },
                ].map(({ initials, bg }) => (
                  <div
                    key={initials}
                    className={`w-8 h-8 rounded-full border-2 border-white ${bg} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm font-sans font-bold text-ink">
                Over <span className="text-[#F16726] font-mono">3,500+</span> Active Students
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Parallax Image Stack (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5 relative perspective-1000"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative h-[430px] xl:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-linen transform-gpu"
            >
              {/* Vertical sweeping laser scanner beam */}
              <MedicalScannerBeam />

              <Image
                src="/hero.jpg"
                alt="Sri Lanka Best Healthcare Education"
                fill
                className="object-cover object-top"
                priority
              />

              {/* Top-Left Overlay Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-white/60 shadow-lg px-3.5 py-1.5 rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
                  </span>
                  <span className="text-xs font-mono font-bold text-ink">🏆 SLMC 98% Pass Rate</span>
                </div>
              </div>

              {/* Bottom-Right Overlay Badge */}
              <div className="absolute bottom-4 right-4 z-20">
                <div className="inline-flex items-center gap-2 bg-[#0B192C]/90 backdrop-blur-md border border-white/10 text-white shadow-xl px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#F16726] animate-pulse" />
                  <span className="text-xs font-mono font-semibold">🔴 Next Batch: Sunday 9:00 AM</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── 2. TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E2E8F0] py-6">
        <BlisterDivider className="mb-4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-sage/70 font-bold mb-5">
            Recognized Standards &amp; Certifications
          </p>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Award, label: "PHARMACEUTICAL GUILD", color: "#0E57A4" },
              { icon: GraduationCap, label: "CONTINUING MED CREDITS", color: "#6366F1" },
              { icon: ShieldCheck, label: "INSTITUTIONAL CERT", color: "#10B981" },
              { icon: CheckCircle2, label: "TERTIARY CARE FACULTY", color: "#F16726" },
            ].map(({ icon: Icon, label, color }) => (
              <StaggerItem key={label}>
                <div className="flex items-center justify-center gap-2.5 text-xs font-mono font-semibold text-ink-muted py-2.5 px-4 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-paper transition-all duration-200 bg-[#F8FAFC] group cursor-default">
                  <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" style={{ color }} />
                  <span className="tracking-wider text-[10px]">{label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 3. COURSES CATALOG ───────────────────────────────────────────────── */}
      <section
        id="programs"
        className="relative bg-linen/40 py-20 border-y border-chart-grid overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid-bg pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                ACTIVE COURSE CATALOG
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
                Featured Medical Programs
              </h2>
            </div>
            <Link href="/courses">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="gap-2 group bg-white font-semibold text-xs border-chart-grid">
                  View All Programs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0E57A4]" />
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.length === 0
              ? [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
              : courses.map((course) => (
                <StaggerItem key={course.id}>
                  <HoverCard className="h-full">
                    <div className="bg-surface border border-chart-grid rounded-2xl overflow-hidden h-full flex flex-col hover:border-[#0E57A4]/50 hover:shadow-xl transition-all duration-300 group">
                      {/* Cover image */}
                      <div className="relative h-44 bg-gradient-to-br from-[#0E57A4]/10 to-[#F16726]/10 overflow-hidden">
                        {course.coverImage ? (
                          <Image
                            src={formatGoogleDriveImageUrl(course.coverImage) || course.coverImage}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Microscope className="w-16 h-16 text-[#0E57A4]/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 bg-ink/90 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
                          {formatCurrency(course.price)}
                        </div>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#F16726] font-semibold">
                            {course.slug.split("-").slice(0, 2).join("-").toUpperCase()}
                          </span>
                          <h3 className="text-base font-bold font-sans text-ink line-clamp-2 leading-snug group-hover:text-[#0E57A4] transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-chart-grid/60 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-[#F16726] text-[#F16726]" />
                            ))}
                          </div>
                          <Link
                            href={createCourseInquiryWALink(course.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-[#0E57A4] font-sans flex items-center gap-1 group-hover:translate-x-1 transition-transform hover:underline"
                          >
                            Enroll Now <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 4. STATS STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-[#0A2540] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STAT_ITEMS.map(({ value, label, icon: Icon }) => (
              <StaggerItem key={label}>
                <div className="text-center space-y-2 group">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-3xl font-display font-extrabold text-white tracking-tight">{value}</div>
                  <div className="text-xs font-mono text-white/50 uppercase tracking-widest">{label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 5. ASYMMETRIC BENTO GRID FEATURES SECTION (Why Choose IMHS) ───────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute inset-0 dot-grid-bg pointer-events-none rounded-3xl" />

        <RevealOnScroll className="text-center mb-12 space-y-2 relative">
          <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
            WHY CHOOSE IMHS
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
            Built for Serious Healthcare Education
          </h2>
        </RevealOnScroll>

        {/* Asymmetric 2x2 Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">

          {/* CARD 1 (Large - 7 Cols, Clinical Precision) */}
          <div className="md:col-span-7">
            <HoverCard className="h-full">
              <div className="bg-surface border border-chart-grid rounded-2xl p-7 sm:p-8 h-full flex flex-col justify-between hover:border-[#0E57A4]/50 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-[#0E57A4]/10 rounded-xl border border-[#0E57A4]/20 flex items-center justify-center group-hover:bg-[#0E57A4]/20 transition-colors">
                      <HeartPulse className="w-6 h-6 text-[#0E57A4]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-3 py-1 rounded-full">
                      SLMC ALIGNED
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-ink font-sans">Clinical Precision Curriculum</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      Every module is authored and reviewed by practicing consultants from teaching hospitals across Sri Lanka. Content is optimized for SLMC exam prioritization and real ward application.
                    </p>
                  </div>
                </div>

                {/* Live Animated ECG SVG Trace Element */}
                <div className="pt-6 mt-4 border-t border-chart-grid/60">
                  <div className="flex items-center justify-between text-xs font-mono text-sage mb-1">
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-[#F16726]" /> Live ECG Wave Monitor</span>
                    <span className="text-[10px] font-bold text-[#10B981]">100% Verified Trace</span>
                  </div>
                  <VitalLine variant="card" animated={true} />
                </div>
              </div>
            </HoverCard>
          </div>

          {/* CARD 2 (5 Cols - 24/7 WhatsApp Support) */}
          <div className="md:col-span-5">
            <HoverCard className="h-full">
              <div className="bg-surface border border-chart-grid rounded-2xl p-7 sm:p-8 h-full flex flex-col justify-between hover:border-[#0E57A4]/50 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                      <MessageSquare className="w-6 h-6 text-[#25D366]" />
                    </div>
                    {/* Real-time Response Indicator */}
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      Online - Fast Desk
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-ink font-sans">WhatsApp-First Support</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      24/7 coordinator access, instant enrollment confirmation, payment receipt verification, and direct faculty Q&amp;A via WhatsApp desk.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-chart-grid/60 flex items-center justify-between text-xs font-mono text-ink-muted">
                  <span>Coordinator Desk: <strong className="text-ink">+94 77 802 5050</strong></span>
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                </div>
              </div>
            </HoverCard>
          </div>

          {/* CARD 3 (5 Cols - Vimeo HD Modules) */}
          <div className="md:col-span-5">
            <HoverCard className="h-full">
              <div className="bg-surface border border-chart-grid rounded-2xl p-7 sm:p-8 h-full flex flex-col justify-between hover:border-[#0E57A4]/50 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-[#0E57A4]/10 rounded-xl border border-[#0E57A4]/20 flex items-center justify-center group-hover:bg-[#0E57A4]/20 transition-colors">
                      <Play className="w-6 h-6 text-[#0E57A4] fill-[#0E57A4]" />
                    </div>
                    {/* Domain-Lock Security Badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-[#0E57A4]" /> Domain-Locked HD
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-ink font-sans">On-Demand Video Modules</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      Vimeo-hosted HD lectures you can pause, rewind, and re-watch at clinical depth without limits. Secured with single-device binding.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-chart-grid/60 flex items-center justify-between text-xs font-mono text-sage">
                  <span>HD 1080p Stream</span>
                  <span className="text-[#0E57A4] font-semibold">Unlimited Access</span>
                </div>
              </div>
            </HoverCard>
          </div>

          {/* CARD 4 (7 Cols - Downloadable Resources) */}
          <div className="md:col-span-7">
            <HoverCard className="h-full">
              <div className="bg-surface border border-chart-grid rounded-2xl p-7 sm:p-8 h-full flex flex-col justify-between hover:border-[#0E57A4]/50 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-[#F16726]/10 rounded-xl border border-[#F16726]/20 flex items-center justify-center group-hover:bg-[#F16726]/20 transition-colors">
                      <Download className="w-6 h-6 text-[#F16726]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F16726] bg-[#F16726]/10 border border-[#F16726]/20 px-3 py-1 rounded-full">
                      CASE BANK &amp; TRACES
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-ink font-sans">Downloadable Case Resources</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      ECG trace libraries, pathology slide banks, SEQ sample model answers, and downloadable PDF checklists for ward reference.
                    </p>
                  </div>
                </div>

                {/* Resource Chips Preview */}
                <div className="pt-6 mt-4 border-t border-chart-grid/60 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="bg-linen border border-chart-grid px-2.5 py-1 rounded-lg text-ink font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#0E57A4]" /> ECG Traces PDF
                  </span>
                  <span className="bg-linen border border-chart-grid px-2.5 py-1 rounded-lg text-ink font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#F16726]" /> SEQ Answer Keys
                  </span>
                  <span className="bg-linen border border-chart-grid px-2.5 py-1 rounded-lg text-ink font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#4A8B7A]" /> Pathology Slides
                  </span>
                </div>
              </div>
            </HoverCard>
          </div>

        </div>
      </section>

      {/* ── 6. DARK MODE INVERTED FACULTY SPOTLIGHT (Deep Clinical Slate #0B192C) ─ */}
      <section
        id="faculty"
        className="relative bg-[#0B192C] text-white py-20 overflow-hidden border-y border-slate-800"
      >
        {/* Subtle mesh background glows for dark mode */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 80% 100%, rgba(241,103,38,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <RevealOnScroll className="text-center space-y-3">
            <span className="font-mono text-xs text-[#38BDF8] uppercase tracking-widest font-bold bg-[#38BDF8]/10 px-3.5 py-1 rounded-full border border-[#38BDF8]/30">
              SENIOR FACULTY SPOTLIGHT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
              Meet Our Lecturer
            </h2>
            <p className="text-base text-slate-300 max-w-lg mx-auto font-sans leading-relaxed">
              Learn directly from senior lecturers and directors guiding Sri Lanka&apos;s medical and pharmacy graduates.
            </p>
          </RevealOnScroll>

          {/* Inverted Card Container */}
          <RevealOnScroll delay={0.2} className="max-w-xl mx-auto">
            <div className="border-2 border-dashed border-[#38BDF8]/30 rounded-3xl p-6 sm:p-8 bg-[#0A1628]/90 backdrop-blur-xl shadow-2xl text-center space-y-6 hover:border-[#38BDF8]/60 transition-all duration-300 group">

              {/* Full Length Photo Box with Laser Scanner Beam */}
              <div className="relative h-[480px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                {/* Laser scanner beam */}
                <MedicalScannerBeam />

                <Image
                  src="/lecturer.jpeg"
                  alt="Dr. Isuru Wijesinghe - Senior Lecturer & Director, IMHS"
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-70" />

                {/* Glowing neon overlay badge */}
                <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                  <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0A1628]/90 backdrop-blur-md border border-[#38BDF8]/40 px-4 py-1.5 rounded-full inline-block shadow-lg">
                    ⚡ EXECUTIVE DIRECTOR &amp; SENIOR LECTURER
                  </span>
                </div>
              </div>

              {/* Lecturer Info */}
              <div className="space-y-2 pt-1">
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  Dr. Isuru Wijesinghe
                </h3>
                <p className="font-mono text-sm sm:text-base text-[#38BDF8] font-semibold">
                  (Ph.D., MSc, B.Pharm)
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <span className="font-mono text-xs text-slate-300 bg-slate-800/80 border border-slate-700 px-3.5 py-1 rounded-full">
                    15+ Years Clinical Teaching
                  </span>
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                    1,000+ Alumni Mentored
                  </span>
                </div>
              </div>

            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── 7. 4-STEP INTERACTIVE ENROLLMENT WORKFLOW ─────────────────────────── */}
      <section
        id="enroll"
        className="bg-surface border-y border-chart-grid py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <RevealOnScroll className="text-center space-y-2">
            <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
              ENROLLMENT PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
              How to Get Started in 4 Steps
            </h2>
          </RevealOnScroll>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }, index) => (
              <StaggerItem key={step}>
                <div className="relative text-center space-y-4 group">
                  {/* Step connector line */}
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+32px)] right-0 overflow-hidden">
                      <DoseCurve variant="divider" />
                    </div>
                  )}

                  <div className="relative mx-auto w-20 h-20 bg-[#EBF3FA] border border-[#0E57A4]/20 rounded-full flex items-center justify-center group-hover:border-[#0E57A4] group-hover:shadow-md transition-all duration-300">
                    <Icon className="w-8 h-8 text-[#0E57A4]" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#4A8B7A] rounded-full flex items-center justify-center shadow-xs">
                      <span className="text-[10px] font-mono font-bold text-white">{step}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-ink font-sans">{title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed px-2">{body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <RevealOnScroll className="text-center pt-4">
            <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  className="gap-2.5 bg-[#F16726] hover:bg-[#d95517] border-0 text-white shadow-lg font-bold px-10 rounded-full"
                >
                  <PhoneCall className="w-5 h-5" />
                  Start Enrollment Now
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── 8. CONVOCATION & OUTCOMES GALLERY ─────────────────────────────────── */}
      <section className="bg-linen/50 py-20 border-b border-chart-grid overflow-hidden">
        <BlisterDivider className="mb-8" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                MILESTONES &amp; ACHIEVEMENTS
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
                IMHS General Convocation 2024
              </h2>
              <p className="text-sm text-ink-muted max-w-lg">
                Celebrating our graduates&apos; achievements in clinical excellence and healthcare education.
              </p>
            </div>
            <Link href="/gallery">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="gap-2 group bg-white whitespace-nowrap font-semibold text-xs border-chart-grid">
                  <Images className="w-4 h-4 text-[#0E57A4]" />
                  View Full Gallery
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0E57A4]" />
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>

          {/* Scroll-snap gallery */}
          <div className="relative">
            <button
              onClick={() => scrollGallery("left")}
              aria-label="Scroll gallery left"
              className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-chart-grid shadow-md items-center justify-center hover:border-[#0E57A4]/40 hover:shadow-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-ink-muted" />
            </button>
            <button
              onClick={() => scrollGallery("right")}
              aria-label="Scroll gallery right"
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-chart-grid shadow-md items-center justify-center hover:border-[#0E57A4]/40 hover:shadow-lg transition-all"
            >
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </button>

            <div
              ref={galleryRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {CONVOCATION_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border border-chart-grid bg-surface group relative shadow-card"
                >
                  <div className={`relative h-52 ${card.placeholder} overflow-hidden`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      {card.type === "video" ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          </div>
                          <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest">Click to Play</span>
                        </>
                      ) : (
                        <Images className="w-10 h-10 text-white/40" />
                      )}
                    </div>
                    <Link
                      href="/gallery"
                      className="absolute inset-0 z-10"
                      aria-label={`View ${card.title} in gallery`}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/70 to-transparent">
                        <ExternalLink className="w-3.5 h-3.5 text-white/60 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#F16726] font-bold">{card.subtitle}</span>
                    <h3 className="text-sm font-bold text-ink font-sans leading-snug">{card.title}</h3>
                    <div className="flex items-center gap-1 pt-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${card.type === "video" ? "bg-[#F16726]/10 text-[#F16726] border border-[#F16726]/20" : "bg-[#0E57A4]/10 text-[#0E57A4] border border-[#0E57A4]/20"}`}>
                        {card.type === "video" ? "VIDEO" : "PHOTO"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. STUDENT VOICES & TESTIMONIALS (Prescription ℞ Quote Marks) ───────── */}
      {testimonials.length > 0 && (
        <section className="bg-surface py-20 border-b border-chart-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <RevealOnScroll className="text-center space-y-2">
              <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                STUDENT VOICES
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
                Trusted by Thousands of Healthcare Professionals
              </h2>
            </RevealOnScroll>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <HoverCard className="h-full">
                    <div className="bg-surface border border-chart-grid rounded-2xl p-6 h-full flex flex-col justify-between hover:border-[#0E57A4]/30 transition-all duration-300 shadow-paper">
                      <div className="space-y-4">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-[#F16726] text-[#F16726]" />
                          ))}
                        </div>
                        <p className="text-sm text-ink-muted leading-relaxed italic">
                          {/* Authentic ℞ (Recipe/Prescription) medical glyph in crimson */}
                          <span className="font-mono text-[#F16726] text-xl font-extrabold not-italic mr-1.5">℞</span>
                          {t.quote}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-chart-grid/60">
                        <p className="text-sm font-bold text-ink font-sans">{t.studentName}</p>
                        <p className="text-xs font-mono text-[#0E57A4] font-semibold">{t.courseTaken}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ── 10. CONTACT BAND & FORM ────────────────────────────────────────── */}
      <section className="bg-linen/60 border-y border-chart-grid py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left Column: Contact Details */}
            <RevealOnScroll className="space-y-8">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-ink">
                  Have Questions? We&apos;re Here to Help
                </h2>
                <p className="text-base text-ink-muted leading-relaxed max-w-md">
                  Reach out via WhatsApp, phone, or the contact form. Our administrative desk responds within a few hours.
                </p>
              </div>

              <div className="space-y-4">
                {/* Phone chip */}
                <a
                  href="tel:+94778025050"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-xl hover:border-[#0E57A4]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0E57A4]/10 flex items-center justify-center group-hover:bg-[#0E57A4]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#0E57A4]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">Phone / WhatsApp</div>
                    <div className="text-sm font-bold text-ink">+94 77 802 5050</div>
                  </div>
                </a>

                {/* Email chip */}
                <a
                  href="mailto:info@imhs.lk"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-xl hover:border-[#6366F1]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center group-hover:bg-[#6366F1]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">Email Desk</div>
                    <div className="text-sm font-bold text-ink">info@imhs.lk</div>
                  </div>
                </a>

                {/* WhatsApp chip */}
                <Link
                  href={createCourseInquiryWALink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-xl hover:border-[#25D366]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">WhatsApp Admissions Desk</div>
                    <div className="text-sm font-bold text-ink">Message us instantly</div>
                  </div>
                </Link>
              </div>
            </RevealOnScroll>

            {/* Right Column: Compact Contact Form */}
            <RevealOnScroll delay={0.2}>
              <div className="bg-surface border border-chart-grid rounded-2xl p-6 sm:p-8 shadow-paper space-y-6">
                <h3 className="text-lg font-display font-bold text-ink">Send us a Message</h3>

                <AnimatePresence mode="wait">
                  {contactStatus === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 py-8 text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/30">
                        <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
                      </div>
                      <p className="font-bold text-ink text-base">Message sent successfully!</p>
                      <p className="text-xs text-ink-muted">Our admissions desk will contact you shortly.</p>
                      <button
                        onClick={() => setContactStatus("idle")}
                        className="text-xs text-[#0E57A4] font-semibold underline underline-offset-2 mt-2"
                      >
                        Send another inquiry
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleContactSubmit}
                      className="space-y-5"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-1">
                        <label htmlFor="contact-name" className="text-xs font-mono font-bold text-sage uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Dr. Amal Perera"
                          className="contact-input text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="contact-phone" className="text-xs font-mono font-bold text-sage uppercase tracking-wider">
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+94 77 123 4567"
                          className="contact-input text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="contact-email" className="text-xs font-mono font-bold text-sage uppercase tracking-wider">
                          Email <span className="normal-case font-sans font-normal text-sage/60">(optional)</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="amal@example.com"
                          className="contact-input text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="contact-message" className="text-xs font-mono font-bold text-sage uppercase tracking-wider">
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={3}
                          value={contactForm.message}
                          onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                          placeholder="I'm interested in the Clinical Pharmacy / SLMC course..."
                          className="contact-input text-xs sm:text-sm resize-none"
                        />
                      </div>

                      {contactStatus === "error" && (
                        <p className="text-xs text-[#F16726] font-mono">
                          Something went wrong. Please try again or contact us on WhatsApp.
                        </p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={contactStatus === "sending"}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
                          boxShadow: "0 4px 16px rgba(14,87,164,0.25)",
                        }}
                      >
                        {contactStatus === "sending" ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CTA SECTION ───────────────────────────────────────────── */}
      <section className="relative py-20 bg-[#EBF3FA] border-t border-[#0E57A4]/20 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealOnScroll>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-ink leading-tight">
              Ready to Advance Your Medical Career?
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <p className="text-base text-ink-muted leading-relaxed">
              Contact our administrative admissions desk to secure your spot in the next intake.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.4} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  className="gap-2.5 bg-[#F16726] hover:bg-[#d95517] border-0 text-white shadow-lg font-bold px-10 text-base rounded-full"
                >
                  <PhoneCall className="w-5 h-5" />
                  Inquire &amp; Enroll Now
                </Button>
              </motion.div>
            </Link>
            <Link href="/courses">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-[#0E57A4] text-[#0E57A4] hover:bg-[#0E57A4]/10 font-bold px-8 text-base bg-white rounded-full"
                >
                  <BookOpen className="w-5 h-5" />
                  Browse All Courses
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
