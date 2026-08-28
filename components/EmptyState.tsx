"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className,
  children,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center p-10 sm:p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20 gap-3",
        className
      )}
    >
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/60">
        <Icon className="size-6" />
      </div>
      <h4 className="font-semibold text-sm sm:text-base text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground font-normal max-w-sm leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
          >
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && onActionClick && !actionHref && (
        <Button
          size="sm"
          variant="outline"
          onClick={onActionClick}
          className="mt-2 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
        >
          {actionLabel}
        </Button>
      )}

      {children}
    </Card>
  );
}
