"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
}

const SIZE_CLASSES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-xs sm:text-sm",
  lg: "size-12 sm:size-14 text-sm font-semibold",
  xl: "size-16 sm:size-20 text-base font-bold",
};

export function UserAvatar({
  name = "User",
  src,
  size = "md",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <Avatar className={cn(sizeClass, "rounded-xl sm:rounded-2xl border border-border shadow-2xs shrink-0 bg-muted", className)}>
      {src && <AvatarImage src={src} alt={name || "Avatar"} className="object-cover" />}
      <AvatarFallback
        className={cn(
          "rounded-xl sm:rounded-2xl font-semibold bg-muted text-foreground select-none",
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
