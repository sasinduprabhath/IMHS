import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { RevealOnScroll, AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { DrIsuruBookingClient } from "@/components/marketing/DrIsuruBookingClient";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import {
  Stethoscope,
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileText,
  Star,
  Sparkles,
  Users,
  Calendar as CalendarCapIcon,
} from "lucide-react";

export const metadata = {
  title: "Dr. Isuru Wijesinghe - IMHS",
  description:
    "Official academic profile of Dr. Isuru Wijesinghe, Executive Director & Senior Lecturer at the Institute of Medicine and Health Sciences (IMHS), Sri Lanka.",
};

export const revalidate = 60;

export default async function DrIsuruWijesinghePage() {
  // Fetch courses from DB
  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      where: { published: true },
      include: { chapters: { include: { lessons: true } } },
      take: 4,
    });
  } catch (e) {
    console.error("DB fetch error on faculty profile:", e);
  }

  return (
    <div className="overflow-x-hidden bg-surface">
      {/* ── HERO BANNER ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Faculty Directory
          </Link>

          <div className="bg-surface border border-chart-grid rounded-card p-6 sm:p-10 shadow-paper-stack flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Lecturer Image Frame */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-clinical-teal/30 shadow-2xl shrink-0">
              <Image
                src="/isuru.png"
                alt="Dr. Isuru Wijesinghe"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 ring-1 ring-black/10 rounded-2xl" />
            </div>

            {/* Profile Info */}
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-mono text-xs text-chart-red uppercase tracking-widest font-bold bg-chart-red/10 border border-chart-red/20 px-3 py-1 rounded-full">
                  Executive Leadership
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-3 py-1 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified IMHS Senior Faculty
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight">
                  Dr. Isuru Wijesinghe
                </h1>
                <p className="text-sm sm:text-base font-mono text-clinical-teal font-medium mt-1">
                  Ph.D. in Pharmaceutical Sciences | MSc | B.Pharm (Honours)
                </p>
                <p className="text-xs sm:text-sm text-ink-muted font-sans mt-1">
                  Executive Director & Senior Lecturer • Head of Academic Affairs
                </p>
              </div>

              {/* Quick Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-linen/50 border border-chart-grid p-3 rounded-lg text-center md:text-left">
                  <div className="text-xs font-mono text-sage uppercase">Experience</div>
                  <div className="text-sm font-bold text-ink font-mono">15+ Years</div>
                </div>
                <div className="bg-linen/50 border border-chart-grid p-3 rounded-lg text-center md:text-left">
                  <div className="text-xs font-mono text-sage uppercase">Students Mentored</div>
                  <div className="text-sm font-bold text-clinical-teal font-mono">1,000+ Alumni</div>
                </div>
                <div className="bg-linen/50 border border-chart-grid p-3 rounded-lg col-span-2 sm:col-span-1 text-center md:text-left">
                  <div className="text-xs font-mono text-sage uppercase">Institution</div>
                  <div className="text-sm font-bold text-ink font-mono">IMHS Sri Lanka</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Link href="/consultation">
                  <Button className="gap-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 font-semibold text-xs shadow-md">
                    <CalendarCapIcon className="w-4 h-4" />
                    Book 1-on-1 Mentorship &amp; Viva
                  </Button>
                </Link>

                <a
                  href={createCourseInquiryWALink("Modern Pharmacy Course (SLMC Prep)")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2 text-xs font-semibold">
                    <MessageCircle className="w-4 h-4 text-chart-red" />
                    WhatsApp Admissions Desk
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIOGRAPHY & ACADEMIC ACHIEVEMENTS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Academic Bio (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <RevealOnScroll className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
              <div className="border-b border-chart-grid pb-4">
                <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-clinical-teal" />
                  Academic Profile & Leadership Vision
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-ink-muted leading-relaxed font-sans">
                <p>
                  <strong>Dr. Isuru Wijesinghe</strong> serves as the Executive Director and Senior Lecturer at the
                  <strong> Institute of Medicine and Health Sciences (IMHS)</strong>, Maharagama, Sri Lanka. With over
                  fifteen years of distinguished academic lecturing and clinical pharmacy research leadership, he has
                  been at the forefront of modernizing healthcare education across Sri Lanka.
                </p>
                <p>
                  Dr. Wijesinghe holds a <strong>Ph.D. in Pharmaceutical Sciences</strong>, a Master of Science (MSc),
                  and a Bachelor of Pharmacy (B.Pharm Honours). His teaching philosophy bridges rigorous clinical theory
                  with real-world hospital and retail pharmacy practice, preparing students for official
                  <strong> Sri Lanka Medical Council (SLMC)</strong> registration examinations and pharmaceutical industry careers.
                </p>
                <p>
                  Under his academic directorship, IMHS has established state-of-the-art curriculum frameworks in
                  Modern Pharmacy, Pharmaceutical Manufacturing (GMP QA/QC), and Medical Laboratory Technology (MLT),
                  enabling hundreds of clinical graduates to transition into senior roles at leading hospitals, research
                  institutes, and pharmaceutical manufacturing facilities nationwide.
                </p>
              </div>
            </RevealOnScroll>

            {/* Core Competencies & Specializations Grid */}
            <RevealOnScroll className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
              <div className="border-b border-chart-grid pb-4">
                <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
                  <Award className="w-5 h-5 text-chart-red" />
                  Specialized Academic & Clinical Focus
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-linen/40 border border-chart-grid p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-clinical-teal font-semibold text-sm font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    Pharmacology & Therapeutics
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    Therapeutic drug classification, pharmacokinetics, pharmacodynamics, and clinical dose calculations.
                  </p>
                </div>

                <div className="bg-linen/40 border border-chart-grid p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-clinical-teal font-semibold text-sm font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    SLMC Exam Preparation
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    Comprehensive SLMC Pharmacy registration examination prep, poisons ethics, and Sri Lankan health laws.
                  </p>
                </div>

                <div className="bg-linen/40 border border-chart-grid p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-clinical-teal font-semibold text-sm font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    Industrial GMP & Quality Control
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    Cleanroom environmental validation, sterile batch manufacturing, and Good Manufacturing Practice (GMP).
                  </p>
                </div>

                <div className="bg-linen/40 border border-chart-grid p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-clinical-teal font-semibold text-sm font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    Community Pharmacy Practice
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">
                    Prescription verification, patient drug interaction counseling, and storage of controlled substances.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Right Sidebar Highlights & Quick Facts (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-5 shadow-paper sticky top-28">
              <div className="space-y-1 border-b border-chart-grid pb-3">
                <span className="font-mono text-[10px] text-clinical-teal uppercase tracking-wider font-bold">
                  DIRECTOR DETAILS
                </span>
                <h3 className="text-lg font-display font-semibold text-ink">Institutional Record</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start justify-between border-b border-chart-grid/60 pb-2">
                  <span className="text-sage">Designation</span>
                  <span className="font-semibold text-ink text-right">Executive Director</span>
                </div>
                <div className="flex items-start justify-between border-b border-chart-grid/60 pb-2">
                  <span className="text-sage">Faculty Role</span>
                  <span className="font-semibold text-ink text-right">Senior Lecturer</span>
                </div>
                <div className="flex items-start justify-between border-b border-chart-grid/60 pb-2">
                  <span className="text-sage">Highest Degree</span>
                  <span className="font-semibold text-clinical-teal text-right">Ph.D. Pharm Sci</span>
                </div>
                <div className="flex items-start justify-between border-b border-chart-grid/60 pb-2">
                  <span className="text-sage">Location</span>
                  <span className="font-semibold text-ink text-right">Maharagama, Sri Lanka</span>
                </div>
                <div className="flex items-start justify-between pb-1">
                  <span className="text-sage">Helpline Desk</span>
                  <span className="font-semibold text-clinical-teal text-right">+94 77 802 5050</span>
                </div>
              </div>

              {/* Contact Box */}
              <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-4 rounded-lg space-y-3">
                <p className="text-xs text-ink font-sans font-medium">
                  Have questions regarding enrollment in Dr. Isuru&apos;s lectures?
                </p>
                <a
                  href={createCourseInquiryWALink("Modern Pharmacy Course (SLMC Prep)")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="sm" className="w-full gap-1.5 text-xs font-semibold bg-chart-red hover:bg-chart-red-hover text-white border-0">
                    <MessageCircle className="w-4 h-4 fill-current" /> Contact Academic Office
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACADEMIC COURSES TAUGHT ── */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-chart-grid pb-4">
            <div>
              <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">ACADEMIC CURRICULUM</span>
              <h2 className="text-2xl font-display font-semibold text-ink">Programs & Courses Directed</h2>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                Explore Full Catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper flex flex-col justify-between hover:border-clinical-teal/60 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-44 bg-linen overflow-hidden">
                  {course.coverImage ? (
                    <Image
                      src={formatGoogleDriveImageUrl(course.coverImage) || course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-clinical-teal/20 to-chart-red/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-clinical-teal/40" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-ink/90 backdrop-blur-sm text-white font-mono text-xs font-bold px-3 py-1 rounded">
                    {formatCurrency(course.price)}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] uppercase text-chart-red font-bold">
                      {course.category || "Healthcare"}
                    </span>
                    <h3 className="text-base font-semibold font-sans text-ink leading-snug line-clamp-2 group-hover:text-clinical-teal transition-colors">
                      {course.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-chart-grid/60 flex items-center justify-between text-xs font-mono text-clinical-teal">
                    <span>{course.chapters.length} Chapters</span>
                    <span className="font-semibold group-hover:translate-x-1 transition-transform">
                      View Syllabus &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
