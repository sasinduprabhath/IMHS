import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// This renders inside <main> in the admin layout — the sidebar persists.
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Content table skeleton */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        <div className="px-5 py-4 border-b border-chart-grid flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="divide-y divide-chart-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
