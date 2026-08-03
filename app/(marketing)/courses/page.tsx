import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { RevealOnScroll, StaggerChildren, StaggerItem, HoverCard, AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { CourseSearchClient } from "@/components/marketing/CourseSearchClient";
import { BlisterDivider } from "@/components/marketing/BlisterDivider";
import { DNAHelix, BenzeneRing, MedicalCross, PillCapsuleOrbs, FloatingMolecules, AtomicOrbit, ChemBondParticles } from "@/components/marketing/PharmacyAnimations";
import {
  BookOpen, Clock, Users, Star, ArrowRight, Search,
  GraduationCap, ShieldCheck, PhoneCall
} from "lucide-react";
import { createCourseInquiryWALink } from "@/lib/whatsapp";

export const metadata = {
  title: "Course Catalog - IMHS Clinical Education Programs",
  description: "Browse accredited pharmaceutical, clinical pathology, and healthcare education courses at IMHS, Sri Lanka.",
};

export const revalidate = 60;

export default async function CoursesCatalogPage() {
  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      where: { published: true },
      include: {
        chapters: {
          include: { lessons: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Courses catalog DB connection error (MySQL):", error);
  }

  const totalLessons = courses.reduce(
    (sum: number, c: any) => sum + c.chapters.reduce((s: number, ch: any) => s + ch.lessons.length, 0),
    0
  );

  return (
    <div className="overflow-x-hidden bg-surface">

      {/* ── HERO (LIGHT MODE) ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={450} className="-top-24 -left-24 opacity-15" />
        {/* DNA Helix left accent */}
        <DNAHelix width={65} height={320} className="absolute left-8 top-16 opacity-35 hidden lg:block" />
        {/* Atomic orbit top right */}
        <AtomicOrbit size={190} color="#F16726" className="absolute -top-12 -right-12 opacity-20" />
        {/* Floating molecules */}
        <FloatingMolecules count={7} className="opacity-45" />
        {/* Chem bond particles */}
        <ChemBondParticles count={10} className="opacity-30" />
        {/* Medical crosses */}
        <MedicalCross size={26} color="#0E57A4" className="absolute top-24 right-1/4 opacity-25" />
        <MedicalCross size={18} color="#4A8B7A" className="absolute bottom-10 left-1/3 opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block font-mono text-xs text-chart-red uppercase tracking-widest font-semibold border border-chart-red/30 px-4 py-1.5 rounded-full bg-white">
            ACADEMIC CURRICULUM
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-ink leading-tight">
            Clinical Education{" "}
            <span className="text-clinical-teal">
              Programs
            </span>
          </h1>
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Structured, consultant-led pharmaceutical and clinical certification courses for healthcare professionals and medical students.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <BookOpen className="w-3.5 h-3.5 text-clinical-teal" />
              {courses.length} Active Programs
            </div>
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <GraduationCap className="w-3.5 h-3.5 text-clinical-teal" />
              {totalLessons} Video Lessons
            </div>
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
              Certified Programs
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH & COURSES ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {/* Pill orbs subtle decoration */}
        <PillCapsuleOrbs count={5} className="opacity-40" />
        {/* Blister-cell rhythm at top of grid */}
        <BlisterDivider className="mb-2" />
        <CourseSearchClient courses={courses} />
      </section>

      {/* ── ENROLL CTA (LIGHT MODE) ── */}
      <section className="relative bg-clinical-teal-surface border-t border-clinical-teal/20 py-16 overflow-hidden">
        <AnimatedGrid className="text-clinical-teal/10" />
        {/* Benzene rings in CTA background */}
        <BenzeneRing size={120} color="#0E57A4" className="absolute -bottom-4 left-8 opacity-20" />
        <BenzeneRing size={90} color="#F16726" className="absolute top-4 right-16 opacity-15" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 space-y-6">
          <RevealOnScroll>
            <h2 className="text-3xl font-display font-semibold text-ink">
              Ready to Enroll in a Program?
            </h2>
            <p className="text-base text-ink-muted mt-3">
              Contact our admissions desk to submit your application and secure your seat.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <Link href="/contact" className="inline-block mt-4">
              <Button className="gap-2.5 bg-chart-red hover:bg-chart-red-hover text-white border-0 shadow-md font-semibold px-8 py-3 text-base">
                <PhoneCall className="w-5 h-5" />
                Inquire & Enroll Now
              </Button>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
