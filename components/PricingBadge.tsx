"use client";

import { Badge } from "@/components/ui/badge";
import { PricingType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PricingBadgeProps {
  pricing?: PricingType | string;
  className?: string;
  size?: "xs" | "sm";
}

export function PricingBadge({ pricing = "free", className, size = "xs" }: PricingBadgeProps) {
  const normalized = (pricing || "free").toLowerCase();

  const sizeClass = size === "xs" ? "text-[10px] py-0 px-1.5" : "text-xs py-0.5 px-2";

  switch (normalized) {
    case "free":
      return (
        <Badge variant="secondary" className={cn(sizeClass, "font-normal", className)}>
          Free
        </Badge>
      );
    case "freemium":
      return (
        <Badge variant="outline" className={cn(sizeClass, "font-normal text-muted-foreground", className)}>
          Freemium
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="outline" className={cn(sizeClass, "font-normal text-muted-foreground", className)}>
          Paid
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={cn(sizeClass, "capitalize font-normal", className)}>
          {pricing}
        </Badge>
      );
  }
}
