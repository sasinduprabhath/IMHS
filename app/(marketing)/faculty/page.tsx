import React from "react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { RevealOnScroll, StaggerChildren, StaggerItem, HoverCard, AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { FacultyClientModal } from "@/components/marketing/FacultyClientModal";
import { Stethoscope, Users, Star, GraduationCap, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Faculty Directory - IMHS Senior Lecturers & Directors",
  description: "Meet the senior consultants, pharmacists, and healthcare directors teaching at IMHS.",
};

export const revalidate = 60;

export default async function FacultyPage() {
  let faculty: any[] = [];
  try {
    faculty = await prisma.facultyMember.findMany({ orderBy: { order: "asc" } });
  } catch (error) {
    console.error("Faculty page DB connection error (MySQL):", error);
  }

  return (
    <div className="overflow-x-hidden bg-surface">

      {/* ── HERO (LIGHT MODE) ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block font-mono text-xs text-chart-red uppercase tracking-widest font-semibold border border-chart-red/30 px-4 py-1.5 rounded-full bg-white">
            ACADEMIC FACULTY
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-ink leading-tight">
            Consultant-Led{" "}
            <span className="text-clinical-teal">
              Medical Faculty
            </span>
          </h1>
          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Learn directly from senior medical specialists who combine active hospital practice with dedicated clinical teaching.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <Users className="w-3.5 h-3.5 text-clinical-teal" />
              {faculty.length} Faculty Members
            </div>
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <Stethoscope className="w-3.5 h-3.5 text-clinical-teal" />
              100% Consultant-Led
            </div>
            <div className="flex items-center gap-2 bg-surface border border-chart-grid rounded-full px-4 py-1.5 text-ink text-xs font-mono shadow-paper">
              <ShieldCheck className="w-3.5 h-3.5 text-clinical-teal" />
              Verified Credentials
            </div>
          </div>
        </div>
      </section>

      {/* ── FACULTY GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <RevealOnScroll className="text-center space-y-2">
          <span className="font-mono text-xs text-chart-red uppercase tracking-wider font-semibold">SENIOR LECTURERS & DIRECTORS</span>
          <h2 className="text-3xl font-display font-semibold text-ink">Meet the Faculty</h2>
        </RevealOnScroll>

        <FacultyClientModal faculty={faculty} />
      </section>

    </div>
  );
}
