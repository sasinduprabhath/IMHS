import React from "react";
import { cn } from "@/lib/utils";

/**
 * BlisterDivider — a horizontal rule with evenly-spaced small circles
 * evoking the pockets of a pharmaceutical blister pack.
 * Used at: homepage trust-strip top edge, courses catalog grid top edge.
 */
export function BlisterDivider({ className, pockets = 12 }: { className?: string; pockets?: number }) {
  const spacing = 100 / (pockets + 1);
  const positions = Array.from({ length: pockets }, (_, i) => (i + 1) * spacing);

  return (
    <div className={cn("relative w-full overflow-hidden", className)} aria-hidden="true">
      <svg
        viewBox="0 0 400 18"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[18px]"
      >
        {/* Base horizontal rule */}
        <line
          x1="0"
          y1="9"
          x2="400"
          y2="9"
          stroke="var(--chart-grid, #e8e0d5)"
          strokeWidth="1"
        />
        {/* Blister pocket circles — notched into the rule */}
        {positions.map((pct, i) => {
          const cx = (pct / 100) * 400;
          return (
            <React.Fragment key={i}>
              {/* White "punch-out" gap behind circle */}
              <rect x={cx - 7} y={6} width={14} height={6} fill="white" />
              {/* Blister circle */}
              <circle
                cx={cx}
                cy={9}
                r={4.5}
                stroke="var(--chart-grid, #e8e0d5)"
                strokeWidth="1"
                fill="white"
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}
