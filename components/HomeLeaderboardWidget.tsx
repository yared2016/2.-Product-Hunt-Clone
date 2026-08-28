"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Trophy, Flame, ChevronRight, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeLeaderboardWidget() {
  const leaderboard = useQuery(api.products.getLeaderboard, {
    timeframe: "daily",
    period: "2026-08-28",
  });

  const topThree = leaderboard?.products?.slice(0, 3) ?? [];

  if (topThree.length === 0) {
    return null;
  }

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const rankBadges = [
    { label: "1st", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", icon: "🥇" },
    { label: "2nd", color: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30", icon: "🥈" },
    { label: "3rd", color: "bg-orange-700/15 text-orange-700 dark:text-orange-400 border-orange-700/30", icon: "🥉" },
  ];

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-gradient-to-r from-orange-500/[0.07] via-amber-500/[0.04] to-background p-4 sm:p-5 shadow-2xs mb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Trophy className="size-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
              Today's Live Leaderboard
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        <Link href="/leaderboard" className="shrink-0">
          <Button variant="ghost" size="sm" className="text-xs h-8 px-2 sm:px-3 gap-1 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 cursor-pointer font-normal">
            <span className="hidden sm:inline">Explore All Timeframes</span>
            <span className="sm:hidden">All</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </Link>
      </div>

      {/* Top 3 Live Standings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-3.5">
        {topThree.map((product, idx) => (
          <Link
            key={product._id}
            href={`/products/${product.slug}`}
            className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-card hover:border-orange-500/40 hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.06] hover:shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            {/* Rank Position */}
            <div className="flex flex-col items-center justify-center shrink-0 w-7 text-center">
              <span className="text-base leading-none group-hover:scale-110 transition-transform">{rankBadges[idx]?.icon}</span>
              <span className="text-[10px] font-semibold font-mono text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mt-0.5">
                #{idx + 1}
              </span>
            </div>

            {/* Product Logo */}
            <Avatar className="size-10 rounded-xl border border-border shrink-0 bg-muted group-hover:scale-105 transition-transform duration-200 shadow-2xs">
              {product.logoUrl && <AvatarImage src={product.logoUrl} alt={product.name} />}
              <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                {getInitials(product.name)}
              </AvatarFallback>
            </Avatar>

            {/* Details */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="font-medium text-xs text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {product.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Flame className="size-3 shrink-0" />
                  <span>{product.upvoteCount}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-normal">{product.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}