"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, type HTMLAttributes } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId?: string;
  descriptionId?: string;
};

const SheetContext = createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
  titleId: undefined,
  descriptionId: undefined,
});

function useSheetContext() {
  return useContext(SheetContext);
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
}

// ---------------------------------------------------------------------------
// Content — slides in from the right
// ---------------------------------------------------------------------------

type SheetContentProps = HTMLAttributes<HTMLDialogElement> & {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
};

const sizeStyles = {
  sm: "max-w-sm", // 384px
  md: "max-w-md", // 448px
  lg: "max-w-xl", // 576px
  xl: "max-w-2xl", // 672px
  "2xl": "max-w-4xl", // 896px
  "3xl": "max-w-5xl", // 1024px
};

function SheetContent({ children, className, size = "lg", ...props }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Open / close the native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Prevent native Escape from closing the dialog without calling onOpenChange
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(e: Event) {
      e.preventDefault();
      close();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [close]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      close();
    }
  }

  if (!open) return null;

  const titleId = `${contentId}-title`;
  const descriptionId = `${contentId}-description`;

  return (
    <SheetContext.Provider value={{ open, onOpenChange, titleId, descriptionId }}>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          // Position: right-docked, full height
          "fixed inset-y-0 right-0 ml-auto h-full w-full border-l border-border bg-card p-0 text-card-foreground shadow-xl",
          // Backdrop
          "backdrop:bg-black/40 backdrop:backdrop-blur-sm",
          // Open state: flex column + slide animation
          "open:flex open:flex-col open:animate-sheet-in",
          // Rounded left corners
          "rounded-l-xl",
          sizeStyles[size],
          className,
        )}
        style={{ margin: 0, marginLeft: "auto" }}
        {...props}
      >
        {children}
      </dialog>
    </SheetContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function SheetHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-start justify-between border-b border-border px-6 py-4", className)} {...props}>
      <div className="min-w-0 flex-1">{children}</div>
      <SheetClose />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

function SheetTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useSheetContext();

  return (
    <h2 id={titleId} className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

function SheetDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useSheetContext();

  return (
    <p id={descriptionId} className={cn("mt-1 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

function SheetBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function SheetFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-end gap-3 border-t border-border px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Close button
// ---------------------------------------------------------------------------

function SheetClose({ className }: { className?: string }) {
  const { onOpenChange } = useSheetContext();

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={cn(
        "ml-2 rounded-md p-1.5 text-muted-foreground transition-colors duration-150",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="Fermer"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetClose };
