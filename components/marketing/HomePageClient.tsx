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
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
  HoverCard,
} from "@/components/ui/animations";
import { CourseCardSkeleton } from "@/components/ui/skeleton";
import { AchievementsSection } from "@/components/marketing/AchievementsSection";
import { TrustAccreditationStrip } from "@/components/marketing/TrustAccreditationStrip";
import { EnrollmentProcessSection } from "@/components/marketing/EnrollmentProcessSection";
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
  ChevronLeft,
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
  Lock,
  Download,
  Activity,
  FileText,
  Clock,
  Globe,
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
  achievements?: any[];
  galleryItems?: any[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const STAT_ITEMS = [
  { value: "5,000+", label: "Success Stories", icon: GraduationCap },
  { value: "2019", label: "Year Established", icon: Award },
  { value: "20+", label: "Educational Programmes", icon: BookOpen },
  { value: "ISLAND-WIDE", label: "Flexible Online Learning", icon: Globe },
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
    title: "Receive Portal Login",
    body: "Your student login credentials are delivered to your WhatsApp for immediate portal access.",
  },
  {
    step: "04",
    icon: UserCheck,
    title: "Start Learning Instantly",
    body: "Log in to your student dashboard and begin watching clinical video modules right away.",
  },
];

const ACHIEVEMENT_VIDEOS = [
  {
    id: "v1",
    youtubeId: "dQw4w9WgXcQ",
    youtubeUrl: "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    title: "Ceylon Pharma College - A Journey of Excellence",
    subtitle: "Certificate Course in Pharmacy Practice 1st Day - Batch 18",
    videoUrl: "/gallery/convocation-video.mp4",
    thumbnail: "/gallery/convocation-2024.webp",
    tag: "BATCH 18 CONVOCATION",
    duration: "03:45",
    description: "Official inaugural video from IMHS YouTube channel (@imhs-instituteofmedicinean6349) showcasing pharmacy practice training & graduation.",
  },
  {
    id: "v2",
    youtubeId: "3JZ_D3ELwOQ",
    youtubeUrl: "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    title: "Student Testimonials & Campus Life",
    subtitle: "Real Student Stories & Career Transformation",
    videoUrl: "/gallery/gallery-video-1.mp4",
    thumbnail: "/gallery/graduation-ceremony.webp",
    tag: "STUDENT SUCCESS",
    duration: "04:12",
    description: "Hear directly from our certified pharmacy practice and healthcare graduates on the official IMHS YouTube channel.",
  },
  {
    id: "v3",
    youtubeId: "L_LUpnjgPso",
    youtubeUrl: "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    title: "Inside Our State-of-the-Art Labs",
    subtitle: "Practical Pharmacy Dispensaries & Simulation Labs",
    videoUrl: "/gallery/gallery-video-2.mp4",
    thumbnail: "/gallery/pharmaceutical-lab.jpg",
    tag: "CLINICAL LABS",
    duration: "02:50",
    description: "Exclusive walkthrough of our modern clinical simulation labs and practical dispensary counters.",
  },
  {
    id: "v4",
    youtubeId: "fJ9rUzIMcZQ",
    youtubeUrl: "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    title: "Annual Convocation Ceremony",
    subtitle: "Graduation Honours & Award Distribution",
    videoUrl: "/gallery/gallery-video-3.mp4",
    thumbnail: "/gallery/pharmacy-practical.jpg",
    tag: "SLMC GRADUATION",
    duration: "05:18",
    description: "Highlights from our annual graduation ceremony where students receive SLMC-aligned pharmacy certifications.",
  },
  {
    id: "v5",
    youtubeId: "M7lc1UVf-VE",
    youtubeUrl: "https://www.youtube.com/@imhs-instituteofmedicinean6349",
    title: "A Message from Our Chairman",
    subtitle: "Visionary Healthcare Education & Leadership",
    videoUrl: "/gallery/convocation-video.mp4",
    thumbnail: "/gallery/faculty-consultation.jpg",
    tag: "FACULTY DIRECTORY",
    duration: "03:10",
    description: "Inspiring words and strategic direction from Dr. Isuru Wijesinghe & senior medical board members.",
  },
];

