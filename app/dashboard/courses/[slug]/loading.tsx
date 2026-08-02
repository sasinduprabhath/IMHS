import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VitalLine } from "@/components/ui/vital-line";

export default function CoursePlayerLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-72" />
        </div>
        <div className="bg-surface border border-chart-grid p-3 px-5 rounded-card w-full sm:w-64 space-y-1">
          <Skeleton className="h-3 w-full" />
          <VitalLine variant="progress" progress={50} />
        </div>
      </div>

      {/* Main Grid: Left Syllabus Accordion + Right Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Skeleton (4 Cols) */}
        <div className="lg:col-span-4 bg-surface border border-chart-grid rounded-card p-4 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 bg-linen/50 rounded space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* Video & Notes Player Skeleton (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="aspect-video w-full rounded-card" />

          <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 shadow-paper">
            <div className="flex justify-between items-center pb-3 border-b border-chart-grid">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-8 w-36 rounded-btn" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
