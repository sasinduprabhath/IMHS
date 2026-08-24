import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-btn text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-red focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-sans tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-clinical-teal text-white hover:bg-clinical-teal-hover shadow-paper transition-all duration-200",
        outline:
          "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all duration-150",
        secondary:
          "bg-sage-light text-ink hover:bg-sage transition-all duration-200",
        danger:
          "bg-chart-red text-surface hover:bg-chart-red-hover shadow-paper",
        ghost:
          "hover:bg-linen text-ink hover:text-clinical-teal",
        link:
          "text-clinical-teal underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base font-semibold",
        icon: "h-9 w-9 p-0",
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
