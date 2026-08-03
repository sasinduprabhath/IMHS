"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VitalLine } from "@/components/ui/vital-line";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { DoseCurve } from "@/components/marketing/DoseCurve";
import { BlisterDivider } from "@/components/marketing/BlisterDivider";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { HeroPharmacyScene, ChemBondParticles, BenzeneRing, PillCapsuleOrbs, AtomicOrbit, DNAHelix, FloatingMolecules, MedicalCross } from "@/components/marketing/PharmacyAnimations";
import {
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
  HoverCard,
  GlowOrb,
  TypewriterText,
} from "@/components/ui/animations";
import {
  CourseCardSkeleton,
  FacultyCardSkeleton,
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
  Clock,
  Star,
  ChevronRight,
  Play,
  HeartPulse,
  Stethoscope,
  ChevronRight as ArrowIcon,
  Sparkles,
} from "lucide-react";

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

const STAT_ITEMS = [
  { value: "3,500+", label: "Alumni Graduates", icon: GraduationCap },
  { value: "2019", label: "Est. Maharagama, LK", icon: Award },
  { value: "6", label: "Senior Consultants", icon: Stethoscope },
  { value: "4+", label: "Active Programs", icon: BookOpen },
];

const FEATURE_ITEMS = [
  {
    icon: HeartPulse,
    title: "Clinical Precision Curriculum",
    body: "Every module is authored and reviewed by practicing consultants from teaching hospitals across Sri Lanka.",
  },
  {
    icon: Users,
    title: "WhatsApp-First Support",
    body: "24/7 coordinator access, instant enrollment confirmation, and direct faculty Q&A via WhatsApp desk.",
  },
  {
    icon: Play,
    title: "On-Demand Video Modules",
    body: "Vimeo-hosted HD lectures you can pause, rewind, and re-watch at clinical depth without limits.",
  },
  {
    icon: FileCheck,
    title: "Downloadable Case Resources",
    body: "ECG trace libraries, pathology slide banks, and downloadable PDF checklists for ward reference.",
  },
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

export function HomePageClient({ courses, faculty, testimonials }: HomePageClientProps) {
  return (
    <div className="space-y-0 overflow-x-hidden bg-surface">

      {/* ── 1. CLEAN & SIMPLE HERO SECTION ────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-clinical-teal-surface/40 via-surface to-surface px-4 sm:px-6 lg:px-8 pt-6 sm:pt-24 pb-10 sm:pb-16 border-b border-chart-grid">
        {/* Pharmacy-themed background animations */}
        <HeroPharmacyScene />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headlines, Heartbeat, Mobile Image, Call-to-Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* 1. Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-ink leading-[1.1] tracking-tight text-center lg:text-left">
                Sri Lanka Best{" "}
                <span className="relative inline-block text-chart-red">
                  Healthcare
                  {/* Dose Curve — pharmacokinetic absorption curve under keyword */}
                  <span className="absolute -bottom-5 left-0 w-full">
                    <DoseCurve variant="hero" />
                  </span>
                </span>{" "}
                Education
              </h1>
            </motion.div>

            {/* 2. Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-ink-muted max-w-xl font-sans leading-relaxed text-center lg:text-left mx-auto lg:mx-0"
            >
              Experience top-tier medical education, SLMC exam preparation, and career opportunities with us. Join our prestigious community today!
            </motion.p>

            {/* 3. Vital ECG Line (Heartbeat) */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md py-1 mx-auto lg:mx-0"
            >
              <VitalLine variant="hero" animated={true} />
            </motion.div>

            {/* 4. Hero Image Card (Mobile View Only: Positioned right after heartbeat) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="block lg:hidden w-full my-2"
            >
              <div className="relative h-[280px] sm:h-[360px] w-full rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-linen mx-auto">
                <Image
                  src="/hero.jpg"
                  alt="Sri Lanka Best Healthcare Education"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </motion.div>

            {/* 5. CTA Buttons (Positioned after image on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-1 w-full"
            >
              <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-bold text-sm px-8 py-4 rounded-full shadow-lg shadow-chart-red/30 tracking-wide"
                  >
                    <span>GET STARTED</span>
                    <ArrowIcon className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/courses" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 border-2 border-chart-red text-chart-red hover:bg-chart-red/5 font-bold text-sm px-8 py-4 rounded-full bg-white tracking-wide"
                  >
                    <span>Browse Programs</span>
                    <ArrowIcon className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* 6. Social Proof Rating & Active Students */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-clinical-teal text-white flex items-center justify-center text-[10px] font-bold">
                  DR
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-chart-red text-white flex items-center justify-center text-[10px] font-bold">
                  RN
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-sage text-white flex items-center justify-center text-[10px] font-bold">
                  ST
                </div>
              </div>
              <div className="text-sm font-sans font-bold text-ink">
                Over <span className="text-chart-red font-mono">3,500+</span> Active Students
              </div>
            </motion.div>

          </div>

          {/* Right Column: Clean Hero Image Card (Desktop View Only) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5 relative"
          >
            <div className="relative h-[400px] sm:h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-linen">
              <Image
                src="/hero.jpg"
                alt="Sri Lanka Best Healthcare Education"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── 2. TRUST STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-chart-grid py-6">
        {/* Blister pack rhythm divider at the top edge */}
        <BlisterDivider className="mb-4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-sage mb-5">
            Recognized Standards &amp; Certifications
          </p>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, label: "PHARMACEUTICAL GUILD" },
              { icon: GraduationCap, label: "CONTINUING MED CREDITS" },
              { icon: ShieldCheck, label: "INSTITUTIONAL CERT" },
              { icon: CheckCircle2, label: "TERTIARY CARE FACULTY" },
            ].map(({ icon: Icon, label }) => (
              <StaggerItem key={label}>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-ink-muted py-2 px-4 rounded border border-chart-grid/60 hover:border-clinical-teal/40 hover:text-clinical-teal transition-all duration-300 bg-linen/40">
                  <Icon className="w-4 h-4 text-clinical-teal flex-shrink-0" />
                  <span>{label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 3. COURSES CATALOG ─────────────────────────────────────── */}
      <section className="relative bg-linen/50 py-20 border-y border-chart-grid overflow-hidden">
        {/* DNA helix right edge */}
        <DNAHelix width={55} height={300} className="absolute right-2 top-8 opacity-25 hidden xl:block" />
        {/* Chem bond particles background */}
        <ChemBondParticles count={8} className="opacity-25" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">
                ACTIVE COURSE CATALOG
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">
                Featured Medical Programs
              </h2>
            </div>
            <Link href="/courses">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="gap-2 group bg-white">
                  View All Programs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                      <Link href={`/courses/${course.slug}`} className="block h-full">
                        <div className="bg-surface border border-chart-grid rounded-card overflow-hidden h-full flex flex-col hover:border-clinical-teal/60 hover:shadow-xl transition-all duration-300 group">
                          {/* Course cover image or gradient */}
                          <div className="relative h-44 bg-gradient-to-br from-clinical-teal/10 to-chart-red/10 overflow-hidden">
                            {course.coverImage ? (
                              <Image
                                src={formatGoogleDriveImageUrl(course.coverImage) || course.coverImage}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Microscope className="w-16 h-16 text-clinical-teal/20" />
                              </div>
                            )}
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
                            {/* Price badge */}
                            <div className="absolute bottom-3 left-3 bg-ink/90 backdrop-blur-sm text-white text-xs font-mono font-bold px-3 py-1 rounded">
                              {formatCurrency(course.price)}
                            </div>
                          </div>

                          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-chart-red font-semibold">
                                {course.slug.split("-").slice(0, 2).join("-").toUpperCase()}
                              </span>
                              <h3 className="text-base font-semibold font-sans text-ink line-clamp-2 leading-snug group-hover:text-clinical-teal transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                                {course.description}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-chart-grid/60 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className="w-3 h-3 fill-chart-red text-chart-red" />
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-clinical-teal font-sans flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Explore Program <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </HoverCard>
                  </StaggerItem>
                ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 5. FEATURES GRID (WHY CHOOSE IMHS) ─────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* AtomicOrbit corner accent */}
        <AtomicOrbit size={160} color="#4A8B7A" className="absolute -right-8 top-12 opacity-15" />
        <BenzeneRing size={100} color="#0E57A4" className="absolute -left-6 bottom-8 opacity-10" />
        <RevealOnScroll className="text-center mb-12 space-y-2">
          <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">
            WHY CHOOSE IMHS
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">
            Built for Serious Healthcare Education
          </h2>
        </RevealOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURE_ITEMS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <HoverCard className="h-full">
                <div className="bg-surface border border-chart-grid rounded-card p-7 h-full flex gap-5 hover:border-clinical-teal/40 hover:shadow-paper transition-all duration-300 group">
                  <div className="w-12 h-12 bg-clinical-teal/10 rounded border border-clinical-teal/20 flex items-center justify-center flex-shrink-0 group-hover:bg-clinical-teal/20 transition-colors">
                    <Icon className="w-6 h-6 text-clinical-teal" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-ink font-sans">{title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── 5B. MEET OUR LECTURER SECTION (IMMEDIATELY AFTER WHY CHOOSE IMHS) ──── */}
      <section className="relative bg-linen/40 border-y border-chart-grid py-20 overflow-hidden">
        {/* Pharmacy animations in lecturer section */}
        <PillCapsuleOrbs count={5} className="opacity-50" />
        <MedicalCross size={24} color="#F16726" className="absolute top-16 right-16 opacity-20" />
        <MedicalCross size={18} color="#0E57A4" className="absolute bottom-20 left-12 opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RevealOnScroll className="text-center space-y-3">
            <span className="font-mono text-xs text-chart-red uppercase tracking-widest font-bold bg-chart-red-light px-3 py-1 rounded-full border border-chart-red/20">
              SENIOR FACULTY SPOTLIGHT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-ink">
              Meet Our Lecturer
            </h2>
            <p className="text-base text-ink-muted max-w-lg mx-auto font-sans">
              Learn directly from senior lecturers and directors guiding Sri Lanka&apos;s medical and pharmacy graduates.
            </p>
          </RevealOnScroll>

          {/* Dashed Outline Lecturer Card Container */}
          <RevealOnScroll delay={0.2} className="max-w-xl mx-auto">
            <div className="border-2 border-dashed border-sage/40 rounded-3xl p-6 sm:p-8 bg-surface shadow-paper text-center space-y-6 hover:border-clinical-teal transition-all duration-300 group">
              
              {/* Full Length Photo Box */}
              <div className="relative h-[480px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-chart-grid shadow-md bg-ink">
                <Image
                  src="/lecturer.jpeg"
                  alt="Dr. Isuru Wijesinghe - Senior Lecturer, IMHS"
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60" />
              </div>

              {/* Lecturer Information */}
              <div className="space-y-2 pt-2">
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-ink tracking-tight">
                  Dr. Isuru Wijesinghe
                </h3>
                <p className="font-mono text-sm sm:text-base text-ink-muted font-medium">
                  (Ph.D., MSc, B.Pharm)
                </p>
                <div className="pt-1">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-clinical-teal bg-clinical-teal-surface border border-clinical-teal/20 px-4 py-1.5 rounded-full inline-block">
                    Senior Lecturer / Director, IMHS
                  </span>
                </div>
              </div>

            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── 6. HOW IT WORKS ────────────────────────────────────────── */}
      <section className="bg-surface border-y border-chart-grid py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <RevealOnScroll className="text-center space-y-2">
            <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">
              ENROLLMENT PROCESS
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">
              How to Get Started in 4 Steps
            </h2>
          </RevealOnScroll>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }, index) => (
              <StaggerItem key={step}>
                <div className="relative text-center space-y-4 group">
                  {/* Dose Curve connector between steps */}
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+32px)] right-0 overflow-hidden">
                      <DoseCurve variant="divider" />
                    </div>
                  )}

                  <div className="relative mx-auto w-20 h-20 bg-clinical-teal-surface border border-clinical-teal/20 rounded-full flex items-center justify-center group-hover:border-clinical-teal group-hover:shadow-md transition-all duration-300">
                    <Icon className="w-8 h-8 text-clinical-teal" />
                    {/* Step number in sage — pharmacy-green accent */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-sage rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-mono font-bold text-white">{step}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-ink font-sans">{title}</h3>
                    <p className="text-xs text-ink-muted leading-relaxed px-2">{body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <RevealOnScroll className="text-center pt-4">
            <Link href="/contact">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  className="gap-2.5 bg-chart-red hover:bg-chart-red-hover border-0 text-white shadow-lg font-semibold px-10"
                >
                  <PhoneCall className="w-5 h-5" />
                  Start Enrollment Now
                </Button>
              </motion.div>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS ────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="bg-linen/50 py-20 border-b border-chart-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <RevealOnScroll className="text-center space-y-2">
              <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">
                STUDENT VOICES
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">
                Trusted by Thousands of Healthcare Professionals
              </h2>
            </RevealOnScroll>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <StaggerItem key={t.id}>
                  <HoverCard className="h-full">
                    <div className="bg-surface border border-chart-grid rounded-card p-6 h-full flex flex-col gap-4 hover:border-clinical-teal/30 transition-all duration-300 shadow-paper">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-chart-red text-chart-red" />
                        ))}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed italic flex-1">
                        {/* ℞ glyph as opening quote — pharmacy identity detail */}
                        <span className="font-mono text-chart-red text-lg font-bold not-italic mr-1">℞</span>
                        {t.quote}
                      </p>
                      <div className="pt-2 border-t border-chart-grid/60">
                        <p className="text-sm font-semibold text-ink font-sans">{t.studentName}</p>
                        <p className="text-xs font-mono text-clinical-teal">{t.courseTaken}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ── 8. FINAL CTA ───────────────────────────────────────────── */}
      <section className="relative py-20 bg-clinical-teal-surface border-t border-clinical-teal/20 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealOnScroll>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-ink leading-tight">
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
                  className="gap-2.5 bg-chart-red hover:bg-chart-red-hover border-0 text-white shadow-lg font-semibold px-10 text-base"
                >
                  <PhoneCall className="w-5 h-5" />
                  Inquire & Enroll Now
                </Button>
              </motion.div>
            </Link>
            <Link href="/courses">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 font-semibold px-8 text-base bg-white"
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
