import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-28">

      {/* HERO SKELETON */}
      <section className="relative bg-linen/40 border-b border-chart-grid pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <Skeleton className="h-6 w-44 mx-auto rounded-full" />
          <Skeleton className="h-12 sm:h-16 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>
        </div>
      </section>

      {/* 4 PROGRESSION LEVELS / PILLARS SKELETON */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-4 w-36 mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 shadow-paper">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
