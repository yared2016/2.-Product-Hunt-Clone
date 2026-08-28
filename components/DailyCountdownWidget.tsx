"use client";

import { useState, useEffect } from "react";
import { Clock, Sparkles, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DailyCountdownWidget() {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target end of day (23:59:59)
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = Math.max(0, endOfDay.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/[0.07] via-amber-500/[0.05] to-card border border-orange-500/20 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
          <Clock className="size-4 animate-pulse" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-foreground tracking-tight">
              Today&apos;s Launch Voting Cycle
            </span>
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 py-0 px-1.5 gap-1 font-normal flex items-center"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Voting</span>
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate font-normal">
            Podium places #1, #2, and #3 lock in at midnight. Cast your votes now!
          </p>
        </div>
      </div>

      {/* Countdown Digits */}
      <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-lg bg-background border border-border shadow-2xs font-mono font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400">
            {timeLeft.hours}
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase pt-0.5 font-normal">Hrs</span>
        </div>
        <span className="font-bold text-xs text-orange-500/60 pb-3">:</span>
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-lg bg-background border border-border shadow-2xs font-mono font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400">
            {timeLeft.minutes}
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase pt-0.5 font-normal">Min</span>
        </div>
        <span className="font-bold text-xs text-orange-500/60 pb-3">:</span>
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-lg bg-background border border-border shadow-2xs font-mono font-bold text-xs sm:text-sm text-orange-600 dark:text-orange-400">
            {timeLeft.seconds}
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase pt-0.5 font-normal">Sec</span>
        </div>
      </div>
    </div>
  );
}
