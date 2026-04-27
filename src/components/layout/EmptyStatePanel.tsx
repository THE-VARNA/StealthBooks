import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStatePanelProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyStatePanel({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[hsl(var(--surface-border)/0.15)] py-16 px-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="rounded-2xl bg-[hsl(var(--surface-overlay))] p-4 text-[hsl(var(--text-muted))]">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-heading-2 text-[hsl(var(--text-primary))]">{title}</p>
        {description && (
          <p className="max-w-sm text-body-sm text-[hsl(var(--text-muted))]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
