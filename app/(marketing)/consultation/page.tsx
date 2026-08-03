import React from "react";
import Link from "next/link";
import { AnimatedGrid, GlowOrb } from "@/components/ui/animations";
import { DrIsuruBookingClient } from "@/components/marketing/DrIsuruBookingClient";
import { BookingStatusLookup } from "@/components/marketing/BookingStatusLookup";
import {
  Stethoscope,
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import { createCourseInquiryWALink } from "@/lib/whatsapp";

export const metadata = {
  title: "Book 1-on-1 Mentorship & Clinical Consultation - IMHS",
  description:
    "Schedule 1-on-1 academic mentorship, SLMC exam prep, clinical career consultation, or mock viva interview coaching with Dr. Isuru Wijesinghe at IMHS Sri Lanka.",
};

export default function ConsultationPage() {
  return (
    <div className="overflow-x-hidden bg-surface">
      {/* ── HERO SECTION ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#0E57A4" size={500} className="-top-20 -right-20 opacity-15" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> OFFICIAL FACULTY APPOINTMENTS
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-ink leading-tight">
            1-on-1 Mentorship &amp;{" "}
            <span className="text-clinical-teal">Clinical Consultation</span>
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            Schedule a personalized session with Senior Lecturer &amp; Executive Director <strong>Dr. Isuru Wijesinghe</strong> for SLMC exam strategy, hospital career guidance, or mock viva interview coaching.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#booking-form"
              className="inline-flex items-center gap-2 bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-mono font-bold px-6 py-3 rounded-full shadow-md transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Appointment Now
            </a>
            <a
              href="#check-status"
              className="inline-flex items-center gap-2 bg-white border border-chart-grid hover:border-clinical-teal text-ink text-xs font-mono font-semibold px-5 py-3 rounded-full shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-clinical-teal" /> Check Booking Status
            </a>
          </div>
        </div>
      </section>

      {/* ── MAIN BOOKING WIDGET SECTION ── */}
      <section id="booking-form" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <DrIsuruBookingClient />

        {/* ── BOOKING STATUS LOOKUP TOOL ── */}
        <div id="check-status" className="pt-10">
          <BookingStatusLookup />
        </div>
      </section>
    </div>
  );
}
