import React from "react";
import { BrandedSkeleton } from "@/components/ui/BrandedSkeleton";

export default function InquiriesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <BrandedSkeleton className="h-3 w-24" />
          <BrandedSkeleton className="h-7 w-44" />
        </div>
        <BrandedSkeleton variant="badge" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <BrandedSkeleton variant="button" className="w-24" />
        <BrandedSkeleton variant="button" className="w-24" />
      </div>

      {/* Inquiry cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <BrandedSkeleton className="h-4 w-40" />
                <div className="flex gap-3">
                  <BrandedSkeleton className="h-3 w-28" />
                  <BrandedSkeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <BrandedSkeleton variant="badge" />
                <BrandedSkeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <BrandedSkeleton className="h-3 w-full" />
            <BrandedSkeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
