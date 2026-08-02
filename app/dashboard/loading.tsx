import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VitalLine } from "@/components/ui/vital-line";
import { BookOpen } from "lucide-react";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full pt-24">
      {/* Student Welcome Hero Banner Skeleton */}
      <div className="bg-clinical-teal-surface border border-clinical-teal/20 rounded-card p-5 sm:p-6 md:p-8 space-y-6 shadow-paper">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0" />
            <div className="sm:hidden space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div className="hidden sm:flex gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>

        {/* 3 Metric Cards Grid Skeleton */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t border-chart-grid/60">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-chart-grid rounded-card p-3 text-center space-y-2 shadow-sm">
              <Skeleton className="h-7 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Courses Header Skeleton */}
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-chart-grid">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-clinical-teal/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-clinical-teal" />
            </div>
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-5 w-36 rounded-full hidden sm:block" />
        </div>

        {/* Course Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/6" />

              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full" />
                <VitalLine variant="progress" progress={35} />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              <div className="pt-3 border-t border-chart-grid/60">
                <Skeleton className="h-9 w-full rounded-btn" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
