import React from "react";
import { cn } from "@/lib/utils";

/**
 * MolecularGridBackground — repeating hexagonal grid at 4–6% opacity.
 * Absolute-positioned, pointer-events-none background texture.
 * Use behind hero sections and image blocks.
 */
export function MolecularGridBackground({ className }: { className?: string }) {
  const id = "hex-grid-pattern";

  return (
    <svg
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Single hexagon tile — flat-top orientation, 40px wide */}
        <pattern
          id={id}
          x="0"
          y="0"
          width="46"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          {/* Flat-top hexagon: 6 points at 40px width, 34.6px height */}
          <polygon
            points="23,2 43,12 43,32 23,42 3,32 3,12"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${id})`}
        className="text-chart-grid opacity-[0.05]"
      />
    </svg>
  );
}
