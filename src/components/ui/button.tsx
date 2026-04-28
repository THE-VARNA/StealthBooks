import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "text-white",
        accent:
          "text-white",
        outline:
          "border text-sm font-medium",
        ghost:
          "text-sm font-medium",
        destructive:
          "text-sm font-medium",
        glass:
          "text-sm font-medium",
      },
      size: {
        sm:   "h-8 px-3 text-xs rounded-lg",
        md:   "h-9 px-4",
        lg:   "h-11 px-6 text-[0.9375rem]",
        xl:   "h-13 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variantStyle: React.CSSProperties =
      variant === "default" || !variant
        ? {
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            boxShadow: "0 0 20px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            color: "#fff",
          }
        : variant === "accent"
        ? {
            background: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
            boxShadow: "0 0 20px rgba(34,211,238,0.3), 0 2px 8px rgba(0,0,0,0.4)",
            color: "#fff",
          }
        : variant === "outline"
        ? {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgb(148,163,184)",
          }
        : variant === "ghost"
        ? {
            background: "transparent",
            color: "rgb(148,163,184)",
          }
        : variant === "destructive"
        ? {
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444",
          }
        : variant === "glass"
        ? {
            background: "rgba(14,17,38,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgb(248,250,252)",
          }
        : {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        style={{ ...variantStyle, ...style }}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="flex items-center gap-2">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
