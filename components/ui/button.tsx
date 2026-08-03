import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-btn text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-red focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-chart-grid/40 disabled:text-ink-muted/40 disabled:shadow-none font-sans tracking-wide active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-clinical-teal text-white hover:bg-clinical-teal-hover shadow-paper hover:shadow-md active:bg-[#08386C]",
        outline:
          "border border-clinical-teal text-clinical-teal bg-transparent hover:bg-clinical-teal/10 hover:border-clinical-teal-hover active:bg-clinical-teal/20",
        secondary:
          "bg-linen border border-chart-grid text-ink hover:bg-linen-dark hover:border-sage active:bg-chart-grid",
        danger:
          "bg-chart-red text-white hover:bg-chart-red-hover shadow-paper active:bg-[#C8490E]",
        ghost:
          "hover:bg-clinical-teal/10 text-ink hover:text-clinical-teal active:bg-clinical-teal/20",
        link:
          "text-clinical-teal underline-offset-4 hover:underline p-0 h-auto active:scale-100",
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
