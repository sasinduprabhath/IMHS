"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AnimatedGrid, GlowOrb, RevealOnScroll } from "@/components/ui/animations";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { DNAHelix, BenzeneRing, MedicalCross, FloatingMolecules, AtomicOrbit, PulseRing } from "@/components/marketing/PharmacyAnimations";
import {
  PhoneCall, Mail, MapPin, Send, CheckCircle2,
  MessageSquare, Clock, Globe, AlertCircle
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  courseInterest: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const CONTACT_INFO = [
  { icon: MapPin, label: "Campus Address", value: "210/2/1, High Level Road, Maharagama, Sri Lanka" },
  { icon: Mail, label: "Email", value: "info.imhsedu@gmail.com" },
  { icon: PhoneCall, label: "WhatsApp Hotline", value: "+94 77 802 5050" },
  { icon: Clock, label: "Office Hours", value: "Mon-Sat · 8:00 AM - 6:00 PM" },
  { icon: Globe, label: "Website", value: "imhsedu.com" },
];

const COURSE_OPTIONS = [
  "Modern Pharmacy Course (SLMC Registration)",
  "Advanced Certificate in Pharmaceutical Manufacturing",
  "Foundation Course in Pharmaceutical Science & Healthcare",
  "Diploma in Healthcare & Medical Laboratory Technology",
  "Other / General Institutional Inquiry",
];

function InputField({
  label, required, error, children
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-mono text-ink font-medium">
        {label} {required && <span className="text-chart-red">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-chart-red font-mono flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const inputClass = "w-full px-4 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:ring-2 focus:ring-clinical-teal/15 focus:bg-white transition-all duration-200 font-sans placeholder:text-sage";

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { setSubmitted(true); reset(); }
      else alert("Failed to submit. Please try WhatsApp instead.");
    } catch {
      alert("An error occurred. Please contact us on WhatsApp directly.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="overflow-x-hidden bg-surface">

      {/* ── HERO (LIGHT MODE) ── */}
      <section className="relative bg-linen/40 border-b border-chart-grid overflow-hidden pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <AnimatedGrid className="text-chart-grid/40" />
        <GlowOrb color="#F16726" size={400} className="-top-20 -right-20 opacity-15" />
        {/* DNA Helix right side */}
        <DNAHelix width={60} height={280} className="absolute right-12 top-12 opacity-35 hidden lg:block" />
        {/* Benzene ring accent */}
        <BenzeneRing size={110} color="#4A8B7A" className="absolute -left-4 -bottom-4 opacity-20 hidden md:block" />
        {/* Floating molecules */}
        <FloatingMolecules count={6} className="opacity-40" />
        {/* Medical crosses */}
        <MedicalCross size={20} color="#F16726" className="absolute top-20 left-1/4 opacity-30" />
        <MedicalCross size={15} color="#0E57A4" className="absolute bottom-16 right-1/3 opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-block font-mono text-xs text-chart-red uppercase tracking-widest font-semibold border border-chart-red/30 px-4 py-1.5 rounded-full bg-white">
            ADMISSIONS & INQUIRIES
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-semibold text-ink leading-tight">
            Get in Touch with{" "}
            <span className="text-clinical-teal">
              IMHS
            </span>
          </h1>
          <p className="text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Have questions about SLMC pharmacy preparations, manufacturing courses, or course fees? Reach out via our administrative form or WhatsApp desk.
          </p>
        </div>
      </section>

      {/* ── FORM + CONTACT INFO ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Subtle atomic orbit in background */}
        <AtomicOrbit size={160} color="#0E57A4" className="absolute -right-8 top-12 opacity-10" />
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* Form */}
          <RevealOnScroll direction="left" className="lg:col-span-7">
            <div className="bg-surface border border-chart-grid rounded-card p-7 sm:p-9 shadow-paper space-y-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-ink">Administrative Inquiry Form</h2>
                <p className="text-xs text-ink-muted mt-1">We typically respond within 24 business hours.</p>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-clinical-teal/30 rounded-card overflow-hidden"
                  >
                    {/* Chart-readout header */}
                    <div className="bg-linen/60 border-b border-clinical-teal/20 px-6 py-3 flex items-center justify-between">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-sage font-bold">
                        Inquiry Received
                      </p>
                      <span className="text-[9px] font-mono text-sage">
                        REF #{Date.now().toString().slice(-6)}
                      </span>
                    </div>
                    {/* Status row */}
                    <div className="px-6 py-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-clinical-teal/10 border border-clinical-teal/20 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-clinical-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">Message received successfully</p>
                          <p className="text-xs text-ink-muted mt-0.5">We&apos;ll reach out on WhatsApp shortly</p>
                        </div>
                      </div>
                      <div className="border border-chart-grid rounded-xl divide-y divide-chart-grid/60">
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[10px] font-mono uppercase text-sage tracking-wider">Status</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-clinical-teal">
                            <span className="w-1.5 h-1.5 rounded-full bg-clinical-teal inline-block animate-pulse" />
                            PENDING REVIEW
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[10px] font-mono uppercase text-sage tracking-wider">Response Via</span>
                          <span className="text-[10px] font-mono font-bold text-ink">WhatsApp Desk</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-[10px] font-mono uppercase text-sage tracking-wider">Est. Response</span>
                          <span className="text-[10px] font-mono font-bold text-ink">&lt; 24 Business Hours</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-xs font-mono text-sage hover:text-ink underline underline-offset-2 transition-colors"
                      >
                        Send another message
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <InputField label="Full Name" required error={errors.name?.message}>
                      <input type="text" placeholder="Dr. / Mr. / Ms. Full Name" {...register("name")} className={inputClass} />
                    </InputField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Phone Number (WhatsApp)" required error={errors.phone?.message}>
                        <input type="text" placeholder="077 802 5050" {...register("phone")} className={inputClass} />
                      </InputField>
                      <InputField label="Email Address (Optional)" error={errors.email?.message}>
                        <input type="email" placeholder="student@example.com" {...register("email")} className={inputClass} />
                      </InputField>
                    </div>

                    <InputField label="Course of Interest">
                      <select {...register("courseInterest")} className={inputClass}>
                        <option value="">-- Select a program --</option>
                        {COURSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </InputField>

                    <InputField label="Inquiry Message" required error={errors.message?.message}>
                      <textarea rows={4} placeholder="Tell us about your inquiry..." {...register("message")} className={inputClass} />
                    </InputField>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" disabled={isSubmitting} className="w-full gap-2 font-semibold py-3 text-base bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0">
                        <Send className="w-4 h-4" />
                        {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry"}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </RevealOnScroll>

          {/* Contact info */}
          <RevealOnScroll direction="right" delay={0.2} className="lg:col-span-5 space-y-5">
            {/* WhatsApp CTA */}
            <div className="bg-clinical-teal-surface border border-clinical-teal/20 rounded-card p-7 space-y-5 shadow-paper">
              <div>
                <h2 className="text-lg font-display font-semibold text-ink">Direct WhatsApp Admissions</h2>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Prefer instant communication? Skip the form and chat directly with our coordinator to submit payment proof and get provisioned instantly.
                </p>
              </div>
              <Link href={createCourseInquiryWALink()} target="_blank" rel="noopener noreferrer" className="block">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="w-full gap-2.5 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold py-3 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Open WhatsApp Desk
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Contact details */}
            <div className="bg-surface border border-chart-grid rounded-card p-6 shadow-paper">
              <h3 className="text-sm font-mono font-semibold text-ink uppercase tracking-wider border-b border-chart-grid pb-3 mb-1">
                Campus &amp; Office
              </h3>
              <div className="divide-y divide-chart-grid/50">
                {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 bg-clinical-teal/10 rounded border border-clinical-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-clinical-teal" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono uppercase text-sage">{label}</span>
                      <span className="text-sm text-ink font-sans">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map embed */}
            <div className="bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.38!2d79.9245!3d6.8514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTEnMDUuMCJOIDc5wrA1NScyOC4yIkU!5e0!3m2!1sen!2slk!4v1"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="IMHS Campus Location"
              />
            </div>
          </RevealOnScroll>

        </div>
      </section>
    </div>
  );
}
