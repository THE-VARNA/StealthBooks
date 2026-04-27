import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        "animate-pulse rounded-md bg-[hsl(var(--surface-overlay))]",
        className
      )}
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} role="status" aria-label="Loading...">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
