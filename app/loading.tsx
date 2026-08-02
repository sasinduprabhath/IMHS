import React from "react";
import { Skeleton, CourseCardSkeleton } from "@/components/ui/skeleton";
import { VitalLine } from "@/components/ui/vital-line";

export default function HomepageLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      
      {/* 1. HERO SECTION SKELETON */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-clinical-teal-surface/40 via-surface to-surface px-4 sm:px-6 lg:px-8 pt-28 pb-16 border-b border-chart-grid">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-12 sm:h-16 w-3/4" />
              <Skeleton className="h-12 sm:h-16 w-full" />
            </div>

            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />

            <div className="py-2">
              <VitalLine variant="hero" animated={true} />
            </div>

            <div className="flex gap-4 pt-2">
              <Skeleton className="h-12 w-44 rounded-full" />
              <Skeleton className="h-12 w-44 rounded-full" />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Right Column Hero Card Skeleton */}
          <div className="lg:col-span-5">
            <div className="h-[400px] sm:h-[480px] w-full rounded-2xl bg-chart-grid/40 p-4 flex flex-col justify-end">
              <div className="bg-surface p-4 rounded-xl space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP SKELETON */}
      <section className="border-b border-chart-grid py-12 bg-linen/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-20 mx-auto" />
              <Skeleton className="h-3 w-28 mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. COURSES SECTION SKELETON */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end border-b border-chart-grid pb-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-btn" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
