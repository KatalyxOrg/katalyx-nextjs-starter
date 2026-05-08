"use client";

import { useRef, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// ─── DropdownMenu ───

type DropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
};

function DropdownMenu({ open, onClose, trigger, children, align = "right", className }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
    <div ref={menuRef} className={cn("relative inline-block", className)}>
      {trigger}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg",
            "animate-fade-in duration-150",
            align === "right" ? "right-0" : "left-0",
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── DropdownMenuItem ───

type DropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "default" | "destructive";
};

function DropdownMenuItem({ className, icon, variant = "default", children, ...props }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "destructive" ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-muted",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ─── DropdownMenuSeparator ───

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} role="separator" />;
}

// ─── Exports ───

export { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator };
export type { DropdownMenuProps, DropdownMenuItemProps };
