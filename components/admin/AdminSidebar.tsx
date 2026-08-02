"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Inbox,
  Eye,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  pendingInquiriesCount?: number;
  children: React.ReactNode;
}

export function AdminSidebar({ user, pendingInquiriesCount = 0, children }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [inquiryCount, setInquiryCount] = useState(pendingInquiriesCount);

  // Fetch pending inquiry count dynamically
  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/inquiries");
        if (res.ok) {
          const data = await res.json();
          const pending = data.filter((i: any) => i.status === "PENDING").length;
          setInquiryCount(pending);
        }
      } catch (err) {
        // silent fallback
      }
    }
    fetchPending();
  }, [pathname]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
      exact: false,
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: Users,
      exact: false,
    },
    {
      label: "Inquiries",
      href: "/admin/inquiries",
      icon: Inbox,
      exact: false,
      badge: inquiryCount > 0 ? inquiryCount : undefined,
    },
  ];

  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-linen flex font-sans">
      
      {/* ── DESKTOP SIDEBAR (FIXED LEFT) ── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-surface border-r border-chart-grid transition-all duration-300 shadow-sm ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-chart-grid">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-clinical-teal flex items-center justify-center shrink-0 shadow-sm">
              <Image src="/favicon.png" alt="IMHS" width={22} height={22} className="object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-ink text-sm tracking-tight">IMHS ADMIN</span>
                <span className="text-[10px] font-mono text-sage tracking-widest uppercase">Maharagama</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md border border-chart-grid hover:bg-linen flex items-center justify-center text-sage hover:text-ink transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isLinkActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-mono font-semibold transition-all group ${
                  active
                    ? "bg-clinical-teal/10 text-clinical-teal"
                    : "text-ink-muted hover:bg-linen hover:text-ink"
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Left 3px Accent Bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-chart-red rounded-r" />
                )}

                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-clinical-teal stroke-[2.5]" : "text-sage group-hover:text-ink"}`} />

                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold px-2 py-0.5 ${
                      collapsed ? "absolute top-1 right-1 px-1 py-0 text-[9px]" : ""
                    } bg-chart-red text-white shadow-xs`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Mini-Profile */}
        <div className="p-3 border-t border-chart-grid space-y-2 bg-linen/30">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-mono text-sage hover:text-clinical-teal hover:bg-linen transition-colors"
            title={collapsed ? "Preview Student Portal" : undefined}
          >
            <Eye className="w-4 h-4 shrink-0 text-clinical-teal" />
            {!collapsed && <span className="truncate">Preview Portal</span>}
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-ink truncate">{user?.name || "Admin"}</span>
                  <span className="text-[10px] font-mono text-sage truncate">System Admin</span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sage hover:text-chart-red p-1 rounded hover:bg-linen transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MOBILE OFF-CANVAS DRAWER (< 1024px) ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-surface h-full flex flex-col z-10 shadow-2xl border-r border-chart-grid">
            <div className="h-16 flex items-center justify-between px-4 border-b border-chart-grid">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-clinical-teal flex items-center justify-center text-white font-bold text-sm">
                  IMHS
                </div>
                <span className="font-display font-bold text-ink text-sm">ADMIN PANEL</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-sage hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const active = isLinkActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-xs font-mono font-semibold transition-all ${
                      active ? "bg-clinical-teal/10 text-clinical-teal border-l-4 border-chart-red" : "text-ink-muted hover:bg-linen"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="bg-chart-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-chart-grid space-y-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-xs font-mono text-clinical-teal font-bold"
              >
                <Eye className="w-4 h-4" /> Preview Student Portal
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full gap-2 text-xs text-chart-red border-chart-red/30"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA (BESIDE SIDEBAR) ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"}`}>
        
        {/* Slim Top Bar */}
        <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-chart-grid sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-ink hover:bg-linen rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Page Context */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-sage">Admin</span>
              <span className="text-chart-grid">/</span>
              <span className="text-ink font-bold uppercase tracking-wider">
                {pathname.split("/")[2] || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-4">
            <Link href="/admin/inquiries">
              <button className="relative p-2 text-sage hover:text-ink rounded-full hover:bg-linen transition-colors">
                <Bell className="w-4 h-4" />
                {inquiryCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-chart-red" />
                )}
              </button>
            </Link>

            <div className="flex items-center gap-2 border-l border-chart-grid pl-4">
              <div className="w-7 h-7 rounded-full bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <span className="text-xs font-semibold text-ink hidden sm:inline">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Body Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>

    </div>
  );
}
