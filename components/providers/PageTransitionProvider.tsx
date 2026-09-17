"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Header for seamless top navbar display during transitions
import { Header } from "@/components/marketing/Header";

// Skeleton components
import HomepageLoading from "@/app/loading";
import ContactLoading from "@/app/(marketing)/contact/loading";
import AboutLoading from "@/app/(marketing)/about/loading";
import StudentDashboardLoading from "@/app/dashboard/loading";
import CoursePlayerLoading from "@/app/dashboard/courses/[slug]/loading";
import CoursesCatalogLoading from "@/app/(marketing)/courses/loading";
import CourseDetailLoading from "@/app/(marketing)/courses/[slug]/loading";
import FacultyLoading from "@/app/(marketing)/faculty/loading";
import DrIsuruProfileLoading from "@/app/(marketing)/dr-isuru-wijesinghe/loading";
import AdminDashboardLoading from "@/app/admin/loading";

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isMarketingRoute =
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/verify-otp");

  useEffect(() => {
    // Show accurate skeleton loading animation for exactly 0.5s on initial mount and route change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const renderSkeletonForPath = (path: string) => {
    if (path.startsWith("/login") || path.startsWith("/verify-otp")) {
      return (
        <div className="min-h-screen bg-[#070E18] flex items-center justify-center p-4 animate-pulse">
          <div className="w-full max-w-md h-96 bg-white/5 rounded-3xl border border-white/10" />
        </div>
      );
    }
    if (path.startsWith("/dashboard/courses/")) {
      return <CoursePlayerLoading />;
    }
    if (path === "/dashboard") {
      return (
        <div className="min-h-screen bg-linen">
          <StudentDashboardLoading />
        </div>
      );
    }
    if (path === "/contact") {
      return <ContactLoading />;
    }
    if (path === "/about") {
      return <AboutLoading />;
    }
    if (path === "/courses") {
      return <CoursesCatalogLoading />;
    }
    if (path.startsWith("/courses/")) {
      return <CourseDetailLoading />;
    }
    if (path === "/faculty") {
      return <FacultyLoading />;
    }
    if (path === "/dr-isuru-wijesinghe") {
      return <DrIsuruProfileLoading />;
    }
    if (path.startsWith("/admin")) {
      return <AdminDashboardLoading />;
    }
    return <HomepageLoading />;
  };

  return (
    <div className="min-h-screen flex flex-col w-full relative">
      {/* 1. Persistent Top Navbar for Marketing Routes (Always static, never fades/blinks) */}
      {isMarketingRoute && <Header />}

      {/* 2. Content Transition Area */}
      <div className="flex-1 w-full relative flex flex-col items-stretch">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key={`skeleton-${pathname}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex-1 flex flex-col items-stretch"
            >
              {renderSkeletonForPath(pathname)}
            </motion.div>
          ) : (
            <motion.div
              key={`content-${pathname}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col items-stretch"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
