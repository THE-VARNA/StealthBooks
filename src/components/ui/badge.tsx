import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--surface-overlay))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--surface-border)/0.12)]",
        primary: "bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))] border border-[hsl(var(--brand-primary)/0.25)]",
        accent: "bg-[hsl(var(--brand-accent)/0.15)] text-[hsl(var(--brand-accent))] border border-[hsl(var(--brand-accent)/0.25)]",
        success: "bg-[hsl(var(--brand-success)/0.15)] text-[hsl(var(--brand-success))] border border-[hsl(var(--brand-success)/0.25)]",
        warning: "bg-[hsl(var(--brand-warning)/0.15)] text-[hsl(var(--brand-warning))] border border-[hsl(var(--brand-warning)/0.25)]",
        error: "bg-[hsl(var(--brand-error)/0.15)] text-[hsl(var(--brand-error))] border border-[hsl(var(--brand-error)/0.25)]",
        muted: "bg-transparent text-[hsl(var(--text-muted))] border border-[hsl(var(--surface-border)/0.1)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
