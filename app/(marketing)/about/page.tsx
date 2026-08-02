import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, GlowOrb, RevealOnScroll, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import {
  ShieldCheck, Award, GraduationCap, Users, ArrowRight,
  CheckCircle2, Target, Microscope, HeartPulse, Star
} from "lucide-react";

export const metadata = {
  title: "About IMHS — Institute of Medicine and Health Sciences",
  description: "Learn about IMHS, established in 2019 — Sri Lanka's standard-setting pharmaceutical and clinical healthcare education institute.",
};

const LEVELS = [
  {
    step: "01",
    label: "BEGINNER",
    title: "Foundational Learning",
    body: "Build essential healthcare tools and core resources for health science fundamentals.",
    color: "clinical-teal",
  },
  {
    step: "02",
    label: "INTERMEDIATE",
    title: "Applied Science",
    body: "Enhance knowledge with specialized training in key pharmaceutical and pathology areas.",
    color: "clinical-teal",
  },
  {
    step: "03",
    label: "ADVANCED",
    title: "Specialized Practice",
    body: "Engage in advanced industrial manufacturing and laboratory clinical skills led by experts.",
    color: "clinical-teal",
  },
  {
    step: "04",
    label: "MASTERY",
    title: "Professional Leadership",
    body: "Personalized mentorship preparing clinicians and pharmacists for top-tier healthcare roles.",
    color: "chart-red",
  },
];

const VALUES = [
  { icon: Target, title: "Mission-Driven", body: "Aim to be a globally renowned healthcare education provider." },
  { icon: Microscope, title: "Evidence-Based", body: "All curricula built on peer-reviewed clinical and pharmaceutical sciences." },
  { icon: HeartPulse, title: "Patient-Centred", body: "Training rooted in bedside practice and real hospital scenarios." },
  { icon: Star, title: "Excellence First", body: "3,500+ graduates achieving regulatory and clinical career milestones." },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-24 -right-24 opacity-15" />
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
              { icon: GraduationCap, label: "Est. Maharagama, 2019" },
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
              <div className="relative bg-surface border border-chart-grid p-4 rounded-card shadow-paper-stack space-y-3">
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
      <section className="bg-linen/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll className="text-center space-y-2">
            <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">INSTITUTIONAL PILLARS</span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">Our Core Values</h2>
          </RevealOnScroll>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title}>
                <div className="bg-surface border border-chart-grid rounded-card p-6 text-center space-y-3 hover:border-clinical-teal/40 hover:shadow-paper transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-clinical-teal/10 rounded border border-clinical-teal/20 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6 text-clinical-teal" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink font-sans">{title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── LEARNING LEVELS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <RevealOnScroll className="text-center space-y-2">
          <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">STRUCTURED CURRICULUM PATHWAYS</span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-ink">Choose Your Learning Level</h2>
          <p className="text-base text-ink-muted max-w-xl mx-auto">From foundational pharmacy science to advanced industrial manufacturing — a pathway for every healthcare professional.</p>
        </RevealOnScroll>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {LEVELS.map(({ step, label, title, body, color }) => (
            <StaggerItem key={step}>
              <div className={`relative bg-surface border rounded-card p-6 space-y-3 h-full hover:shadow-lg transition-all duration-300 group overflow-hidden ${color === "chart-red" ? "border-chart-red/30 hover:border-chart-red/60" : "border-chart-grid hover:border-clinical-teal/40"}`}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5 font-mono font-bold text-6xl text-ink flex items-start justify-end pr-2 pt-1 select-none">
                  {step}
                </div>
                <span className={`font-mono text-xs font-bold ${color === "chart-red" ? "text-chart-red" : "text-clinical-teal"}`}>
                  {step} / {label}
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
