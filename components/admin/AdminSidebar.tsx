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
  FileCheck,
  FlaskConical,
  Film,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/chat", label: "Student Chat", icon: MessageSquare, exact: false },
  { href: "/admin/students", label: "Students", icon: Users, exact: false },
  { href: "/admin/courses", label: "Courses", icon: BookOpen, exact: false },
  { href: "/admin/media", label: "Media & Gallery", icon: Film, exact: false },
  { href: "/admin/learning-hub", label: "Learning Hub CMS", icon: FlaskConical, exact: false },
  { href: "/admin/assignments", label: "Assignments", icon: FileCheck, exact: false },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, exact: false },
  { href: "/admin/bookings", label: "Consultations", icon: Calendar, exact: false },
];

const SIDEBAR_STORAGE_KEY = "imhs_admin_sidebar_collapsed";

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState<{
    unresolvedInquiriesCount: number;
    pendingBookingsCount: number;
    pendingAssignmentsCount: number;
    unreadChatCount: number;
  }>({
    unresolvedInquiriesCount: 0,
    pendingBookingsCount: 0,
    pendingAssignmentsCount: 0,
    unreadChatCount: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/notifications/counts");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (e) { }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 20000);
    return () => clearInterval(interval);
  }, []);

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

  const adminInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={cn(
        "flex flex-col h-full select-none overflow-hidden",
        "bg-gradient-to-b from-[#0C1A30] to-[#0A1628]",
        !isMobile && (collapsed ? "w-[72px]" : "w-[260px]"),
        "transition-all duration-300"
      )}
      style={{ boxShadow: "4px 0 24px rgba(0,0,0,.30)" }}
    >
      {/* Brand accent gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#F16726] via-[#0E57A4] to-[#F16726] shrink-0" />

      {/* Header - Logo + Admin Badge */}
      <div
        className={cn(
          "flex items-center gap-3 py-4 border-b border-white/8 shrink-0",
          collapsed && !isMobile ? "justify-center px-2" : "px-4"
        )}
      >
        {collapsed && !isMobile ? (
          <Link href="/admin" title="Admin Dashboard">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F16726] to-[#D95316] flex items-center justify-center shadow-glow-orange">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </Link>
        ) : (
          <>
            <Link href="/admin" className="flex items-center gap-2.5 min-w-0 group flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/footer-logo.png"
                alt="IMHS Admin"
                className="h-7 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase bg-[#F16726] text-white px-2 py-0.5 rounded-pill font-bold tracking-wider shadow-xs shrink-0">
              <ShieldCheck className="w-2.5 h-2.5" />
              Admin
            </span>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {(!collapsed || isMobile) && (
          <p className="text-[9px] font-mono uppercase text-white/25 font-bold tracking-widest px-2 pt-1 pb-2">
            Navigation
          </p>
        )}

        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);

          let badgeCount = 0;
          if (href === "/admin/chat") badgeCount = counts.unreadChatCount;
          else if (href === "/admin/assignments") badgeCount = counts.pendingAssignmentsCount;
          else if (href === "/admin/inquiries") badgeCount = counts.unresolvedInquiriesCount;
          else if (href === "/admin/bookings") badgeCount = counts.pendingBookingsCount;

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
                  ? "bg-[#0E57A4]/30 text-white font-semibold border border-[#0E57A4]/40"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              )}
              style={active ? { boxShadow: "0 2px 8px rgba(14,87,164,.25)" } : undefined}
            >
              <div className="relative shrink-0">
                <Icon
                  className={cn(
                    "transition-all",
                    collapsed && !isMobile ? "w-5 h-5" : "w-4 h-4",
                    active ? "text-[#60A5FA]" : "text-white/55 group-hover:text-white"
                  )}
                />
                {/* Collapsed badge dot */}
                {collapsed && !isMobile && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F16726] ring-2 ring-[#0A1628] animate-pulse" />
                )}
              </div>

              {(!collapsed || isMobile) && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="text-sm font-sans font-medium leading-normal py-0.5 truncate">{label}</span>
                  {badgeCount > 0 && (
                    <span
                      className={cn(
                        "ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-pill shadow-xs shrink-0 animate-pulse",
                        active
                          ? "bg-white/20 text-white"
                          : href === "/admin/bookings"
                            ? "bg-[#F16726]/20 text-[#FB923C] border border-[#F16726]/30"
                            : "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/20"
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>
              )}

              {/* Active bar indicator (collapsed) */}
              {active && collapsed && !isMobile && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#60A5FA] rounded-l-full" />
              )}
            </Link>
          );
        })}

        {/* Quick Actions */}
        {(!collapsed || isMobile) && (
          <div className="pt-4 pb-1">
            <p className="text-[9px] font-mono uppercase text-white/25 font-bold tracking-widest px-2 pb-2">
              Quick Actions
            </p>
            <Link
              href="/admin/students/new"
              onClick={() => isMobile && setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-semibold text-[#FB923C] hover:bg-[#F16726]/10 hover:text-[#FB923C] transition-all group"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              Add Student
            </Link>
            <Link
              href="/admin/courses/new"
              onClick={() => isMobile && setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-semibold text-[#60A5FA] hover:bg-[#0E57A4]/10 transition-all group"
            >
              <Plus className="w-4 h-4 shrink-0" />
              New Course
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-white/8 py-3 px-2 space-y-0.5 shrink-0",
          collapsed && !isMobile ? "flex flex-col items-center gap-1" : ""
        )}
      >
        <Link
          href="/dashboard"
          title={collapsed && !isMobile ? "Student Portal" : undefined}
          onClick={() => isMobile && setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all text-white/45 hover:text-white hover:bg-white/8",
            collapsed && !isMobile ? "w-10 h-10 justify-center" : "px-3 py-2.5"
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm font-sans">Student Portal</span>}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed && !isMobile ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all text-white/45 hover:text-[#F87171] hover:bg-[#F87171]/8 w-full",
            collapsed && !isMobile ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm font-sans">Sign Out</span>}
        </button>

        {/* Collapse toggle */}
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
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Top Bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 gap-3"
        style={{ background: "#0A1628", borderBottom: "1px solid rgba(255,255,255,.08)", boxShadow: "0 2px 12px rgba(0,0,0,.4)" }}
      >
        <div className="h-full w-[3px] absolute left-0 top-0 bg-gradient-to-b from-[#F16726] to-[#0E57A4]" />

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/footer-logo.png" alt="IMHS" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
        </Link>

        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase bg-[#F16726] text-white px-2 py-0.5 rounded font-bold tracking-wider">
          <ShieldCheck className="w-2.5 h-2.5" />
          Admin
        </span>

        <Link href="/admin/students/new" className="ml-1">
          <div className="p-2 rounded-lg bg-[#F16726] text-white hover:bg-[#D95316] transition-colors">
            <UserPlus className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Mobile Overlay Drawer */}
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
