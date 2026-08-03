import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "text" | "circle" | "badge" | "button";
}

export function BrandedSkeleton({
  className,
  variant = "text",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linen-dark/60 border border-chart-grid/40 animate-vital-pulse rounded-card",
        variant === "text" && "h-4 w-full rounded",
        variant === "card" && "h-36 w-full rounded-card p-4 flex flex-col justify-between",
        variant === "circle" && "h-10 w-10 rounded-full shrink-0",
        variant === "badge" && "h-6 w-20 rounded-full",
        variant === "button" && "h-10 w-28 rounded-full",
        className
      )}
      {...props}
    >
      {/* Vital Line heartbeat trace overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <svg
          viewBox="0 0 100 20"
          className="w-full h-full text-clinical-teal stroke-current"
          fill="none"
          strokeWidth="1.75"
        >
          <path d="M0,10 L30,10 L35,2 L42,18 L48,6 L53,13 L58,10 L100,10" />
        </svg>
      </div>
    </div>
  );
}
