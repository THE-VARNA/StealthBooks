import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStatePanelProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; };
  className?: string;
}

export function EmptyStatePanel({ icon, title, description, action, className }: EmptyStatePanelProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 rounded-2xl py-20 px-8 text-center", className)}
      style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
    >
      {icon && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(20,24,54,0.6)", color: "rgb(71,85,105)", border: "1px solid rgba(255,255,255,0.065)" }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-heading-2" style={{ color: "rgb(248,250,252)" }}>{title}</p>
        {description && (
          <p className="max-w-sm text-body-sm" style={{ color: "rgb(71,85,105)" }}>{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} size="md">{action.label}</Button>
      )}
    </div>
  );
}
