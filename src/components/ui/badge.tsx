import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "accent" | "success" | "warning" | "error" | "muted";

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default:  { background: "rgba(20,24,54,0.8)", color: "rgb(148,163,184)", border: "1px solid rgba(255,255,255,0.08)" },
  primary:  { background: "rgba(99,102,241,0.12)", color: "#818cf8",       border: "1px solid rgba(99,102,241,0.3)" },
  accent:   { background: "rgba(34,211,238,0.1)",  color: "#22d3ee",       border: "1px solid rgba(34,211,238,0.28)" },
  success:  { background: "rgba(16,185,129,0.1)",  color: "#10b981",       border: "1px solid rgba(16,185,129,0.28)" },
  warning:  { background: "rgba(245,158,11,0.1)",  color: "#f59e0b",       border: "1px solid rgba(245,158,11,0.28)" },
  error:    { background: "rgba(239,68,68,0.1)",   color: "#ef4444",       border: "1px solid rgba(239,68,68,0.28)" },
  muted:    { background: "transparent",           color: "rgb(71,85,105)", border: "1px solid rgba(255,255,255,0.07)" },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

function Badge({ className, variant = "default", dot, children, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide", className)}
      style={{ ...VARIANT_STYLES[variant], ...style }}
      {...props}
    >
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

export { Badge };
