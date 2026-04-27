import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "primary" | "accent" | false;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassPanel({
  className,
  children,
  hover = false,
  glow = false,
  padding = "md",
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass rounded-xl",
        hover && "glass-hover cursor-default",
        glow === "primary" && "shadow-[var(--shadow-glow)]",
        glow === "accent" && "shadow-[var(--shadow-glow-accent)]",
        padding === "sm" && "p-4",
        padding === "md" && "p-5",
        padding === "lg" && "p-6",
        padding === "none" && "p-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
