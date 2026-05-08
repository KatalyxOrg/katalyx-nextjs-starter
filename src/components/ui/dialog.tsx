"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, type HTMLAttributes } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId?: string;
  descriptionId?: string;
};

const DialogContext = createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
  titleId: undefined,
  descriptionId: undefined,
});

function useDialogContext() {
  return useContext(DialogContext);
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

type DialogTriggerProps = HTMLAttributes<HTMLButtonElement>;

function DialogTrigger({ children, className, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialogContext();

  return (
    <button type="button" className={className} onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

type DialogContentProps = HTMLAttributes<HTMLDialogElement> & {
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[90vw]",
};

function DialogContent({ children, className, size = "md", ...props }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentId = useId();

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

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

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      close();
    }
  }

  if (!open) return null;

  const titleId = `${contentId}-title`;
  const descriptionId = `${contentId}-description`;

  return (
    <DialogContext.Provider value={{ open, onOpenChange, titleId, descriptionId }}>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "fixed inset-0 z-50 m-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-lg",
          "w-[calc(100%-2rem)]",
          "backdrop:bg-black/40 backdrop:backdrop-blur-sm",
          "open:flex open:flex-col open:animate-fade-in",
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </dialog>
    </DialogContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function DialogHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-start justify-between border-b border-border px-6 py-4", className)} {...props}>
      <div className="flex-1">{children}</div>
      <DialogClose />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

function DialogTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext();

  return (
    <h2 id={titleId} className={cn("text-lg font-semibold text-foreground", className)} {...props}>
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

function DialogDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialogContext();

  return (
    <p id={descriptionId} className={cn("mt-1 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

function DialogBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function DialogFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-end gap-3 border-t border-border px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Close button
// ---------------------------------------------------------------------------

function DialogClose({ className }: { className?: string }) {
  const { onOpenChange } = useDialogContext();

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

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose };
