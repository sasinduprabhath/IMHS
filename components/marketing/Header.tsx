"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCourseInquiryWALink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faculty", label: "Faculty" },
  { href: "/courses", label: "Courses" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-chart-grid shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="IMHS Logo"
            width={160}
            height={50}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-all duration-200 relative group py-1",
                  isActive
                    ? "text-clinical-teal font-semibold"
                    : "text-ink hover:text-clinical-teal"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-chart-red transition-all duration-300 rounded-full",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact">
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-chart-red hover:bg-chart-red-hover text-white border-0 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              Inquire / Enroll
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold text-xs border-clinical-teal/40 text-clinical-teal hover:bg-clinical-teal hover:text-white transition-colors group bg-white shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-clinical-teal group-hover:text-white transition-colors" />
              Portal Login
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <motion.button
          className="md:hidden p-2 rounded text-ink hover:bg-linen transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-chart-grid overflow-hidden shadow-lg"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block py-3 px-4 text-sm font-medium rounded transition-colors",
                        isActive
                          ? "text-clinical-teal bg-clinical-teal/10 font-semibold"
                          : "text-ink hover:bg-linen"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="pt-3 border-t border-chart-grid flex gap-3">
                <Link
                  href="/contact"
                  className="flex-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button size="sm" className="w-full gap-1.5 bg-chart-red text-white border-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Inquire / Enroll
                  </Button>
                </Link>
                <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-1.5">
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
