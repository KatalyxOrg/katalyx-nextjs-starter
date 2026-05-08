"use client";

import { cn } from "@/lib/utils/cn";

type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type FilterBarProps = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function FilterBar({ options, value, onChange, className }: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-border bg-muted p-1", className)} role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
            value === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && <span className={cn("text-xs", value === option.value ? "text-muted-foreground" : "text-muted-foreground/70")}>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps, FilterOption };
