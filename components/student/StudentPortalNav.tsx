"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, User, LogOut, ShieldAlert, Menu, X, ChevronDown } from "lucide-react";

export function StudentPortalNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "My Courses", icon: BookOpen, exact: false,
      active: pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/profile") },
    { href: "/dashboard/profile", label: "Profile", icon: User, exact: true,
      active: pathname === "/dashboard/profile" },
  ];

  return (
    <header className="bg-surface border-b border-chart-grid sticky top-0 z-40 shadow-sm">
      {/* Thin accent */}
      <div className="h-0.5 bg-gradient-to-r from-clinical-teal via-chart-red/50 to-clinical-teal" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/logo.png" alt="IMHS Portal" width={130} height={40} className="h-9 w-auto object-contain" />
          <span className="hidden sm:block font-mono text-[10px] uppercase bg-clinical-teal/10 text-clinical-teal px-2.5 py-1 rounded border border-clinical-teal/20 font-bold tracking-wider">
            Student Portal
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon, active }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded transition-all duration-200",
                active
                  ? "bg-clinical-teal text-white font-semibold shadow-sm"
                  : "text-ink hover:text-clinical-teal hover:bg-clinical-teal/8"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link href="/admin"
              className="flex items-center gap-1.5 text-xs font-mono bg-chart-red text-white px-3.5 py-2 rounded font-semibold hover:bg-chart-red-hover transition-colors">
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Console
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {/* User dropdown button */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-linen transition-colors"
            >
              <div className="w-7 h-7 bg-clinical-teal/15 border border-clinical-teal/25 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-clinical-teal">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-right hidden md:block">
                <span className="block text-xs font-semibold text-ink leading-tight">{user.name}</span>
                <span className="block text-[10px] font-mono text-sage leading-tight">{user.email}</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-sage transition-transform", userMenuOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-surface border border-chart-grid rounded-card shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-chart-grid bg-linen/50">
                    <p className="text-xs font-semibold text-ink truncate">{user.name}</p>
                    <p className="text-[10px] font-mono text-sage truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 text-xs text-ink hover:bg-linen rounded px-3 py-2 transition-colors">
                      <User className="w-3.5 h-3.5 text-sage" /> Profile & Password
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2 text-xs text-chart-red hover:bg-chart-red/5 rounded px-3 py-2 transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile sign out */}
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}
            className="sm:hidden gap-1.5 text-xs text-ink-muted hover:text-chart-red">
            <LogOut className="w-3.5 h-3.5" />
          </Button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-ink-muted hover:text-ink p-1.5 transition-colors">
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
            className="md:hidden border-t border-chart-grid bg-surface overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon, active }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-mono py-2.5 px-3 rounded transition-colors",
                    active ? "bg-clinical-teal text-white font-semibold" : "text-ink hover:bg-linen"
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
              {user.role === "ADMIN" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-mono py-2.5 px-3 rounded bg-chart-red text-white font-semibold">
                  <ShieldAlert className="w-4 h-4" /> Admin Console
                </Link>
              )}
              <div className="pt-2 border-t border-chart-grid">
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-ink">{user.name}</p>
                  <p className="text-[10px] font-mono text-sage">{user.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
