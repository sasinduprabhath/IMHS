import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Executive Header Skeleton */}
      <div className="bg-surface border border-chart-grid rounded-card p-6 flex justify-between items-center shadow-paper">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>

      {/* 4 Admin Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-chart-grid rounded-card p-5 space-y-3 shadow-sm">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Admin Table Skeleton */}
      <div className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
