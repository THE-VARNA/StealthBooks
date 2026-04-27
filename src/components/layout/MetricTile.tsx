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
}

export function MetricTile({
  label,
  value,
  subtext,
  icon,
  trend,
  loading = false,
  className,
}: MetricTileProps) {
  return (
    <GlassPanel hover className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <p className="text-label text-[hsl(var(--text-muted))]">{label}</p>
        {icon && (
          <span className="rounded-lg bg-[hsl(var(--surface-overlay))] p-2 text-[hsl(var(--brand-primary))]">
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </>
      ) : (
        <>
          <div className="text-heading-1 font-bold text-[hsl(var(--text-primary))]">
            {value}
          </div>
          <div className="flex items-center gap-2">
            {subtext && (
              <p className="text-body-sm text-[hsl(var(--text-muted))]">{subtext}</p>
            )}
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.positive
                    ? "text-[hsl(var(--brand-success))]"
                    : "text-[hsl(var(--brand-error))]"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
        </>
      )}
    </GlassPanel>
  );
}
