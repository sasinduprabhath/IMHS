import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base: Lexend (via font-sans), capsule-ready rounding, consistent transitions
  // pressed: scale(0.98) tap-down; disabled: muted fill + 40% opacity text
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-btn",
    "text-sm font-medium font-sans tracking-wide",
    "transition-all duration-150 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-teal focus-visible:ring-offset-2",
    "active:scale-[0.98]",                       // pressed tap-down — applied to ALL variants
    "disabled:pointer-events-none",
    "disabled:bg-chart-grid disabled:text-ink/40 disabled:shadow-none", // explicit disabled tokens
  ].join(" "),
  {
    variants: {
      variant: {
        // Default: teal fill — hover darkens ~8%
        default:
          "bg-clinical-teal text-white shadow-paper hover:bg-clinical-teal-hover",
        // Outline: teal border — hover: 8%-opacity teal tint fill-sweep
        outline:
          "border border-clinical-teal text-clinical-teal bg-transparent hover:bg-clinical-teal/8 hover:text-clinical-teal",
        // Secondary: sage tint
        secondary:
          "bg-sage-light text-ink hover:bg-sage/30",
        // Danger: chart-red — hover darkens
        danger:
          "bg-chart-red text-surface shadow-paper hover:bg-chart-red-hover",
        // Ghost: transparent — hover: linen tint
        ghost:
          "text-ink hover:bg-linen hover:text-clinical-teal",
        // Link: no background
        link:
          "text-clinical-teal underline-offset-4 hover:underline p-0 h-auto shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base font-semibold",
        icon: "h-9 w-9 p-0",
        // Capsule: pill-shaped — for marketing CTAs and booking actions
        capsule: "h-10 px-6 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
