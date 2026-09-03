import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, GlowOrb, RevealOnScroll, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { DoseCurve } from "@/components/marketing/DoseCurve";
import { MolecularGridBackground } from "@/components/marketing/MolecularGridBackground";
import { DNAHelix, AtomicOrbit, BenzeneRing, MedicalCross, PillCapsuleOrbs, FloatingMolecules } from "@/components/marketing/PharmacyAnimations";
import {
  ShieldCheck, Award, GraduationCap, Users, ArrowRight,
  CheckCircle2, Target, Microscope, HeartPulse, Star
} from "lucide-react";

export const metadata = {
  title: "About Us | Institute of Medicine and Health Sciences",
  description:
    "Learn about IMHS, established in 2019 - Sri Lanka's standard-setting pharmaceutical and clinical healthcare education institute led by Dr. Isuru Wijesinghe.",
  alternates: {
    canonical: "https://imhsedu.com/about",
  },
  openGraph: {
    title: "About IMHS | Leading Medical & Pharmacy Institute Sri Lanka",
    description:
      "Sri Lanka's premier healthcare and pharmacy practice academy. Empowering hundreds of certified pharmacists and medical practitioners.",
    url: "https://imhsedu.com/about",
    images: [{ url: "/gallery/imhs-campus.jpg", width: 1200, height: 630, alt: "About IMHS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | IMHS Education",
    description: "Sri Lanka's standard-setting pharmaceutical and clinical healthcare institute.",
    images: ["/gallery/imhs-campus.jpg"],
  },
};

const LEVELS = [
  {
    step: "01",
    label: "FOUNDATION",
    title: "Foundational Pharmacy Learning",
    body: "Build essential knowledge in basic sciences, pharmacology, pharmaceutics, and the safe use of medicines.",
    color: "clinical-teal",
  },
  {
    step: "02",
    label: "INTERMEDIATE",
    title: "Applied Pharmaceutical Knowledge",
    body: "Strengthen your knowledge through pharmaceutical calculations, dosage forms, pharmacology, and clinical practice.",
    color: "clinical-teal",
  },
  {
    step: "03",
    label: "EXAM PREPARATION",
    title: "Examination Preparation",
    body: "Master MCQ & SEQ answering strategies, mock viva coaching, and OSPE practical examination techniques.",
    color: "clinical-teal",
  },
  {
    step: "04",
    label: "PROFESSIONAL",
    title: "Advanced Professional Learning",
    body: "Personalized mentorship and clinical practice preparing pharmacists for top-tier healthcare leadership roles.",
    color: "chart-red",
  },
];

const VALUES = [
  {
    icon: Users,
    title: "LEARNER-CENTRED",
    body: "Supporting every learner through clear, structured, and accessible pharmacy education.",
  },
  {
    icon: Microscope,
    title: "EVIDENCE-BASED",
    body: "Developing educational content using reliable pharmaceutical knowledge and recognised academic sources.",
  },
  {
    icon: HeartPulse,
    title: "PRACTICE-ORIENTED",
    body: "Connecting theoretical knowledge with dispensing, medication safety, patient counselling, and professional pharmacy practice.",
  },
  {
    icon: ShieldCheck,
    title: "QUALITY & INTEGRITY",
    body: "Maintaining high standards in teaching, learning resources, assessment, and learner support.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section id="top" className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-24 -right-24 opacity-15" />
        {/* DNA Helix right side decoration */}
        <DNAHelix width={70} height={350} className="absolute right-8 top-8 opacity-40 hidden lg:block" />
        {/* Benzene ring left accent */}
        <BenzeneRing size={120} color="#4A8B7A" className="absolute -left-6 bottom-4 opacity-20" />
        {/* Floating molecules in background */}
        <FloatingMolecules count={6} className="opacity-50" />
        {/* Medical crosses */}
        <MedicalCross size={24} color="#F16726" className="absolute top-16 left-16 opacity-30" />
        <MedicalCross size={18} color="#0E57A4" className="absolute bottom-12 right-1/3 opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block font-mono text-xs text-chart-red uppercase tracking-widest font-semibold border border-chart-red/30 px-4 py-1.5 rounded-full bg-white">
            OUR STORY & MISSION
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-ink leading-tight">
            Facilitating Professional Healthcare Education{" "}
            <span className="text-clinical-teal">
              Since 2019
            </span>
          </h1>
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            IMHS was established with the aim of facilitating Professional Healthcare Education for healthcare sector professionals, medical students, and the general public across Sri Lanka.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {[
              { icon: Award, label: "3,500+ Alumni" },
              { icon: GraduationCap, label: "Established 2019" },
              { icon: ShieldCheck, label: "Certified Programs" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
                <Icon className="w-3.5 h-3.5 text-clinical-teal" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTOR SPOTLIGHT ── */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <RevealOnScroll direction="left" className="space-y-6">
            <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">
              INSTITUTIONAL MILESTONES
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink leading-tight">
              Empowering Over{" "}
              <span className="text-clinical-teal">3,500+ Successful</span>{" "}
              Healthcare Graduates
            </h2>
            <p className="text-base text-ink-muted leading-relaxed">
              Since our inception, over 3,500 students have successfully completed professional courses offered by IMHS. We focus on the all-round development of students from all backgrounds, empowering them to meet emerging societal needs, become globally competitive, and uphold social responsibility with strong values.
            </p>
            <div className="bg-clinical-teal/8 border border-clinical-teal/20 p-5 rounded-card space-y-2">
              <h4 className="font-mono font-bold text-clinical-teal uppercase text-xs">Institutional Vision</h4>
              <p className="text-sm text-ink leading-relaxed italic">
                &ldquo;IMHS aims to be a globally renowned healthcare education provider by delivering quality healthcare education and innovative research.&rdquo;
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, value: "3,500+", label: "Alumni Graduates" },
                { icon: CheckCircle2, value: "2019", label: "Year Founded" },
                { icon: GraduationCap, value: "4+", label: "Active Programs" },
                { icon: Users, value: "6", label: "Senior Faculty" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-surface border border-chart-grid rounded-card p-4 text-center space-y-1 hover:border-clinical-teal/30 transition-colors">
                  <Icon className="w-4 h-4 text-clinical-teal mx-auto" />
                  <div className="text-xl font-mono font-bold text-ink">{value}</div>
                  <div className="text-[10px] font-mono text-sage uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-clinical-teal/20 to-chart-red/10 rounded-2xl blur-2xl" />
              <div className="relative bg-surface border border-chart-grid p-4 rounded-card shadow-paper-stack space-y-3 overflow-hidden">
                {/* Molecular grid texture in corner */}
                <MolecularGridBackground className="opacity-60 rounded-card" />
                <div className="relative h-96 rounded overflow-hidden border border-chart-grid">
                  <Image
                    src="/lecturer.jpeg"
                    alt="Dr. Isuru Wijesinghe - Director, IMHS"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-ink/80 backdrop-blur-sm rounded-card p-3 border border-white/10">
                      <h3 className="text-sm font-semibold text-white">Dr. Isuru Wijesinghe</h3>
                      <p className="text-xs font-mono text-clinical-teal-light">Senior Lecturer / Director, IMHS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section id="values" className="relative bg-linen/50 py-20 overflow-hidden">
        {/* Atomic orbit accent corner */}
        <AtomicOrbit size={140} color="#4A8B7A" className="absolute -right-6 top-8 opacity-20" />
        <BenzeneRing size={100} color="#F16726" className="absolute -left-4 bottom-4 opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll className="text-center space-y-2">
            <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">OUR EDUCATIONAL VALUES</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">Our Core Values</h2>
          </RevealOnScroll>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title}>
                <div className="bg-surface border border-chart-grid rounded-card p-6 text-center space-y-3 hover:border-sage/40 hover:shadow-paper transition-all duration-300 h-full group">
                  {/* Capsule-style icon container with sage outline */}
                  <div className="inline-flex items-center gap-2 border border-sage/30 text-sage rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-wider mb-1 group-hover:border-sage/60 group-hover:bg-sage/5 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                    {title}
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed font-sans">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── LEARNING LEVELS ── */}
      <section id="pathways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <RevealOnScroll className="text-center space-y-2">
          <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">STRUCTURED LEARNING PATHWAYS</span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">Choose Your Learning Level</h2>
          <p className="text-base text-ink-muted max-w-xl mx-auto font-sans">Progress from essential pharmacy knowledge to examination preparation and advanced professional learning.</p>
        </RevealOnScroll>

        {/* Dose Curve timeline connecting the level sequence */}
        <RevealOnScroll className="hidden md:block px-8">
          <DoseCurve variant="timeline" steps={4} className="opacity-60" />
        </RevealOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {LEVELS.map(({ step, label, title, body, color }) => (
            <StaggerItem key={step}>
              <div className={`relative bg-surface border rounded-card p-6 space-y-3 h-full hover:shadow-lg transition-all duration-300 group overflow-hidden ${color === "chart-red" ? "border-chart-red/30 hover:border-chart-red/60" : "border-chart-grid hover:border-clinical-teal/40"}`}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5 font-mono font-bold text-6xl text-ink flex items-start justify-end pr-2 pt-1 select-none">
                  {step}
                </div>
                {/* Step number in sage - pharmacy-green accent */}
                <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${color === "chart-red"
                    ? "text-chart-red border-chart-red/30 bg-chart-red/5"
                    : "text-sage border-sage/30 bg-sage/5"
                  }`}>
                  {step} &middot; {label}
                </span>
                <h3 className="text-base font-semibold text-ink font-sans">{title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-clinical-teal-surface border-t border-clinical-teal/20 py-20 overflow-hidden">
        {/* Pill capsule orbs in CTA */}
        <PillCapsuleOrbs count={6} className="opacity-80" />
        <AnimatedGrid className="text-clinical-teal/10" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 space-y-6">
          <RevealOnScroll>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">
              Meet the Senior Lecturers & Directors of IMHS
            </h2>
            <p className="text-base text-ink-muted mt-4">Our faculty are practicing senior consultants with decades of clinical and academic experience.</p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <Link href="/faculty" className="inline-block mt-4">
              <Button className="gap-2 font-semibold px-8 py-3 text-base bg-chart-red hover:bg-chart-red-hover text-white border-0 shadow-md">
                <Users className="w-4 h-4" />
                View Faculty Directory
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
