'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  PhoneCall, 
  FileCheck, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { createCourseInquiryWALink } from '@/lib/whatsapp';

interface EnrollmentStep {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
}

const ENROLLMENT_STEPS: EnrollmentStep[] = [
  {
    step: '01',
    title: 'Submit Application Online',
    description: 'Fill our official online enrollment form or message our admissions coordinator with your details.',
    icon: PhoneCall,
    badgeBg: 'bg-blue-600',
    badgeText: 'text-blue-600',
    iconBg: 'bg-blue-50 text-[#0E57A4] border-blue-200/80',
  },
  {
    step: '02',
    title: 'Submit Payment Proof',
    description: 'Send your bank deposit or transfer slip to the coordinator. Enrollment is confirmed within 24 hours.',
    icon: FileCheck,
    badgeBg: 'bg-[#F16726]',
    badgeText: 'text-[#F16726]',
    iconBg: 'bg-orange-50 text-[#F16726] border-orange-200/80',
  },
  {
    step: '03',
    title: 'Receive Portal Login',
    description: 'Your verified student credentials and 2FA settings are delivered directly to your WhatsApp.',
    icon: KeyRound,
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
  },
  {
    step: '04',
    title: 'Start Learning Instantly',
    description: 'Log into your dashboard from your registered device and access domain-locked video lectures.',
    icon: UserCheck,
    badgeBg: 'bg-purple-600',
    badgeText: 'text-purple-600',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
  },
];

export function EnrollmentProcessSection() {
  const whatsappUrl = createCourseInquiryWALink();

  return (
    <section id="enroll" className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white overflow-hidden border-t border-slate-200/60">
      {/* Background Micro Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#0E57A4_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#F16726] text-xs font-mono font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ENROLLMENT PROCESS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            How to Get Started in <span className="text-[#0E57A4]">4 Steps</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
            Quick, seamless registration designed to get you studying in our student portal immediately.
          </p>
        </div>

        {/* Steps Layout Container */}
        <div className="relative">
          
          {/* Desktop Connected Progress Beam (Visible lg and up) */}
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-orange-200 to-purple-200 -z-0" />

          {/* Grid Layout: 1 col mobile, 2 col tablet, 4 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {ENROLLMENT_STEPS.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group flex flex-col bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 z-10"
                >
                  {/* Step Header: Icon & Step Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs transition duration-300 group-hover:scale-110 ${item.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Step Number Tag */}
                    <span className={`text-2xl font-extrabold font-mono tracking-tight ${item.badgeText}`}>
                      {item.step}
                    </span>
                  </div>

                  {/* Step Content */}
                  <h3 className="text-base font-bold text-slate-900 font-display mb-2 group-hover:text-[#0E57A4] transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {item.description}
                  </p>

                  {/* Bottom Hover Glow Strip */}
                  <div className={`absolute bottom-0 left-6 right-6 h-1 rounded-t-full opacity-0 group-hover:opacity-100 transition duration-300 ${item.badgeBg}`} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Prominent Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 sm:mt-16">
          <Link
            href="/enroll"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0E57A4] to-[#1A6FC4] hover:from-[#0B4685] hover:to-[#0E57A4] text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition duration-300 group w-full sm:w-auto"
          >
            <Sparkles className="w-5 h-5 text-orange-300" />
            <span>Fill Online Enrollment Form</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F16726] to-orange-500 hover:from-orange-600 hover:to-[#F16726] text-white text-sm sm:text-base font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition duration-300 group w-full sm:w-auto"
          >
            <MessageSquare className="w-5 h-5 fill-white/20" />
            <span>Chat on WhatsApp Desk</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
          </a>
        </div>

      </div>
    </section>
  );
}

export default EnrollmentProcessSection;
