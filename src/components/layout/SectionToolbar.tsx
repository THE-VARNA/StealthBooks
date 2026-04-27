import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SectionToolbarProps {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export function SectionToolbar({ title, description, actions, filters, className }: SectionToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-heading-1" style={{ color: "rgb(248,250,252)" }}>{title}</h1>
          {description && (
            <p className="text-body-sm" style={{ color: "rgb(148,163,184)" }}>{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
    </div>
  );
}
