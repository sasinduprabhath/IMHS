import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PhoneCall, Mail, MapPin, MessageSquare, ExternalLink, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden text-white pt-16 pb-8"
      style={{
        background: "linear-gradient(180deg, #071120 0%, #0A1628 60%, #0C1A30 100%)",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {/* Mesh gradient overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(14,87,164,.10) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 100% 100%, rgba(241,103,38,.07) 0%, transparent 50%)"
        }} />
      {/* 3px top brand accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Column 1: Brand */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/footer-logo.png"
                alt="IMHS Institute Footer Logo"
                height={48}
                className="h-12 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-white/45 text-xs leading-relaxed font-sans max-w-xs">
              IMHS (Institute of Medicine &amp; Health Sciences) — established 2019, Maharagama, Sri Lanka.
              Facilitating professional healthcare education with 3,500+ successful graduates.
            </p>
            {/* Divider dot line */}
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-[2px] rounded-full bg-[#0E57A4]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#F16726]" />
              <div className="flex-1 h-[1px] bg-white/8 rounded-full" />
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Institute" },
                { href: "/faculty", label: "Faculty & Mentors" },
                { href: "/courses", label: "Course Catalog" },
                { href: "/consultation", label: "1-on-1 Mentorship" },
                { href: "/gallery", label: "Campus Gallery" },
                { href: "/contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-[1px] bg-[#60A5FA] transition-all duration-200 rounded-full" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold mb-5">
              Clinical Administration
            </h4>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F16726]/15 border border-[#F16726]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FB923C]" />
                </div>
                <span className="text-white/50 leading-relaxed">210/2/1, High Level Road,<br />Maharagama, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0E57A4]/15 border border-[#0E57A4]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#60A5FA]" />
                </div>
                <span className="text-white/50">info.imhsedu@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-white/50">077 802 5050 (WhatsApp Admin)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Admissions CTA */}
          <div className="space-y-4">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/40 font-bold mb-5">
              Admissions Desk
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
              <p className="text-white/50 text-xs leading-relaxed">
                Admissions are conducted via direct administrative inquiry. Contact our desk to submit application details and receive your portal login.
              </p>
              <Link href="/contact" className="block">
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #F16726 0%, #D95316 100%)", boxShadow: "0 4px 12px rgba(241,103,38,.25)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  Contact Admissions
                </button>
              </Link>
              <Link href="/login" className="block">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/12 hover:border-white/25 transition-all duration-200">
                  Student Portal Login
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30 font-mono">
          <p>© {new Date().getFullYear()} Institute of Medicine and Health Sciences (IMHS). All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Terms of Enrollment</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
