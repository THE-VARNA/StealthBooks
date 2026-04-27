import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface-base))] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-inverse))] hover:bg-[hsl(var(--brand-primary))/90] shadow-[0_0_16px_hsl(var(--brand-primary)/0.25)]",
        accent:
          "bg-[hsl(var(--brand-accent))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--brand-accent))/90] shadow-[0_0_16px_hsl(var(--brand-accent)/0.25)]",
        outline:
          "border border-[hsl(var(--surface-border)/0.15)] bg-transparent text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-raised)/0.6)] hover:border-[hsl(var(--surface-border)/0.25)]",
        ghost:
          "bg-transparent text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-raised)/0.5)] hover:text-[hsl(var(--text-primary))]",
        destructive:
          "bg-[hsl(var(--brand-error)/0.15)] text-[hsl(var(--brand-error))] border border-[hsl(var(--brand-error)/0.3)] hover:bg-[hsl(var(--brand-error)/0.25)]",
        glass:
          "glass glass-hover text-[hsl(var(--text-primary))]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-base",
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
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
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
