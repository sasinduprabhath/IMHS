import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-chart-grid">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Student table */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-3 border-b border-chart-grid bg-linen/40 grid grid-cols-4 gap-4">
          {["Student", "Email", "Courses", "Status"].map((col) => (
            <Skeleton key={col} className="h-3 w-16" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-chart-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-3 w-24 hidden sm:block" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
