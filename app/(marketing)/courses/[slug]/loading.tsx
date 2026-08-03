import React from "react";
import { BrandedSkeleton } from "@/components/ui/BrandedSkeleton";

export default function CourseDetailLoading() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb Skeleton */}
      <BrandedSkeleton className="h-4 w-44" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column Syllabus & Detail (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-4 shadow-paper">
            <BrandedSkeleton className="h-4 w-28" />
            <BrandedSkeleton className="h-9 w-full" />
            <BrandedSkeleton className="h-4 w-5/6" />
            <BrandedSkeleton className="h-4 w-4/6" />
          </div>

          <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-4 shadow-paper">
            <BrandedSkeleton className="h-6 w-48" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-chart-grid rounded-lg space-y-2">
                <BrandedSkeleton className="h-5 w-3/4" />
                <BrandedSkeleton className="h-3.5 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sticky Card Skeleton (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-6 shadow-paper">
            <BrandedSkeleton variant="card" className="h-44 w-full" />
            <BrandedSkeleton className="h-8 w-36" />
            <BrandedSkeleton variant="button" className="w-full h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
