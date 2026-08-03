"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton — branded IMHS pulse shimmer.
 * Uses teal at 6–14% opacity instead of generic gray,
 * with a left-to-right vital shimmer sweep (defined in globals.css).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded skeleton-vital",
        className
      )}
    />
  );
}

/**
 * VitalLineSkeleton — heartbeat-trace shaped skeleton.
 * Use for wide, progress-bar shaped loading areas.
 */
export function VitalLineSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full skeleton-vital h-1.5",
        className
      )}
    />
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

      {/* Vital Line trace — used as section divider skeleton */}
      <VitalLineSkeleton className="w-full max-w-2xl mx-auto" />

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

/**
 * BookingCardSkeleton — used in admin/bookings and /consultation status lookup.
 */
export function BookingCardSkeleton() {
  return (
    <div className="bg-surface border border-chart-grid rounded-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex items-center gap-3 pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
      <VitalLineSkeleton className="w-full mt-1" />
    </div>
  );
}
