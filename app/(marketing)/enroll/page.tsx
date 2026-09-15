import React, { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EnrollmentApplicationClient, CourseOption } from "@/components/marketing/EnrollmentApplicationClient";
import { BlisterDivider } from "@/components/marketing/BlisterDivider";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
  Lock,
  Headphones,
  Award,
} from "lucide-react";
import { BenzeneRing, MedicalCross, PillCapsuleOrbs } from "@/components/marketing/PharmacyAnimations";

export const metadata = {
  title: "Online Enrollment Application | IMHS Education",
  description:
    "Apply and enroll online for professional pharmacy education, pharmaceutical training, and clinical healthcare programmes at IMHS. Fast registration with WhatsApp verification.",
  alternates: {
    canonical: "https://imhsedu.com/enroll",
  },
  openGraph: {
    title: "Online Enrollment Application | IMHS Education",
    description:
      "Apply online for pharmacy and healthcare certificate programmes at IMHS. Direct bank transfer & WhatsApp activation.",
    url: "https://imhsedu.com/enroll",
    images: [{ url: "/gallery/pharmacy-practical.jpg", width: 1200, height: 630, alt: "IMHS Enrollment" }],
  },
};

export const revalidate = 60;

// Fallback courses in case database query is cold or returns empty
const FALLBACK_COURSES: CourseOption[] = [
  {
    id: "pharmacy-practice",
    title: "Certificate in Pharmacy Practice & Clinical Dispensing",
    slug: "certificate-in-pharmacy-practice",
    code: "PHARM-101",
    price: 45000,
    category: "Pharmacy",
    duration: "6 Months",
    enrollmentValidity: "Lifetime Access",
  },
  {
    id: "pharmacology-fundamentals",
    title: "Applied Pharmacology & Therapeutics for Healthcare Professionals",
    slug: "applied-pharmacology-therapeutics",
    code: "PHARM-201",
    price: 52000,
    category: "Pharmacology",
    duration: "4 Months",
    enrollmentValidity: "Lifetime Access",
  },
  {
    id: "community-pharmacy",
    title: "Community Pharmacy Management & Regulatory Standards",
    slug: "community-pharmacy-management",
    code: "PHARM-301",
    price: 38000,
    category: "Management",
    duration: "3 Months",
    enrollmentValidity: "Lifetime Access",
  },
];

export default async function EnrollPage() {
  let dbCourses: CourseOption[] = [];

  try {
    const raw = await prisma.course.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        category: true,
        level: true,
        enrollmentValidity: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (raw && raw.length > 0) {
      dbCourses = raw.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        price: c.price,
        category: c.category,
        level: c.level,
        enrollmentValidity: c.enrollmentValidity,
      }));
    }
  } catch (error) {
    console.error("Enroll page course fetch fallback:", error);
  }

  const courses = dbCourses.length > 0 ? dbCourses : FALLBACK_COURSES;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-900 via-[#0B3A6F] to-[#0E57A4] text-white pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background micro effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(241,103,38,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-5 pointer-events-none" />
        <BenzeneRing size={160} color="#F16726" className="absolute -top-10 -right-10 opacity-20 hidden md:block" />
        <MedicalCross size={34} color="#60A5FA" className="absolute top-1/2 left-8 opacity-25 hidden sm:block" />
        <PillCapsuleOrbs count={4} className="opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FB923C] text-xs font-mono font-semibold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIRECT STUDENT ADMISSIONS · 2026 INTAKE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200">Online Enrollment</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Submit your application details below. Our admissions desk verifies registrations promptly, provides banking clearance, and issues your secure student portal credentials.
          </p>

          {/* Quick trust metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-blue-100/80 font-mono">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Certificate Programmes
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-amber-300" />
              Confirmation within 24 Hours
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Lock className="w-4 h-4 text-blue-300" />
              Device-Bound Portal Security
            </span>
          </div>
        </div>
      </section>

      {/* Blister divider accent */}
      <BlisterDivider className="-mt-3 relative z-20" />

      {/* ── MAIN APPLICATION FORM SECTION ─────────────────────── */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="min-h-[480px] flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 p-12 text-slate-500">
                <div className="w-8 h-8 border-3 border-[#0E57A4] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">Loading enrollment application form...</p>
              </div>
            }
          >
            <EnrollmentApplicationClient courses={courses} />
          </Suspense>

          {/* Additional Guidance & Admissions Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E57A4] flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-display mb-1.5">Accredited Curricula</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Structured in compliance with national healthcare guidelines, pharmacology boards, and modern practical dispensing standards.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F16726] flex items-center justify-center mb-4">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-display mb-1.5">Direct WhatsApp Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated coordinators assist you with slip confirmation, timetable schedules, and lecturer Q&amp;A escalation anytime.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm font-display mb-1.5">Official Certification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upon passing module assessments, students receive QR-verifiable IMHS certification recognized by healthcare employers.
              </p>
            </div>
          </div>

          {/* Quick Inquiry link */}
          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500">
              Not ready to enroll yet and have general questions?{" "}
              <Link href="/contact" className="font-semibold text-[#0E57A4] hover:underline">
                Send a General Inquiry instead
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
