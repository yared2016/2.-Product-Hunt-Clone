"use client";

import { Badge } from "@/components/ui/badge";
import { Zap, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  variant?: "sponsored" | "crown" | "pill" | "superuser";
  text?: string;
  className?: string;
  size?: "xs" | "sm";
}

export function ProBadge({
  variant = "sponsored",
  text,
  className,
  size = "xs",
}: ProBadgeProps) {
  const sizeClass = size === "xs" ? "text-[10px] py-0 px-2" : "text-xs py-0.5 px-2.5";

  if (variant === "crown") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs hover:scale-105 transition-all select-none",
          className
        )}
      >
        <Crown className="size-3.5 text-amber-500 fill-amber-500" />
        <span>{text || "PRO"}</span>
      </div>
    );
  }

  if (variant === "superuser") {
    return (
      <Badge
        className={cn(
          sizeClass,
          "gap-1 font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-xs uppercase tracking-wider",
          className
        )}
      >
        <Sparkles className="size-3" />
        <span>{text || "SUPERUSER"}</span>
      </Badge>
    );
  }

  // Default "sponsored" radiant badge
  return (
    <Badge
      className={cn(
        sizeClass,
        "gap-1 font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-0 shadow-2xs animate-in fade-in-0 select-none",
        className
      )}
    >
      <Zap className="size-2.5 fill-current" />
      <span>{text || "PRO SPONSORED"}</span>
    </Badge>
  );
}
