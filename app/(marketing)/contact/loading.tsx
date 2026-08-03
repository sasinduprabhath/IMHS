import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col pt-28">
      
      {/* HERO SECTION SKELETON */}
      <section className="relative bg-linen/40 border-b border-chart-grid pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Skeleton className="h-6 w-44 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
      </section>

      {/* MAIN CONTENT SKELETON: Contact Info Grid + Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 bg-surface border border-chart-grid rounded-card flex items-start gap-4 shadow-sm">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Callout Skeleton */}
            <div className="p-6 bg-clinical-teal-surface border border-clinical-teal/30 rounded-card space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-10 w-full rounded-btn" />
            </div>
          </div>

          {/* Right Column: Contact Form Skeleton */}
          <div className="lg:col-span-7">
            <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
              <div className="space-y-2 border-b border-chart-grid pb-4">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-input" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-input" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-input" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-input" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-28 w-full rounded-input" />
                </div>

                <Skeleton className="h-12 w-full rounded-btn" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
