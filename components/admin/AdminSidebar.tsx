"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Users,
  BookOpen,
  LayoutDashboard,
  UserPlus,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Calendar,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, exact: false },
  { href: "/admin/bookings", label: "Consultations", icon: Calendar, exact: false },
];

const SIDEBAR_STORAGE_KEY = "imhs_admin_sidebar_collapsed";

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read collapse preference from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Sidebar content (shared between desktop & mobile)
  const SidebarContent = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-chart-grid select-none transition-all duration-300",
        !isMobile && (collapsed ? "w-[72px]" : "w-[260px]")
      )}
    >
      {/* Clinical accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-clinical-teal via-chart-red to-clinical-teal shrink-0" />

      {/* Logo + Admin Badge */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-4 border-b border-chart-grid shrink-0",
          collapsed && !isMobile ? "justify-center px-2" : ""
        )}
      >
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0 group">
          <Image
            src="/logo.png"
            alt="IMHS Admin"
            width={110}
            height={36}
            className={cn(
              "h-7 w-auto object-contain transition-all",
              collapsed && !isMobile ? "hidden" : "block"
            )}
          />
          {(collapsed && !isMobile) && (
            <div className="w-8 h-8 rounded-lg bg-clinical-teal flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </Link>

        {/* Admin badge - visible when expanded */}
        {(!collapsed || isMobile) && (
          <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase bg-chart-red text-white px-2 py-0.5 rounded font-bold tracking-wider shadow-xs shrink-0 ml-auto">
            <ShieldCheck className="w-2.5 h-2.5" />
            Admin
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {/* Section Label */}
        {(!collapsed || isMobile) && (
          <p className="text-[9px] font-mono uppercase text-ink-muted/60 font-bold tracking-widest px-2 pt-1 pb-2">
            Navigation
          </p>
        )}

        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg transition-all duration-150 group relative",
                collapsed && !isMobile
                  ? "justify-center w-10 h-10 mx-auto"
                  : "px-3 py-2.5",
                active
                  ? "bg-clinical-teal text-white font-semibold shadow-sm"
                  : "text-ink-muted hover:text-ink hover:bg-linen/70"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-all",
                  collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4",
                  active ? "text-white" : ""
                )}
              />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-sans font-medium leading-none">
                  {label}
                </span>
              )}

              {/* Active indicator dot when collapsed */}
              {active && collapsed && !isMobile && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-clinical-teal rounded-l-full" />
              )}
            </Link>
          );
        })}

        {/* Quick Actions - visible when expanded */}
        {(!collapsed || isMobile) && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-[9px] font-mono uppercase text-ink-muted/60 font-bold tracking-widest px-2 pb-2">
                Quick Actions
              </p>
              <Link
                href="/admin/students/new"
                onClick={() => isMobile && setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold text-chart-red hover:bg-chart-red/8 hover:text-chart-red transition-colors group"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                Add Student
              </Link>
              <Link
                href="/admin/courses/new"
                onClick={() => isMobile && setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-semibold text-clinical-teal hover:bg-clinical-teal/8 transition-colors group"
              >
                <Plus className="w-4 h-4 shrink-0" />
                New Course
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Footer - Student Portal + Sign Out */}
      <div
        className={cn(
          "border-t border-chart-grid py-3 px-2 space-y-0.5 shrink-0",
          collapsed && !isMobile ? "flex flex-col items-center gap-1" : ""
        )}
      >
        <Link
          href="/dashboard"
          title={collapsed && !isMobile ? "Student Portal" : undefined}
          onClick={() => isMobile && setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-colors text-ink-muted hover:text-clinical-teal hover:bg-linen/70",
            collapsed && !isMobile
              ? "w-10 h-10 justify-center"
              : "px-3 py-2.5"
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-sans">Student Portal</span>
          )}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed && !isMobile ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-colors text-ink-muted hover:text-chart-red hover:bg-chart-red/8 w-full",
            collapsed && !isMobile
              ? "justify-center w-10 h-10 mx-auto"
              : "px-3 py-2.5"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-sans">Sign Out</span>
          )}
        </button>

        {/* Collapse toggle - desktop only */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center gap-2 rounded-lg transition-colors text-ink-muted/60 hover:text-ink hover:bg-linen/70 mt-1",
              collapsed
                ? "justify-center w-10 h-10 mx-auto"
                : "px-3 py-2 w-full"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="text-xs font-mono">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (!mounted) {
    // Render a placeholder to avoid hydration mismatch
    return (
      <>
        {/* Desktop placeholder */}
        <div className="hidden lg:block w-[260px] bg-white border-r border-chart-grid shrink-0" />
        {/* Mobile top bar placeholder */}
        <div className="lg:hidden h-14 bg-white border-b border-chart-grid fixed top-0 left-0 right-0 z-40" />
      </>
    );
  }

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <div
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </div>

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-chart-grid h-14 flex items-center px-4 gap-3 shadow-xs">
        <div className="h-full w-0.5 absolute left-0 top-0 bg-gradient-to-b from-clinical-teal to-chart-red" />

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md text-ink hover:text-clinical-teal hover:bg-linen transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.png" alt="IMHS" width={90} height={28} className="h-6 w-auto object-contain" />
        </Link>

        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase bg-chart-red text-white px-2 py-0.5 rounded font-bold tracking-wider">
          <ShieldCheck className="w-2.5 h-2.5" />
          Admin
        </span>

        <Link href="/admin/students/new" className="ml-1">
          <div className="p-2 rounded-md bg-chart-red text-white hover:bg-chart-red/90 transition-colors">
            <UserPlus className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* ── Mobile Overlay Drawer ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-linen transition-colors"
                aria-label="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>

              <SidebarContent isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
