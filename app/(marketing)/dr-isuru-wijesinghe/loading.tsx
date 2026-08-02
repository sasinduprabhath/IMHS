import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DrIsuruProfileLoading() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Hero Profile Header Skeleton */}
      <div className="bg-surface border border-chart-grid rounded-card p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-paper">
        <Skeleton className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl shrink-0" />
        <div className="space-y-4 flex-1 w-full text-center md:text-left">
          <Skeleton className="h-5 w-40 mx-auto md:mx-0 rounded-full" />
          <Skeleton className="h-9 w-72 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
          <div className="flex gap-3 pt-2 justify-center md:justify-start">
            <Skeleton className="h-10 w-44 rounded-btn" />
            <Skeleton className="h-10 w-36 rounded-btn" />
          </div>
        </div>
      </div>

      {/* 2 Column Details Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 shadow-paper">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 shadow-paper">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
