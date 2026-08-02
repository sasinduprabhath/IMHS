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
} from "lucide-react";

const SIDEBAR_STORAGE_KEY = "imhs_student_sidebar_collapsed";

const NAV_LINKS = [
  { href: "/dashboard", label: "My Courses", icon: GraduationCap, exact: false,
    match: (p: string) => p.startsWith("/dashboard") && !p.startsWith("/dashboard/profile") },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle, exact: true,
    match: (p: string) => p === "/dashboard/profile" },
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

  // Mini profile values
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";
  const regId = user?.studentId || null;

  // WhatsApp general support link
  const supportWaLink = `https://wa.me/94776828490?text=${encodeURIComponent(
    "Hello, I need support with my IMHS Student Portal account."
  )}`;

  // ── Sidebar Inner Content (shared desktop + mobile) ──
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-chart-grid select-none",
        !isMobile && (collapsed ? "w-[72px]" : "w-[260px]"),
        "transition-all duration-300"
      )}
    >
      {/* Clinical accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-clinical-teal via-chart-red to-clinical-teal shrink-0" />

      {/* Mini Profile / Logo */}
      <div
        className={cn(
          "border-b border-chart-grid shrink-0 py-4",
          collapsed && !isMobile ? "flex flex-col items-center px-2 gap-2" : "px-4"
        )}
      >
        {/* Collapsed: show initials avatar only */}
        {collapsed && !isMobile ? (
          <Link href="/dashboard/profile" title="Profile">
            <div className="w-9 h-9 rounded-full bg-clinical-teal flex items-center justify-center font-mono font-bold text-white text-sm">
              {initials}
            </div>
          </Link>
        ) : (
          /* Expanded: mini profile card */
          <Link href="/dashboard/profile" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 rounded-full bg-clinical-teal flex items-center justify-center font-mono font-bold text-white text-sm shrink-0 group-hover:ring-2 group-hover:ring-clinical-teal/40 transition-all">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate leading-tight">{user?.name || "Student"}</p>
              {regId && (
                <span className="text-[9px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-1.5 py-0.5 rounded block w-fit mt-0.5 uppercase tracking-wider">
                  {regId}
                </span>
              )}
            </div>
            {/* IMHS logo small */}
            <Image
              src="/logo.png"
              alt="IMHS"
              width={50}
              height={16}
              className="h-4 w-auto object-contain opacity-50 shrink-0 hidden sm:block"
            />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {(!collapsed || isMobile) && (
          <p className="text-[9px] font-mono uppercase text-ink-muted/60 font-bold tracking-widest px-2 pt-1 pb-2">
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
                <span className="text-sm font-sans font-medium leading-none">{label}</span>
              )}
              {/* Active indicator dot when collapsed */}
              {active && collapsed && !isMobile && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-clinical-teal rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-chart-grid py-3 px-2 space-y-0.5 shrink-0",
          collapsed && !isMobile ? "flex flex-col items-center gap-1" : ""
        )}
      >
        {/* Admin Console — only for admin previewing student portal */}
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={() => isMobile && setMobileOpen(false)}
            title={collapsed && !isMobile ? "Admin Console" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg transition-colors font-semibold text-chart-red hover:bg-chart-red/8",
              collapsed && !isMobile
                ? "w-10 h-10 justify-center"
                : "px-3 py-2.5"
            )}
          >
            <ShieldAlert className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
            {(!collapsed || isMobile) && (
              <span className="text-sm font-sans">Admin Console</span>
            )}
          </Link>
        )}

        {/* WhatsApp Support */}
        <a
          href={supportWaLink}
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed && !isMobile ? "WhatsApp Support" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-colors text-ink-muted hover:text-clinical-teal hover:bg-linen/70",
            collapsed && !isMobile
              ? "w-10 h-10 justify-center"
              : "px-3 py-2.5"
          )}
        >
          <MessageCircle className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-sans">Support</span>
          )}
        </a>

        {/* Sign Out */}
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
          <LogOut className={cn("shrink-0", collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4")} />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-sans">Sign Out</span>
          )}
        </button>

        {/* Collapse toggle — desktop only */}
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

  // SSR placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
        <div className="hidden lg:block w-[260px] bg-white border-r border-chart-grid shrink-0" />
        <div className="lg:hidden h-14 bg-white border-b border-chart-grid fixed top-0 left-0 right-0 z-40" />
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-chart-grid h-14 flex items-center px-4 gap-3 shadow-xs">
        <div className="h-full w-0.5 absolute left-0 top-0 bg-gradient-to-b from-clinical-teal to-chart-red" />

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md text-ink hover:text-clinical-teal hover:bg-linen transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="IMHS" width={90} height={28} className="h-6 w-auto object-contain" />
        </Link>

        <span className="ml-auto font-mono text-[9px] uppercase bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/20 px-2 py-0.5 rounded font-bold tracking-wider">
          Student Portal
        </span>
      </div>

      {/* ── Mobile Overlay Drawer ── */}
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
              className="lg:hidden fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden shadow-2xl"
            >
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
