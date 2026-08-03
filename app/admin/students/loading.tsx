import React from "react";
import { BrandedSkeleton } from "@/components/ui/BrandedSkeleton";

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <BrandedSkeleton className="h-3 w-20" />
          <BrandedSkeleton className="h-7 w-52" />
        </div>
        <div className="flex gap-2">
          <BrandedSkeleton variant="button" className="w-36" />
          <BrandedSkeleton variant="button" className="w-28" />
        </div>
      </div>

      {/* Search bar */}
      <BrandedSkeleton className="h-10 w-full rounded-lg" />

      {/* Student table */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-3 border-b border-chart-grid bg-linen/40 grid grid-cols-4 gap-4">
          {["Student", "Email", "Courses", "Status"].map((col) => (
            <BrandedSkeleton key={col} className="h-3 w-16" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-chart-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <BrandedSkeleton variant="circle" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <BrandedSkeleton className="h-3.5 w-40" />
                <BrandedSkeleton className="h-3 w-28" />
              </div>
              <BrandedSkeleton className="h-3 w-24 hidden sm:block" />
              <BrandedSkeleton variant="badge" />
              <BrandedSkeleton className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
