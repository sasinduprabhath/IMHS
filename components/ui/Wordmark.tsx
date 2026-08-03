import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Wordmark({
  className,
  href = "/",
  size = "md",
  showTagline = false,
}: WordmarkProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2 group select-none", className)}>
      {/* Vital Line Pulse Blip Accent */}
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "stroke-clinical-teal fill-none transition-transform group-hover:scale-110",
          size === "sm" && "w-5 h-5",
          size === "md" && "w-6 h-6",
          size === "lg" && "w-8 h-8"
        )}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12h4l2.5-6 4 12 3-8 2 2h4.5" />
      </svg>

      {/* Wordmark typography in Fraunces Medium */}
      <div className="flex flex-col">
        <span className={cn("font-display font-semibold tracking-tight text-ink leading-none", sizeClasses)}>
          IMHS
        </span>
        {showTagline && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-clinical-teal/80 mt-0.5">
            Institute of Medicine
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
