import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

import type { BadgeVariant } from "@/components/ui/badge";

type InfoBlockProps = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  badge?: boolean;
  badgeVariant?: BadgeVariant;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function InfoBlock({ icon, label, value, badge = false, badgeVariant = "outline", className, labelClassName, valueClassName }: InfoBlockProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className={cn("flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground", labelClassName)}>
        {icon}
        {label}
      </p>
      {badge ? <Badge variant={badgeVariant}>{value}</Badge> : <p className={cn("text-sm text-foreground", valueClassName)}>{value}</p>}
    </div>
  );
}
