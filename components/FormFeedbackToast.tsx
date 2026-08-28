"use client";

import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFeedbackToastProps {
  show: boolean;
  message?: string;
  variant?: "success" | "error";
  className?: string;
}

export function FormFeedbackToast({
  show,
  message = "Changes saved successfully!",
  variant = "success",
  className,
}: FormFeedbackToastProps) {
  if (!show) return null;

  const isSuccess = variant === "success";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border animate-in fade-in-0 slide-in-from-bottom-4 duration-300 pointer-events-none select-none",
        isSuccess
          ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
          : "bg-destructive text-destructive-foreground border-destructive/80 shadow-destructive/20",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        {isSuccess ? <Check className="size-3.5 stroke-[3]" /> : <AlertCircle className="size-3.5 stroke-[3]" />}
      </div>
      <span className="text-xs sm:text-sm font-semibold tracking-tight">{message}</span>
    </div>
  );
}

interface InlineFeedbackBadgeProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function InlineFeedbackBadge({
  show,
  message = "Changes Saved!",
  className,
}: InlineFeedbackBadgeProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 animate-in fade-in-0 slide-in-from-bottom-2",
        className
      )}
    >
      <Check className="size-3.5" />
      <span>{message}</span>
    </div>
  );
}
