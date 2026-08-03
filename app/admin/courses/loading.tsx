import React from "react";
import { BrandedSkeleton } from "@/components/ui/BrandedSkeleton";

export default function CoursesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <BrandedSkeleton className="h-3 w-20" />
          <BrandedSkeleton className="h-7 w-48" />
        </div>
        <div className="flex gap-2">
          <BrandedSkeleton variant="button" className="w-24" />
          <BrandedSkeleton variant="button" className="w-32" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-4 space-y-2">
            <BrandedSkeleton className="h-3 w-20" />
            <BrandedSkeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
            <BrandedSkeleton variant="card" className="h-36 rounded-none border-b" />
            <div className="p-4 space-y-2">
              <BrandedSkeleton className="h-4 w-3/4" />
              <BrandedSkeleton className="h-3 w-1/2" />
              <div className="flex justify-between pt-1">
                <BrandedSkeleton variant="badge" />
                <BrandedSkeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
