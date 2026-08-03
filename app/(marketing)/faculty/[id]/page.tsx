import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RevealOnScroll, AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
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
  Star
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let member = null;
  try {
    member = await prisma.facultyMember.findUnique({ where: { id } });
  } catch (e) {
    // Ignore DB error during build
  }
  return {
    title: member ? `${member.name} - IMHS Faculty` : "Faculty Profile - IMHS",
  };
}

export const revalidate = 60;

export default async function FacultyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let member = null;
  try {
    member = await prisma.facultyMember.findUnique({ where: { id } });
  } catch (e) {
    console.error("DB error fetching faculty detail:", e);
  }

  if (!member) {
    // Check if it's dr-isuru-wijesinghe slug or ID
    if (id.toLowerCase().includes("isuru")) {
      redirect("/dr-isuru-wijesinghe");
    }
    notFound();
  }

  if (member.name.toLowerCase().includes("isuru")) {
    redirect("/dr-isuru-wijesinghe");
  }

  return (
    <div className="overflow-x-hidden bg-surface">
      <section className="relative bg-linen/40 border-b border-chart-grid pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Faculty Directory
          </Link>

          <div className="bg-surface border border-chart-grid rounded-card p-6 sm:p-10 shadow-paper-stack flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-clinical-teal/30 shadow-2xl shrink-0">
              <Image
                src={member.photoUrl || "/isuru.png"}
                alt={member.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-mono text-xs text-chart-red uppercase tracking-widest font-bold bg-chart-red/10 border border-chart-red/20 px-3 py-1 rounded-full">
                  Academic Faculty
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-3 py-1 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified IMHS Senior Consultant
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink leading-tight">
                  {member.name}
                </h1>
                <p className="text-sm font-mono text-clinical-teal font-medium mt-1">
                  {member.title}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href={createCourseInquiryWALink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold text-xs">
                    <MessageCircle className="w-4 h-4 fill-current" />
                    Inquire Admissions via WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
          <div className="border-b border-chart-grid pb-4">
            <h2 className="text-xl font-display font-semibold text-ink flex items-center gap-2">
              <Award className="w-5 h-5 text-clinical-teal" /> Clinical Background & Bio
            </h2>
          </div>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-sans whitespace-pre-line">
            {member.bio}
          </p>
        </div>
      </section>
    </div>
  );
}
