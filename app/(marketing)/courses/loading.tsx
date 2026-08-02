import React from "react";
import { Skeleton, CourseCardSkeleton } from "@/components/ui/skeleton";

export default function CoursesCatalogLoading() {
  return (
    <div className="space-y-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header Skeleton */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-4 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 w-96 mx-auto" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-surface border border-chart-grid p-4 rounded-card flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <Skeleton className="h-10 w-full sm:w-80 rounded-input" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-32 rounded-input" />
          <Skeleton className="h-10 w-32 rounded-input" />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
