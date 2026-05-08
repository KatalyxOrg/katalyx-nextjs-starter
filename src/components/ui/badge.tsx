import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "destructive" | "outline";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  destructive: "bg-destructive-light text-destructive",
  outline: "border border-border text-foreground bg-transparent",
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", "transition-colors duration-150", variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
