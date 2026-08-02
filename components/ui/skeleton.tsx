"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-chart-grid/50 rounded",
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-surface border border-chart-grid rounded-card p-6 space-y-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="pt-4 border-t border-chart-grid/60 flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24 rounded-btn" />
      </div>
    </div>
  );
}

export function FacultyCardSkeleton() {
  return (
    <div className="bg-surface border border-chart-grid rounded-card p-6 flex flex-col items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2 w-full text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-16 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      {/* Hero skeleton */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-64 mx-auto rounded-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-5/6 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-2/3 mx-auto" />
        <div className="flex gap-4 justify-center pt-4">
          <Skeleton className="h-12 w-44 rounded-btn" />
          <Skeleton className="h-12 w-36 rounded-btn" />
        </div>
      </div>

      {/* Trust strip skeleton */}
      <div className="border-y border-chart-grid py-8 grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>

      {/* Courses skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
