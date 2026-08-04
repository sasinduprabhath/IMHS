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
          ? "bg-white/92 backdrop-blur-xl border-b border-[#E2E8F0] shadow-paper"
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Thin brand-gradient accent line at top */}
      <div className="h-[2px] bg-gradient-to-r from-clinical-teal via-chart-red to-clinical-teal-light absolute top-0 left-0 right-0" />

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
                  "relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "text-clinical-teal bg-clinical-teal/8 font-semibold"
                    : "text-ink-muted hover:text-ink hover:bg-linen"
                )}
              >
                {link.label}
                {/* Active / hover indicator */}
                <span
                  className={cn(
                    "absolute bottom-1 left-3.5 right-3.5 h-0.5 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-clinical-teal"
                      : "bg-chart-red scale-x-0 group-hover:scale-x-100 origin-left"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link href="/contact">
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs rounded-btn h-9 px-4 text-white border-0 shadow-sm btn-glow"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Enroll Now
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold text-xs border-[#E2E8F0] text-ink hover:border-clinical-teal/40 hover:bg-clinical-teal/5 hover:text-clinical-teal transition-all rounded-btn h-9 px-4 bg-white shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Portal Login
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <motion.button
          className="lg:hidden p-2.5 rounded-lg text-ink hover:bg-linen transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                <Link href="/contact" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 text-white border-0 font-semibold rounded-btn"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Enroll Now
                  </Button>
                </Link>
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 border-[#E2E8F0] text-ink rounded-btn font-semibold"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
