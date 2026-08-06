'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { BlisterDivider } from '@/components/marketing/BlisterDivider';

interface CertificationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  colorClass: string;
  bgGlow: string;
  badgeText: string;
}

const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'guild',
    title: 'PHARMACEUTICAL GUILD',
    subtitle: 'Registered Guild Standards',
    icon: Award,
    colorClass: 'text-[#0E57A4] bg-blue-50 border-blue-200/60',
    bgGlow: 'hover:shadow-blue-500/10 hover:border-blue-400/50',
    badgeText: 'Verified Guild',
  },
  {
    id: 'cme',
    title: 'CONTINUING MED CREDITS',
    subtitle: 'SLMC-Aligned Modules',
    icon: GraduationCap,
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200/60',
    bgGlow: 'hover:shadow-purple-500/10 hover:border-purple-400/50',
    badgeText: 'CME Accredited',
  },
  {
    id: 'inst',
    title: 'INSTITUTIONAL CERT',
    subtitle: 'Official University Partner',
    icon: ShieldCheck,
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    bgGlow: 'hover:shadow-emerald-500/10 hover:border-emerald-400/50',
    badgeText: 'ISO Compliant',
  },
  {
    id: 'faculty',
    title: 'TERTIARY CARE FACULTY',
    subtitle: 'Senior Hospital Doctors',
    icon: CheckCircle2,
    colorClass: 'text-[#F16726] bg-orange-50 border-orange-200/60',
    bgGlow: 'hover:shadow-orange-500/10 hover:border-orange-400/50',
    badgeText: 'Top Faculty',
  },
];

export function TrustAccreditationStrip() {
  return (
    <section className="relative py-12 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 overflow-hidden border-y border-slate-200/60">
      <BlisterDivider className="mb-4" />
      {/* Background Micro Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#0E57A4_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Tag */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px w-12 bg-slate-200" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#F16726]" />
            RECOGNIZED STANDARDS &amp; CERTIFICATIONS
          </span>
          <div className="h-px w-12 bg-slate-200" />
        </div>

        {/* 4-Card Accreditation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CERTIFICATIONS.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm transition-all duration-300 ${item.bgGlow} flex items-center gap-3.5`}
              >
                {/* Icon Container */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 shrink-0 ${item.colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-extrabold tracking-wider text-slate-800 font-display truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] font-sans text-slate-500 font-medium truncate">
                    {item.subtitle}
                  </p>
                </div>

                {/* Subtle Hover Pulse Indicator */}
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0E57A4]" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustAccreditationStrip;
