import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "primary" | "cyan" | "green" | false;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassPanel({
  className,
  children,
  hover = false,
  glow = false,
  padding = "md",
  style,
  ...props
}: GlassPanelProps) {
  const glowStyle =
    glow === "primary" ? { borderColor: "rgba(99,102,241,0.3)", boxShadow: "0 0 30px rgba(99,102,241,0.2), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" } :
    glow === "cyan"    ? { borderColor: "rgba(34,211,238,0.25)", boxShadow: "0 0 30px rgba(34,211,238,0.15), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" } :
    glow === "green"   ? { borderColor: "rgba(16,185,129,0.25)", boxShadow: "0 0 30px rgba(16,185,129,0.15), 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" } :
    {};

  return (
    <div
      className={cn(
        "rounded-2xl",
        padding === "sm"   && "p-4",
        padding === "md"   && "p-5",
        padding === "lg"   && "p-6",
        padding === "none" && "p-0",
        className
      )}
      style={{
        background: "rgba(14,17,38,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.065)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: hover ? "all 0.25s ease" : undefined,
        ...glowStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
