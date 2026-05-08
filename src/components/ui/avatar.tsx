import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const imageSizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const dimension = imageSizes[size];

  if (src) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-full", sizeStyles[size], className)}>
        <Image src={src} alt={name} width={dimension} height={dimension} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-light font-medium text-primary", sizeStyles[size], className)} aria-label={name}>
      {initials}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };
