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
  LogOut, ArrowLeft, Menu, X, ShieldCheck, MessageSquare, ExternalLink
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, exact: false },
];

export function AdminNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top clinical accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-[#0E57A4] via-[#F16726] to-[#0E57A4]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo + Admin Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="IMHS Admin" width={110} height={36} className="h-7 w-auto object-contain" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase bg-[#0E57A4] text-white px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-xs">
            <ShieldCheck className="w-3 h-3" /> Admin Console
          </span>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-lg transition-all duration-200 select-none",
                  active
                    ? "bg-[#0E57A4] text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-[#0E57A4] hover:bg-white/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden lg:block">
            <Button size="sm" variant="ghost" className="text-xs text-slate-500 hover:text-[#0E57A4] gap-1.5 font-mono h-9 rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5" /> Student Portal
            </Button>
          </Link>

          <Link href="/admin/students/new">
            <Button size="sm" className="gap-1.5 text-xs font-semibold bg-[#F16726] hover:bg-[#d95316] text-white border-0 shadow-xs h-9 px-3 rounded-xl">
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Student</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-400 hover:text-rose-600 p-2 h-9 w-9 rounded-xl transition-colors cursor-pointer"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </Button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-700 hover:text-[#0E57A4] p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-3 space-y-1.5">
              {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 text-xs font-mono py-2.5 px-3.5 rounded-xl transition-colors",
                    isActive(href, exact)
                      ? "bg-[#0E57A4] text-white font-bold shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-xs font-mono text-slate-500 hover:text-[#0E57A4] py-2 px-3.5 rounded-xl hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5" /> Switch to Student Portal
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
