import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label text-[hsl(var(--text-secondary))]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[hsl(var(--text-muted))]">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, hint ? hintId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className={cn(
              "w-full rounded-md border bg-[hsl(var(--surface-overlay)/0.5)] px-3 py-2.5 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))]",
              "border-[hsl(var(--surface-border)/0.12)] transition-all duration-200",
              "focus:outline-none focus:border-[hsl(var(--brand-primary)/0.5)] focus:ring-1 focus:ring-[hsl(var(--brand-primary)/0.3)]",
              "hover:border-[hsl(var(--surface-border)/0.2)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-[hsl(var(--brand-error)/0.5)] focus:border-[hsl(var(--brand-error)/0.7)] focus:ring-[hsl(var(--brand-error)/0.25)]",
              leftIcon && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3">{rightElement}</span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-[0.75rem] text-[hsl(var(--text-muted))]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-[0.75rem] text-[hsl(var(--brand-error))]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
