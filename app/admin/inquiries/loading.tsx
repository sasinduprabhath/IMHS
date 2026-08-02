import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InquiriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-44" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Inquiry cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