// ─── Hero Entrance Variants ──────────────────────────────────────────────────
const heroVariant = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" as const },
  }),
};

// ─── Contact Form State Type ──────────────────────────────────────────────────
interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export function HomePageClient({ courses, faculty, testimonials, achievements, galleryItems }: HomePageClientProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const coursesCatalogRef = useRef<HTMLDivElement>(null);

  const scrollCoursesCatalog = (direction: "left" | "right") => {
    if (!coursesCatalogRef.current) return;
    const card = coursesCatalogRef.current.firstElementChild as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 24 : 380;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    coursesCatalogRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Achievements Video Showcase State
  const [selectedVideo, setSelectedVideo] = useState(ACHIEVEMENT_VIDEOS[0]);
  const achievementVideoRef = useRef<HTMLVideoElement>(null);

  const handleSelectVideo = (video: typeof ACHIEVEMENT_VIDEOS[0]) => {
    setSelectedVideo(video);
    if (achievementVideoRef.current) {
      achievementVideoRef.current.load();
      achievementVideoRef.current.play().catch(() => { });
    }
  };

  // Contact form state
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
    <div className="space-y-0 overflow-x-hidden bg-surface">

      {/* ── 1. HERO SECTION ────────────────────────────────────────────────── */}
      <section id="top" className="relative min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-12 pt-[68px] overflow-hidden bg-slate-950">
        {/* Full Background Video (All Devices: Mobile, Tablet & Desktop) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source
            src="/gallery/convocation-video.mp4"
            type="video/mp4"
          />
        </video>

        {/* Multi-layer Dark Gradient Overlay for High Readability & Unobstructed Right Video View */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(9, 21, 39, 0.95) 0%, rgba(9, 21, 39, 0.85) 45%, rgba(9, 21, 39, 0.45) 80%, rgba(9, 21, 39, 0.25) 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto py-12">
          {/* Left-Aligned Hero Text Block */}
          <div className="w-full lg:max-w-2xl space-y-6 text-left flex flex-col items-start">
            {/* Headline */}
            <motion.div custom={0.1} variants={heroVariant} initial="hidden" animate="show" className="w-full">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white leading-[1.08] tracking-tight text-left drop-shadow-lg">
                Advancing{" "}
                <motion.span
                  custom={0.2}
                  variants={heroVariant}
                  initial="hidden"
                  animate="show"
                  className="inline-block text-[#F16726] drop-shadow-md"
                >
                  Pharmaceutical Education
                </motion.span>{" "}
                in Sri Lanka
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              custom={0.4}
              variants={heroVariant}
              initial="hidden"
              animate="show"
              className="text-base sm:text-lg text-white/90 font-sans leading-relaxed text-left drop-shadow-sm max-w-xl"
            >
              Develop your knowledge, prepare confidently for pharmacy examinations, and strengthen your professional skills through structured learning and dedicated academic guidance.
            </motion.p>

            {/* Vital ECG Line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="w-full max-w-md py-1"
            >
              <VitalLine variant="hero" animated={true} />
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 pt-2 w-full">
              <motion.div custom={0.55} variants={heroVariant} initial="hidden" animate="show" className="w-full sm:w-auto">
                <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white font-bold text-sm px-8 py-4 rounded-full tracking-wide transition-all duration-200 group shadow-lg shadow-blue-600/35 ring-1 ring-blue-400/40"
                    style={{
                      background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Enrol via WhatsApp</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div custom={0.65} variants={heroVariant} initial="hidden" animate="show" className="w-full sm:w-auto">
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-bold text-sm px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white transition-all duration-200 border border-white/30 hover:bg-white/20 group"
                  >
                    <span>Explore Programmes</span>
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Social Proof */}
            <motion.div custom={0.75} variants={heroVariant} initial="hidden" animate="show" className="flex items-center justify-start gap-3 pt-2">
              <div className="flex -space-x-2">
                {[
                  { initials: "DR", bg: "bg-[#0E57A4]" },
                  { initials: "RN", bg: "bg-[#F16726]" },
                  { initials: "ST", bg: "bg-[#4A8B7A]" },
                ].map(({ initials, bg }) => (
                  <div
                    key={initials}
                    className={`w-8 h-8 rounded-full border-2 border-white/80 ${bg} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm font-sans font-bold text-white">
                Over <span className="text-[#F16726] font-mono font-extrabold">6,000+</span> Active Students
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST & ACCREDITATION STRIP ───────────────────────────────── */}
      <TrustAccreditationStrip />

      {/* ── 3. COURSES CATALOG ─────────────────────────────────────────────── */}
      <section id="programs" className="relative bg-linen/50 py-12 sm:py-20 border-y border-chart-grid overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                ACTIVE COURSE CATALOG
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-ink">
                Featured Medical Programs
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Scroll Controls */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-chart-grid shadow-xs shrink-0">
                <button
                  onClick={() => scrollCoursesCatalog("left")}
                  aria-label="Scroll courses left"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#0E57A4] hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCoursesCatalog("right")}
                  aria-label="Scroll courses right"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#0E57A4] hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link href="/courses" className="shrink-0">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" className="gap-2 justify-center group bg-white border-chart-grid hover:border-[#0E57A4]">
                    View All Programs
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </RevealOnScroll>

          {/* Horizontally Scrollable Cards Container */}
          <div
            ref={coursesCatalogRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {courses.length === 0
              ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="snap-start shrink-0 w-[285px] sm:w-[340px] lg:w-[calc((100%-3rem)/3)]">
                  <CourseCardSkeleton />
                </div>
              ))
              : courses.map((course) => (
                <div
                  key={course.id}
                  className="snap-start shrink-0 w-[285px] sm:w-[340px] lg:w-[calc((100%-3rem)/3)] flex flex-col"
                >
                  <HoverCard className="h-full">
                    <div className="bg-surface border border-chart-grid rounded-2xl overflow-hidden h-full flex flex-col hover:border-[#0E57A4]/60 hover:shadow-xl transition-all duration-300 group">
                      {/* Cover Image */}
                      <div className="relative h-44 sm:h-48 bg-gradient-to-br from-[#0E57A4]/10 to-[#F16726]/10 overflow-hidden">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 bg-[#0A121E]/90 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1 rounded-lg">
                          {formatCurrency(course.price)}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
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

                        <div className="pt-3 sm:pt-4 border-t border-chart-grid/60 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-[#F16726] text-[#F16726]" />
                            ))}
                          </div>
                          <Link
                            href={createCourseInquiryWALink(course.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#0E57A4] font-sans flex items-center gap-1 group-hover:translate-x-1 transition-transform hover:underline"
                          >
                            Enroll Now <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </HoverCard>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── 4. STATS STRIP ─────────────────────────────────────────────────── */}
      <section className="bg-[#0A2540] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STAT_ITEMS.map(({ value, label, icon: Icon }) => (
              <StaggerItem key={label}>
                <div className="text-center space-y-2 group">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="text-3xl font-display font-bold text-white tracking-tight">{value}</div>
                  <div className="text-xs font-mono text-white/50 uppercase tracking-widest">{label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 5. ASYMMETRIC BENTO GRID FEATURES SECTION ─────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        {/* Section Header */}
        <RevealOnScroll className="text-center mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F16726]/10 border border-[#F16726]/20">
            <span className="w-2 h-2 rounded-full bg-[#F16726] animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-[#F16726] uppercase tracking-wider">
              Why Choose IMHS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-ink tracking-tight">
            Built for Serious Healthcare Education
          </h2>
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Combining hospital-grade clinical precision with 24/7 dedicated coordinator support and high-yield learning resources.
          </p>
        </RevealOnScroll>

        {/* Clean 4-Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

          {/* Card 1: Clinical Precision & SLMC Alignment */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-slate-200/90 hover:border-[#0E57A4]/50 rounded-3xl p-7 sm:p-9 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0E57A4]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#0E57A4]/10 rounded-2xl border border-[#0E57A4]/20 flex items-center justify-center text-[#0E57A4] shadow-xs group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  SLMC Aligned
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ink group-hover:text-[#0E57A4] transition-colors">
                  Clinical Precision Curriculum
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Every module is authored and reviewed by practicing consultants from teaching hospitals across Sri Lanka, ensuring 100% compliance with current SLMC examination standards.
                </p>
              </div>

              {/* Live ECG Telemetry Simulation */}
              <div className="pt-2">
                <div className="bg-[#0A121E] border border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE ECG MONITOR: 72 BPM
                    </span>
                    <span className="text-slate-400">NORMAL SINUS RHYTHM</span>
                  </div>
                  <VitalLine variant="hero" animated={true} />
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500 relative z-10 mt-6">
              <span className="font-semibold">Updated for 2024 Exam Syllabus</span>
              <CheckCircle2 className="w-4 h-4 text-[#0E57A4]" />
            </div>
          </motion.div>

          {/* Card 2: 24/7 WhatsApp Coordinator Desk */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl p-7 sm:p-9 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online · Avg 2 min response
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ink group-hover:text-emerald-700 transition-colors">
                  WhatsApp-First Student Support
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  24/7 dedicated desk coordinators for instant enrollment verification, timetable updates, and direct faculty Q&amp;A escalation directly via WhatsApp.
                </p>
              </div>

              {/* Chat Preview Bubble */}
              <div className="pt-2">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      IMHS Desk Coordinator
                    </span>
                    <span>Just now</span>
                  </div>
                  <p className="text-slate-700 font-sans font-medium text-xs leading-relaxed">
                    &ldquo;Hello! Your course enrollment is confirmed. Portal credentials have been sent to your WhatsApp.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-emerald-700 font-semibold relative z-10 mt-6">
              <span>Instant Desk Assistance</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
          </motion.div>

          {/* Card 3: On-Demand HD Video Modules */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-slate-200/90 hover:border-[#0E57A4]/50 rounded-3xl p-7 sm:p-9 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0E57A4]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#0E57A4]/10 rounded-2xl border border-[#0E57A4]/20 flex items-center justify-center text-[#0E57A4] shadow-xs group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 fill-[#0E57A4]" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> Domain-Locked HD
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ink group-hover:text-[#0E57A4] transition-colors">
                  On-Demand Video Modules
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Vimeo-hosted crystal clear HD lectures you can pause, rewind, adjust playback speed, and re-watch at clinical depth without restrictions.
                </p>
              </div>

              {/* Stream Quality Feature Chips */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="block text-[11px] font-bold font-mono text-[#0E57A4]">1080p</span>
                  <span className="block text-[9px] text-slate-400 font-mono">Full HD CDN</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="block text-[11px] font-bold font-mono text-[#0E57A4]">0.5x - 2x</span>
                  <span className="block text-[9px] text-slate-400 font-mono">Speed Control</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="block text-[11px] font-bold font-mono text-[#0E57A4]">Auto-Resume</span>
                  <span className="block text-[9px] text-slate-400 font-mono">Across Devices</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500 relative z-10 mt-6">
              <span className="font-semibold">Unlimited Lifetime Portal Re-runs</span>
              <CheckCircle2 className="w-4 h-4 text-[#0E57A4]" />
            </div>
          </motion.div>

          {/* Card 4: Downloadable Ward Resources */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-slate-200/90 hover:border-[#F16726]/50 rounded-3xl p-7 sm:p-9 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F16726]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#F16726]/10 rounded-2xl border border-[#F16726]/20 flex items-center justify-center text-[#F16726] shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#F16726] bg-[#F16726]/10 border border-[#F16726]/20 px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Download className="w-3 h-3" /> PDF Case Bank
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ink group-hover:text-[#F16726] transition-colors">
                  Downloadable Clinical Resources
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  ECG trace libraries, pathology slide banks, and downloadable PDF checklists ready for ward reference, clinical rounds, and examination prep.
                </p>
              </div>

              {/* Resource File Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {[
                  "ECG Masterclass Traces",
                  "Clinical Pathology Slides",
                  "Drug Dosage Formula Sheets",
                  "SLMC Past SEQ Checklist",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-[#F16726] shrink-0" />
                    <span className="truncate text-[11px] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-[#F16726] font-semibold relative z-10 mt-6">
              <span>Full Ward Reference Library</span>
              <ShieldCheck className="w-4 h-4 text-[#F16726]" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── 6. 4-STEP INTERACTIVE ENROLLMENT WORKFLOW ─────────────────────── */}
      <EnrollmentProcessSection />

      {/* ── 8. OUR ACHIEVEMENTS & HIGHLIGHTS ─────────────────────────────────────── */}
      <AchievementsSection videos={achievements} />

      {/* ── 9. STUDENT VOICES & TESTIMONIALS ───────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="bg-surface py-20 border-b border-chart-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <RevealOnScroll className="text-center space-y-2">
              <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                STUDENT VOICES
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink">
                Trusted by Thousands of Healthcare Professionals
              </h2>
            </RevealOnScroll>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <HoverCard className="h-full">
                    <div className="bg-surface border border-chart-grid rounded-2xl p-6 h-full flex flex-col gap-4 hover:border-[#0E57A4]/40 transition-all duration-300 shadow-paper">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-[#F16726] text-[#F16726]" />
                        ))}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed italic flex-1">
                        {/* Authentic ℞ (Recipe / Prescription) glyph quote mark */}
                        <span className="font-mono text-[#F16726] text-xl font-bold not-italic mr-1.5">℞</span>
                        {t.quote}
                      </p>
                      <div className="pt-3 border-t border-chart-grid/60">
                        <p className="text-sm font-bold text-ink font-sans">{t.studentName}</p>
                        <p className="text-xs font-mono text-[#0E57A4]">{t.courseTaken}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ── 10. CONTACT BAND ───────────────────────────────────────────────── */}
      <section className="bg-linen/60 border-y border-chart-grid py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Contact Info */}
            <RevealOnScroll className="space-y-8">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#F16726] uppercase tracking-wider font-semibold">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-ink">
                  Have Questions? We&apos;re Here to Help
                </h2>
                <p className="text-base text-ink-muted leading-relaxed max-w-md">
                  Reach out via WhatsApp, phone, or the form. Our admin desk responds within a few hours.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+94778025050"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-2xl hover:border-[#0E57A4]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0E57A4]/10 flex items-center justify-center group-hover:bg-[#0E57A4]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#0E57A4]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">Phone / Hotline</div>
                    <div className="text-sm font-bold text-ink">+94 77 802 5050</div>
                  </div>
                </a>

                <a
                  href="mailto:info@imhs.lk"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-2xl hover:border-[#6366F1]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center group-hover:bg-[#6366F1]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">Email</div>
                    <div className="text-sm font-bold text-ink">info@imhs.lk</div>
                  </div>
                </a>

                <Link
                  href={createCourseInquiryWALink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-surface border border-chart-grid rounded-2xl hover:border-[#25D366]/40 hover:shadow-paper transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-sage uppercase tracking-wider">WhatsApp Desk</div>
                    <div className="text-sm font-bold text-ink">Message Us Instantly</div>
                  </div>
                </Link>
              </div>
            </RevealOnScroll>

            {/* Right: Contact Form */}
            <RevealOnScroll delay={0.2}>
              <div className="bg-surface border border-chart-grid rounded-3xl p-6 sm:p-8 shadow-paper space-y-6">
                <h3 className="text-xl font-display font-bold text-ink">Send Us a Message</h3>

                <AnimatePresence mode="wait">
                  {contactStatus === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 py-8 text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      </div>
                      <p className="font-bold text-ink text-base">Message Sent!</p>
                      <p className="text-xs text-ink-muted">We&apos;ll respond to your inquiry shortly.</p>
                      <button
                        onClick={() => setContactStatus("idle")}
                        className="text-xs text-[#0E57A4] font-semibold underline underline-offset-2 mt-2"
                      >
                        Send another message
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
                          className="contact-input text-xs"
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
                          className="contact-input text-xs"
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
                          className="contact-input text-xs"
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
                          placeholder="I'm interested in the Clinical Pathology course..."
                          className="contact-input text-xs resize-none"
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
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                        style={{
                          background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)",
                          boxShadow: "0 4px 16px rgba(14,87,164,0.25)",
                        }}
                      >
                        {contactStatus === "sending" ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending Message…
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

      {/* ── 11. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="relative py-20 bg-clinical-teal-surface border-t border-clinical-teal/20 overflow-hidden">
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
            <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer">
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
