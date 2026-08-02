"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tag?: string;
  code?: string;
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function ChartCard({
  tag,
  code,
  children,
  className,
  hoverEffect = true,
  ...props
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-surface border border-chart-grid rounded-card transition-all duration-300 p-6 overflow-hidden flex flex-col justify-between",
        hoverEffect && "hover:border-clinical-teal hover:shadow-paper-stack",
        className
      )}
      {...props}
    >
      {/* Top Vital Line Squiggle on Hover */}
      {hoverEffect && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-chart-grid group-hover:bg-chart-red transition-colors duration-300">
          <div className="w-0 group-hover:w-full h-[2px] bg-chart-red transition-all duration-500" />
        </div>
      )}

      {/* Header Tag / Manila Tab */}
      {(tag || code) && (
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-chart-grid/60">
          {tag && (
            <span className="inline-block bg-linen text-ink-muted text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-sm border border-chart-grid/80 font-medium">
              {tag}
            </span>
          )}
          {code && (
            <span className="font-mono text-xs font-semibold text-clinical-teal bg-clinical-teal-surface px-2 py-0.5 rounded">
              {code}
            </span>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
