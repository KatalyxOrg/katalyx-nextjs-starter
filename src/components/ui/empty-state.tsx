import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

type StatusType = "info" | "success" | "error" | "warning";

type StatusMessageProps = {
  type: StatusType;
  message: string;
  className?: string;
};

const statusConfig: Record<StatusType, { icon: React.ComponentType<{ className?: string }>; textClass: string }> = {
  info: { icon: Info, textClass: "text-info" },
  success: { icon: CheckCircle, textClass: "text-success" },
  error: { icon: XCircle, textClass: "text-destructive" },
  warning: { icon: AlertCircle, textClass: "text-warning" },
};

function StatusMessage({ type, message, className }: StatusMessageProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 rounded-lg p-3", className)}>
      <Icon className={cn("h-4 w-4 shrink-0", config.textClass)} />
      <p className={cn("text-sm font-medium", config.textClass)}>{message}</p>
    </div>
  );
}

export { EmptyState, StatusMessage };
export type { EmptyStateProps, StatusMessageProps };
