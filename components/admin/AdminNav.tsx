"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users, BookOpen, LayoutDashboard, UserPlus,
  LogOut, ArrowLeft, Menu, X, ShieldAlert
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
];

export function AdminNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="bg-white border-b border-chart-grid sticky top-0 z-40 shadow-sm">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-clinical-teal via-chart-red to-clinical-teal" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo + Badge */}
        <Link href="/admin" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="IMHS Admin" width={120} height={40} className="h-8 w-auto object-contain" />
          <span className="hidden sm:flex items-center gap-1 font-mono text-[10px] uppercase bg-chart-red text-white px-2.5 py-1 rounded font-bold tracking-wider">
            <ShieldAlert className="w-3 h-3" /> Admin Console
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded transition-all duration-200",
                  active
                    ? "bg-clinical-teal text-white font-semibold shadow-sm"
                    : "text-ink hover:text-clinical-teal hover:bg-linen"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden sm:block">
            <Button size="sm" variant="ghost" className="text-xs text-ink-muted hover:text-clinical-teal gap-1.5 font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Student Portal
            </Button>
          </Link>
          <Link href="/admin/students/new">
            <Button size="sm" className="gap-1.5 text-xs font-semibold bg-chart-red hover:bg-chart-red-hover text-white border-0 shadow-sm">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Student</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-ink-muted hover:text-chart-red p-2 transition-colors" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </Button>
          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-ink hover:text-clinical-teal p-1.5">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-chart-grid bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-mono py-2.5 px-3 rounded transition-colors",
                    isActive(href, exact)
                      ? "bg-clinical-teal text-white font-semibold"
                      : "text-ink hover:bg-linen"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
