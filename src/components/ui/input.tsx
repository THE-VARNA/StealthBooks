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
  ({ className, type, error, label, hint, leftIcon, rightElement, id, style, ...props }, ref) => {
    const inputId = id ?? React.useId();
    const errorId = `${inputId}-error`;
    const hintId  = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label"
            style={{ color: "rgb(148,163,184)" }}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5" style={{ color: "rgb(71,85,105)" }}>
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined
            }
            className={cn(
              "w-full rounded-xl text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon   && "pl-10",
              rightElement && "pr-10",
              className
            )}
            style={{
              padding: "10px 14px",
              background: "rgba(10,12,28,0.8)",
              border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
              color: "rgb(248,250,252)",
              outline: "none",
              ...style,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error ? "rgba(239,68,68,0.7)" : "rgba(99,102,241,0.55)";
              e.target.style.boxShadow = error
                ? "0 0 0 3px rgba(239,68,68,0.12)"
                : "0 0 0 3px rgba(99,102,241,0.12), 0 0 16px rgba(99,102,241,0.08)";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3">{rightElement}</span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="text-[0.75rem]" style={{ color: "rgb(71,85,105)" }}>
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-[0.75rem]" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
