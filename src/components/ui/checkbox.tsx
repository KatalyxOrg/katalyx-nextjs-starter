"use client";

import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  indeterminate?: boolean;
  label?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, indeterminate, label, id, ...props }, forwardedRef) => {
  const innerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className={cn("inline-flex items-center gap-2", label ? "cursor-pointer" : "", props.disabled && "cursor-not-allowed opacity-50")}>
      <input
        ref={(node) => {
          innerRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        id={inputId}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-border bg-card text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "transition-colors duration-150",
          "accent-primary cursor-pointer",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {label && <span className="text-sm text-foreground select-none">{label}</span>}
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
