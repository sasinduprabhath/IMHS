"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BookOpen,
  LayoutDashboard,
  FlaskConical,
} from "lucide-react";

const SIDEBAR_STORAGE_KEY = "imhs_student_sidebar_collapsed";

const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "My Courses",
    icon: GraduationCap,
    exact: false,
    match: (p: string) => p.startsWith("/dashboard") && !p.startsWith("/dashboard/profile") && !p.startsWith("/dashboard/practice"),
  },
  {
    href: "/dashboard/practice",
    label: "Practice Hub",
    icon: FlaskConical,
    exact: false,
    match: (p: string) => p.startsWith("/dashboard/practice"),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: UserCircle,
    exact: true,
    match: (p: string) => p === "/dashboard/profile",
  },
];

export function StudentSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";
  const regId = user?.studentId || null;

  const supportWaLink = `https://wa.me/94776828490?text=${encodeURIComponent(
    "Hello, I need support with my IMHS Student Portal account."
  )}`;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        "flex flex-col h-full select-none overflow-hidden",
        "bg-gradient-to-b from-[#0C1A30] to-[#0A1628]",
        !isMobile && (collapsed ? "w-[72px]" : "w-[260px]"),
        "transition-all duration-300"
      )}
      style={{ boxShadow: "4px 0 24px rgba(0,0,0,.25)" }}
    >
      {/* Brand accent gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#0E57A4] via-[#2172C9] to-[#F16726] shrink-0" />

      {/* Header / Profile */}
      <div
        className={cn(
          "border-b border-white/8 shrink-0 py-4",
          collapsed && !isMobile ? "flex flex-col items-center px-2 gap-2" : "px-4"
        )}
      >
        {collapsed && !isMobile ? (
          <Link href="/dashboard/profile" title="My Profile">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0E57A4] to-[#2172C9] flex items-center justify-center font-display font-bold text-white text-sm ring-2 ring-white/10 hover:ring-[#0E57A4]/60 transition-all overflow-hidden">
              <img src={user?.image || "/student-avatar.png"} alt={user?.name || "Student"} className="w-full h-full object-cover" />
            </div>
          </Link>
        ) : (
          <Link href="/dashboard/profile" className="flex items-center gap-3 group min-w-0">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0E57A4] to-[#2172C9] flex items-center justify-center font-display font-bold text-white text-sm shadow-glow overflow-hidden">
                <img src={user?.image || "/student-avatar.png"} alt={user?.name || "Student"} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0A1628] rounded-full z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name || "Student"}</p>
              {regId ? (
                <span className="text-[9px] font-mono font-bold text-[#60A5FA] bg-[#0E57A4]/20 border border-[#0E57A4]/30 px-1.5 py-0.5 rounded block w-fit mt-0.5 uppercase tracking-wider">
                  {regId}
                </span>
              ) : (
                <span className="text-[10px] text-white/40 font-medium">Student Portal</span>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {(!collapsed || isMobile) && (
          <p className="text-[9px] font-mono uppercase text-white/25 font-bold tracking-widest px-2 pt-1 pb-2">
            Navigation
          </p>
        )}

        {NAV_LINKS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => isMobile && setMobileOpen(false)}
              title={collapsed && !isMobile ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                collapsed && !isMobile
                  ? "justify-center w-10 h-10 mx-auto"
                  : "px-3 py-2.5",
                active
                  ? "bg-[#0E57A4]/30 text-white font-semibold border border-[#0E57A4]/40 shadow-nav-active"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-all",
                  collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4",
                  active ? "text-[#60A5FA]" : "text-white/55 group-hover:text-white"
                )}
              />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-sans font-medium leading-normal py-0.5">{label}</span>
              )}
              {/* Active indicator bar */}
              {active && collapsed && !isMobile && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#60A5FA] rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div
        className={cn(
          "border-t border-white/8 py-3 px-2 space-y-0.5 shrink-0",
          collapsed && !isMobile ? "flex flex-col items-center gap-1" : ""
        )}
      >
        {/* Admin Console link (only for admins previewing) */}
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={() => isMobile && setMobileOpen(false)}
            title={collapsed && !isMobile ? "Admin Console" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl transition-all font-semibold text-[#F87171] hover:bg-[#F87171]/10",
              collapsed && !isMobile ? "w-10 h-10 justify-center" : "px-3 py-2.5"
            )}
          >
            <ShieldAlert className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
            {(!collapsed || isMobile) && <span className="text-sm font-sans">Admin Console</span>}
          </Link>
        )}

        {/* WhatsApp Support */}
        <a
          id="tour-whatsapp-support"
          href={supportWaLink}
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed && !isMobile ? "WhatsApp Support" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all text-white/45 hover:text-white hover:bg-white/8",
            collapsed && !isMobile ? "w-10 h-10 justify-center" : "px-3 py-2.5"
          )}
        >
          <MessageCircle className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
          {(!collapsed || isMobile) && <span className="text-sm font-sans">Support</span>}
        </a>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed && !isMobile ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all text-white/45 hover:text-[#F87171] hover:bg-[#F87171]/8 w-full",
            collapsed && !isMobile ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"
          )}
        >
          <LogOut className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
          {(!collapsed || isMobile) && <span className="text-sm font-sans">Sign Out</span>}
        </button>

        {/* Collapse toggle (desktop) */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center gap-2 rounded-xl transition-all text-white/25 hover:text-white/60 hover:bg-white/6 mt-1",
              collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2 w-full"
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

  // SSR placeholder - prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <div className="hidden lg:block w-[260px] bg-[#0A1628] shrink-0" />
        <div className="lg:hidden h-14 bg-[#0A1628] border-b border-white/8 fixed top-0 left-0 right-0 z-40" />
      </>
    );
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </div>

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A1628] border-b border-white/8 h-14 flex items-center px-4 gap-3"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
        <div className="h-full w-[3px] absolute left-0 top-0 bg-gradient-to-b from-[#0E57A4] to-[#F16726]" />

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/footer-logo.png" alt="IMHS" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
        </Link>

        <span className="ml-auto font-mono text-[9px] uppercase bg-[#0E57A4]/25 text-[#60A5FA] border border-[#0E57A4]/30 px-2 py-0.5 rounded font-bold tracking-wider">
          Student Portal
        </span>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-3 z-10 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
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
