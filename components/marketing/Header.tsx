"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, PhoneCall, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faculty", label: "Faculty" },
  { href: "/courses", label: "Courses" },
  { href: "/consultation", label: "Mentorship" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300 -mb-[68px]",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-md text-slate-900"
          : isHomePage
          ? "backdrop-blur-xl bg-slate-950/70 border-b border-white/10 shadow-lg text-white"
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Thin brand-gradient accent line at top */}
      <div className="h-[2px] bg-gradient-to-r from-[#0E57A4] via-[#F16726] to-[#0E57A4] absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Image
            src="/logo-transparent.png"
            alt="IMHS Logo"
            width={160}
            height={50}
            className="h-9 w-auto object-contain transition-all duration-300 group-hover:opacity-90"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  scrolled || !isHomePage
                    ? isActive
                      ? "text-[#0E57A4] bg-[#0E57A4]/10 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : isActive
                    ? "text-white bg-white/20 font-bold shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
                {/* Active / hover indicator */}
                <span
                  className={cn(
                    "absolute bottom-1 left-3 right-3 h-0.5 rounded-full transition-all duration-300",
                    isActive
                      ? scrolled || !isHomePage
                        ? "bg-[#0E57A4]"
                        : "bg-white"
                      : "bg-[#F16726] scale-x-0 group-hover:scale-x-100 origin-left"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link href="/enroll">
            <Button
              size="sm"
              className={cn(
                "gap-1.5 font-semibold text-xs rounded-xl h-9 px-4 text-white border-0 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95",
                scrolled || !isHomePage
                  ? "bg-gradient-to-r from-[#0E57A4] to-[#1A6FC4] hover:shadow-md hover:brightness-105"
                  : "bg-gradient-to-r from-[#F16726] to-[#E05315] hover:shadow-lg hover:shadow-orange-500/25 hover:brightness-110"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Enroll Now
            </Button>
          </Link>
          <Link href="/login">
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-1.5 font-semibold text-xs rounded-xl h-9 px-4 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer select-none",
                scrolled || !isHomePage
                  ? "bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0E57A4] border border-slate-200 hover:border-[#0E57A4]/40 shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 shadow-sm backdrop-blur-md"
              )}
            >
              <LogIn className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              Portal Login
            </button>
          </Link>
        </div>

        {/* Mobile hamburger - High Visibility Contrast Pill */}
        <motion.button
          className={cn(
            "lg:hidden p-2 rounded-xl border transition-all duration-200 shadow-sm flex items-center justify-center",
            scrolled || !isHomePage
              ? "bg-slate-100 border-slate-300 text-[#0A121E] hover:bg-slate-200 hover:text-[#0E57A4]"
              : "bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden bg-white/96 backdrop-blur-xl border-t border-[#E2E8F0] overflow-hidden shadow-float"
          >
            <div className="px-4 pt-3 pb-5 space-y-0.5">
              {navLinks.map((link, i) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center py-3 px-4 text-sm font-medium rounded-xl transition-all",
                        isActive
                          ? "text-clinical-teal bg-clinical-teal/8 font-semibold"
                          : "text-ink-muted hover:text-ink hover:bg-linen"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-clinical-teal" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="pt-4 border-t border-[#E2E8F0] flex gap-2.5 mt-2">
                <Link href="/enroll" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 h-10 text-white font-semibold text-sm rounded-xl bg-gradient-to-r from-[#0E57A4] to-[#1A6FC4] hover:brightness-105 active:scale-95 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enroll Now
                  </button>
                </Link>
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 h-10 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0E57A4] font-semibold text-sm rounded-xl active:scale-95 shadow-xs transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Portal Login
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
