import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toUpperCase();

  let styles = "bg-linen text-ink border-chart-grid";

  if (s === "PUBLISHED" || s === "ACTIVE" || s === "ENROLLED") {
    styles = "bg-clinical-teal/10 text-clinical-teal border-clinical-teal/30 font-bold";
  } else if (s === "FROZEN" || s === "FAILED") {
    styles = "bg-chart-red/10 text-chart-red border-chart-red/30 font-bold";
  } else if (s === "DRAFT" || s === "CLOSED") {
    styles = "bg-linen text-ink-muted border-chart-grid font-medium";
  } else if (s === "PENDING") {
    styles = "bg-amber-500/10 text-amber-700 border-amber-500/30 font-bold";
  } else if (s === "CONTACTED") {
    styles = "bg-blue-500/10 text-blue-700 border-blue-500/30 font-bold";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono border uppercase tracking-wider",
        styles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full fill-current bg-current" />
      {status}
    </span>
  );
}
