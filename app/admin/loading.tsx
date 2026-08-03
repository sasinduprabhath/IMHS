import React from "react";
import { BrandedSkeleton } from "@/components/ui/BrandedSkeleton";

// This renders inside <main> in the admin layout - the sidebar persists.
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <BrandedSkeleton className="h-3 w-24" />
          <BrandedSkeleton className="h-7 w-56" />
          <BrandedSkeleton className="h-3 w-40" />
        </div>
        <BrandedSkeleton variant="button" className="w-32" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <BrandedSkeleton className="h-3 w-20" />
              <BrandedSkeleton className="h-8 w-8 rounded-lg" />
            </div>
            <BrandedSkeleton className="h-8 w-16" />
            <BrandedSkeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Content table skeleton */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        <div className="px-5 py-4 border-b border-chart-grid flex items-center justify-between">
          <BrandedSkeleton className="h-5 w-40" />
          <BrandedSkeleton variant="button" className="w-28" />
        </div>
        <div className="divide-y divide-chart-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <BrandedSkeleton variant="circle" />
              <div className="flex-1 space-y-1.5">
                <BrandedSkeleton className="h-3.5 w-48" />
                <BrandedSkeleton className="h-3 w-32" />
              </div>
              <BrandedSkeleton variant="badge" />
              <BrandedSkeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
