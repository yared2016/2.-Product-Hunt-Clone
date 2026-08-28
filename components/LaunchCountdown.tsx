"use client";

import { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 12,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target is end of current UTC day (23:59:59 UTC)
      const endOfDay = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      ));

      const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] sm:text-xs text-orange-600 dark:text-orange-400 font-mono">
        <Clock className="size-3.5" />
        <span>Today&apos;s Launch Cycle</span>
      </div>
    );
  }

  const formatUnit = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      suppressHydrationWarning
      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-orange-500/[0.08] via-amber-500/[0.08] to-orange-500/[0.08] border border-orange-500/25 text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 shadow-2xs shrink-0"
    >
      <div className="flex items-center gap-1.5 font-medium shrink-0">
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full size-2 bg-orange-500"></span>
        </span>
        <span className="hidden xs:inline sm:inline">Voting Closes:</span>
      </div>

      <div className="font-mono font-semibold tracking-tight text-foreground flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
        <span className="bg-background px-1.5 py-0.5 rounded-lg border border-border/80 shadow-2xs">
          {formatUnit(timeLeft.hours)}h
        </span>
        <span className="text-orange-500 font-bold">:</span>
        <span className="bg-background px-1.5 py-0.5 rounded-lg border border-border/80 shadow-2xs">
          {formatUnit(timeLeft.minutes)}m
        </span>
        <span className="text-orange-500 font-bold">:</span>
        <span className="bg-background px-1.5 py-0.5 rounded-lg border border-border/80 shadow-2xs">
          {formatUnit(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
