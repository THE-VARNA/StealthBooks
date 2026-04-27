import * as React from "react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./GlassPanel";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricTileProps {
  label: string;
  value: string | React.ReactNode;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
  className?: string;
  accentColor?: string;
}

export function MetricTile({ label, value, subtext, icon, trend, loading = false, className, accentColor = "#6366f1" }: MetricTileProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl p-5 hover-lift", className)}
      style={{
        background: "rgba(14,17,38,0.6)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 0 24px ${accentColor}20, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-label" style={{ color: "rgb(71,85,105)" }}>{label}</p>
        {icon && (
          <span
            className="rounded-xl p-2"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}
          >
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <>
          <Skeleton className="h-8 w-32 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </>
      ) : (
        <>
          <div className="text-[1.75rem] font-bold tracking-tight leading-none mb-1.5"
            style={{ color: "rgb(248,250,252)", fontVariantNumeric: "tabular-nums" }}>
            {value}
          </div>
          <div className="flex items-center gap-2">
            {subtext && <p className="text-body-sm" style={{ color: "rgb(71,85,105)" }}>{subtext}</p>}
            {trend && (
              <span className="text-xs font-semibold"
                style={{ color: trend.positive ? "#10b981" : "#ef4444" }}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
