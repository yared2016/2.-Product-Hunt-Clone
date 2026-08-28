"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import { DateSelectDropdown } from "@/components/DateSelectDropdown";
import { MonthSelectDropdown } from "@/components/MonthSelectDropdown";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { PricingBadge } from "@/components/PricingBadge";
import { ProBadge } from "@/components/ProBadge";
import { EmptyState } from "@/components/EmptyState";
import { BASE_DATE, ROUTES } from "@/lib/constants";
import {
  Trophy,
  Crown,
  Flame,
  ChevronUp,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Medal,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeframeType = "daily" | "weekly" | "monthly" | "all_time" | "makers";

const DAILY_PRESETS = [
  { key: BASE_DATE, label: "Today", sublabel: "Friday" },
  { key: "2026-08-27", label: "Yesterday", sublabel: "Thursday" },
  { key: "2026-08-26", label: "Wednesday", sublabel: "Aug 26" },
  { key: "2026-08-25", label: "Tuesday", sublabel: "Aug 25" },
  { key: "2026-08-21", label: "Last Week", sublabel: "Aug 21" },
];

const MONTHLY_PRESETS = [
  { key: "2026-08", label: "August 2026" },
  { key: "2026-07", label: "July 2026" },
  { key: "2026-06", label: "June 2026" },
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<TimeframeType>("daily");
  const [selectedDaily, setSelectedDaily] = useState<string>(BASE_DATE);
  const [selectedMonthly, setSelectedMonthly] = useState<string>("2026-08");
  const [pendingUpvoteId, setPendingUpvoteId] = useState<string | null>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Queries
  const activePeriod =
    timeframe === "daily"
      ? selectedDaily
      : timeframe === "monthly"
      ? selectedMonthly
      : timeframe === "weekly"
      ? "2026-08-21"
      : undefined;

  const leaderboard = useQuery(
    api.products.getLeaderboard,
    timeframe !== "makers"
      ? {
          timeframe: timeframe as "daily" | "weekly" | "monthly" | "all_time",
          period: activePeriod,
        }
      : "skip"
  );

  const makerLeaderboard = useQuery(
    api.users.getMakerLeaderboard,
    timeframe === "makers" ? { limit: 30 } : "skip"
  );

  const upvotedIds = useQuery(api.upvotes.getMyUpvotedProductIds) ?? [];
  const toggleUpvote = useMutation(api.upvotes.toggle);

  const handleUpvote = async (productId: Id<"products">) => {
    if (!isSignedIn) {
      router.push(ROUTES.SIGN_IN);
      return;
    }

    try {
      setPendingUpvoteId(productId);
      await toggleUpvote({ productId });
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
    } finally {
      setPendingUpvoteId(null);
    }
  };

  const products = leaderboard?.products ?? [];
  const firstPlace = products[0];
  const secondPlace = products[1];
  const thirdPlace = products[2];
  const remainingProducts = products.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Page Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-border/80 w-full">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="size-8 sm:size-9 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-2xs">
                <Trophy className="size-4 sm:size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Product Leaderboard
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Real-time rankings of top products, daily champions, monthly winners, and top makers.
            </p>
          </div>

          <div className="flex items-center self-start sm:self-center shrink-0">
            <LaunchCountdown />
          </div>
        </div>

        {/* Navigation & Filters Panel */}
        <div className="py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-border/60">
          {/* Main Timeframe Toggle Switcher (Wrapped, No Horizontal Scrolling) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 w-full md:w-auto">
            {(
              [
                { key: "daily", label: "Daily", icon: Trophy },
                { key: "weekly", label: "Weekly", icon: TrendingUp },
                { key: "monthly", label: "Monthly", icon: Crown },
                { key: "all_time", label: "All-Time", icon: Award },
                { key: "makers", label: "Makers", icon: Users },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const isActive = timeframe === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeframe(t.key)}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all select-none cursor-pointer active:scale-95",
                    isActive
                      ? "bg-background text-orange-600 dark:text-orange-400 font-semibold shadow-xs border border-border/80"
                      : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-background/50 font-normal"
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0", isActive ? "text-orange-500" : "text-muted-foreground")} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contextual Date / Month Dropdown (Single Horizontal Line, Zero Line-Wrapping) */}
          {timeframe === "daily" && (
            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">
                Viewing Day:
              </span>
              <DateSelectDropdown
                selectedDate={selectedDaily}
                onSelectDate={setSelectedDaily}
                presets={DAILY_PRESETS}
                maxDate="2026-08-28"
                align="right"
                title="Daily Standings"
              />
            </div>
          )}

          {timeframe === "monthly" && (
            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">
                Viewing Month:
              </span>
              <MonthSelectDropdown
                selectedMonth={selectedMonthly}
                onSelectMonth={setSelectedMonthly}
                options={MONTHLY_PRESETS}
                align="right"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="pt-6 sm:pt-8 w-full">
          {/* MAKER LEADERBOARD TAB */}
          {timeframe === "makers" ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="font-semibold text-base sm:text-lg">Top Community Builders & Makers</h3>
                <span className="text-xs text-muted-foreground font-mono font-normal">Ranked by total upvotes earned</span>
              </div>

              {makerLeaderboard === undefined ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : makerLeaderboard.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground border-dashed font-normal">
                  No makers found yet.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {makerLeaderboard.map((maker) => (
                    <div
                      key={maker._id}
                      className={cn(
                        "p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 border transition-all hover:border-orange-500/50 hover:shadow-md rounded-2xl bg-card group min-h-[84px]",
                        maker.rank === 1 && "bg-gradient-to-r from-amber-500/[0.08] via-card to-card border-amber-400/60 shadow-xs",
                        maker.rank === 2 && "bg-gradient-to-r from-slate-400/[0.08] via-card to-card border-slate-400/60 shadow-xs",
                        maker.rank === 3 && "bg-gradient-to-r from-amber-800/[0.08] via-card to-card border-amber-700/60 shadow-xs",
                        maker.rank > 3 && "border-border/80"
                      )}
                    >
                      {/* Left Side: Rank Badge + Avatar + Maker Info */}
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                        {/* Modern Rank Badge */}
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center font-mono font-semibold text-xs shrink-0 select-none shadow-2xs",
                            maker.rank === 1
                              ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/40"
                              : maker.rank === 2
                              ? "bg-slate-500 text-white shadow-xs ring-2 ring-slate-400/40"
                              : maker.rank === 3
                              ? "bg-amber-800 text-white shadow-xs ring-2 ring-amber-700/40"
                              : "bg-muted text-foreground border border-border/80 group-hover:bg-muted/80"
                          )}
                        >
                          #{maker.rank}
                        </div>

                        {/* Maker Avatar */}
                        <UserAvatar
                          name={maker.name || "Maker"}
                          src={maker.avatarUrl}
                          size="md"
                          className="size-11 sm:size-12 rounded-2xl shrink-0"
                        />

                        {/* Maker Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {maker.name || "Maker"}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono truncate">
                              @{maker.username || "maker"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate leading-relaxed pt-0.5 font-normal">
                            {maker.bio || "Active product creator on Launchpad"}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Upvotes Badge & Launches count */}
                      <div className="flex flex-col items-end shrink-0 pl-1 sm:pl-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-xs font-semibold border border-orange-500/20">
                          <Flame className="size-3.5" />
                          <span>{maker.totalUpvotes.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono pt-1 text-right whitespace-nowrap font-normal">
                          {maker.productCount} {maker.productCount === 1 ? "launch" : "launches"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* PRODUCT LEADERBOARD WITH PODIUM */
            <div className="flex flex-col gap-8">
              {leaderboard === undefined ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No launches recorded for this period"
                  description="There are no published products for this timeframe. Select another date or month above."
                />
              ) : (
                <>
                  {/* TOP 3 PODIUM: #1 IN CENTER ELEVATED HIGHER, #2 ON LEFT, #3 ON RIGHT */}
                  <div className="w-full">
                    <div className="text-center pb-4">
                      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-medium">
                        🏆 Leaderboard Podium
                      </span>
                      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
                        {timeframe === "daily"
                          ? `Champions of ${activePeriod}`
                          : timeframe === "monthly"
                          ? `Top Products of ${activePeriod}`
                          : timeframe === "weekly"
                          ? "This Week's Top Launches"
                          : "All-Time Hall of Fame"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-end pt-4 sm:pt-6">
                      {/* 🥈 #2 Place (Silver - Left) */}
                      {secondPlace && (
                        <div className="order-2 md:order-1 flex flex-col">
                          <Card className="h-full p-4.5 sm:p-5 flex flex-col items-center text-center justify-between gap-4 border border-border/80 bg-card hover:border-orange-500/40 hover:shadow-md transition-all rounded-2xl sm:rounded-3xl min-h-[310px] group">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-slate-500 select-none">
                              <Sparkles className="size-3.5 fill-white/40" />
                              <span>#2 Finalist</span>
                            </span>

                            <UserAvatar
                              name={secondPlace.name}
                              src={secondPlace.logoUrl}
                              size="xl"
                              className="size-14 sm:size-16 rounded-2xl border-2 border-border shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
                            />

                            <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                              <Link href={ROUTES.PRODUCT(secondPlace.slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <h3 className="font-semibold text-base sm:text-lg truncate text-foreground line-clamp-1">{secondPlace.name}</h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 font-normal">{secondPlace.tagline}</p>
                            </div>

                            {/* Upvote Button */}
                            <div className="flex items-center gap-2 pt-1 w-full justify-center">
                              <Button
                                size="sm"
                                onClick={() => handleUpvote(secondPlace._id)}
                                disabled={pendingUpvoteId === secondPlace._id}
                                className={cn(
                                  "font-medium text-xs gap-1.5 shadow-sm px-4 min-h-[36px] transition-all active:scale-95 cursor-pointer",
                                  upvotedIds.includes(secondPlace._id)
                                    ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                                    : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80 font-normal"
                                )}
                              >
                                <ChevronUp className={cn("size-3.5", upvotedIds.includes(secondPlace._id) ? "text-white" : "text-[#FF6154]")} />
                                <span>{upvotedIds.includes(secondPlace._id) ? "Upvoted" : "Upvote"}</span>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold",
                                  upvotedIds.includes(secondPlace._id) ? "bg-black/20 text-white" : "bg-muted text-foreground"
                                  )}>
                                  {secondPlace.upvoteCount}
                                </span>
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* 🥇 #1 Place (Gold Champion - Center, elevated higher) */}
                      {firstPlace && (
                        <div className="order-1 md:order-2 flex flex-col md:-translate-y-4 z-10">
                          <Card className="h-full p-5 sm:p-6 flex flex-col items-center text-center justify-between gap-4.5 border-2 border-amber-500/40 dark:border-amber-500/30 bg-card hover:border-amber-500/80 hover:shadow-lg transition-all rounded-2xl sm:rounded-3xl min-h-[330px] sm:min-h-[350px] group">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold text-xs font-mono shadow-sm shadow-amber-500/25 tracking-tight border border-amber-300 select-none">
                              <Sparkles className="size-3.5 fill-white/40" />
                              <span>#1 Champion</span>
                            </span>

                            <UserAvatar
                              name={firstPlace.name}
                              src={firstPlace.logoUrl}
                              size="xl"
                              className="size-16 sm:size-20 rounded-2xl border-2 border-amber-500/60 shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105"
                            />

                            <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                              <Link href={ROUTES.PRODUCT(firstPlace.slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <h3 className="font-semibold text-lg sm:text-xl text-foreground truncate line-clamp-1">{firstPlace.name}</h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 sm:px-2 font-normal">{firstPlace.tagline}</p>
                            </div>

                            {/* Upvote Button */}
                            <div className="flex items-center gap-2 pt-1 w-full justify-center">
                              <Button
                                size="sm"
                                onClick={() => handleUpvote(firstPlace._id)}
                                disabled={pendingUpvoteId === firstPlace._id}
                                className={cn(
                                  "font-medium text-xs gap-1.5 shadow-md px-5 min-h-[38px] transition-all active:scale-95 cursor-pointer",
                                  upvotedIds.includes(firstPlace._id)
                                    ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                                    : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80 font-normal"
                                )}
                              >
                                <ChevronUp className={cn("size-3.5", upvotedIds.includes(firstPlace._id) ? "text-white" : "text-[#FF6154]")} />
                                <span>{upvotedIds.includes(firstPlace._id) ? "Upvoted" : "Upvote"}</span>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold",
                                  upvotedIds.includes(firstPlace._id) ? "bg-black/20 text-white" : "bg-muted text-foreground"
                                )}>
                                  {firstPlace.upvoteCount}
                                </span>
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* 🥉 #3 Place (Bronze - Right) */}
                      {thirdPlace && (
                        <div className="order-3 md:order-3 flex flex-col">
                          <Card className="h-full p-4.5 sm:p-5 flex flex-col items-center text-center justify-between gap-4 border border-border/80 bg-card hover:border-orange-500/40 hover:shadow-md transition-all rounded-2xl sm:rounded-3xl min-h-[310px] group">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-amber-600 select-none">
                              <Sparkles className="size-3.5 fill-white/40" />
                              <span>#3 Finalist</span>
                            </span>

                            <UserAvatar
                              name={thirdPlace.name}
                              src={thirdPlace.logoUrl}
                              size="xl"
                              className="size-14 sm:size-16 rounded-2xl border-2 border-border shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
                            />

                            <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                              <Link href={ROUTES.PRODUCT(thirdPlace.slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                <h3 className="font-semibold text-base sm:text-lg truncate text-foreground line-clamp-1">{thirdPlace.name}</h3>
                              </Link>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 font-normal">{thirdPlace.tagline}</p>
                            </div>

                            {/* Upvote Button */}
                            <div className="flex items-center gap-2 pt-1 w-full justify-center">
                              <Button
                                size="sm"
                                onClick={() => handleUpvote(thirdPlace._id)}
                                disabled={pendingUpvoteId === thirdPlace._id}
                                className={cn(
                                  "font-medium text-xs gap-1.5 shadow-sm px-4 min-h-[36px] transition-all active:scale-95 cursor-pointer",
                                  upvotedIds.includes(thirdPlace._id)
                                    ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                                    : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80 font-normal"
                                )}
                              >
                                <ChevronUp className={cn("size-3.5", upvotedIds.includes(thirdPlace._id) ? "text-white" : "text-[#FF6154]")} />
                                <span>{upvotedIds.includes(thirdPlace._id) ? "Upvoted" : "Upvote"}</span>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold",
                                  upvotedIds.includes(thirdPlace._id) ? "bg-black/20 text-white" : "bg-muted text-foreground"
                                )}>
                                  {thirdPlace.upvoteCount}
                                </span>
                              </Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RANK 4+ FULL LEADERBOARD TABLE */}
                  {remainingProducts.length > 0 && (
                    <div className="flex flex-col gap-3 pt-4">
                      <div className="flex items-center justify-between pb-1">
                        <h3 className="font-semibold text-base text-foreground">Complete Leaderboard Standings</h3>
                        <span className="text-xs text-muted-foreground font-mono font-normal">Positions #4 to #{products.length}</span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {remainingProducts.map((p) => {
                          const hasUpvoted = upvotedIds.includes(p._id);
                          return (
                            <Card
                              key={p._id}
                              className="p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card hover:bg-orange-500/[0.03] dark:hover:bg-orange-500/[0.06] hover:border-orange-500/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group active:scale-[0.995]"
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <span className="font-mono font-semibold text-xs sm:text-sm text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 w-8 text-center shrink-0 transition-colors">
                                  #{p.rank}
                                </span>

                                <UserAvatar
                                  name={p.name}
                                  src={p.logoUrl}
                                  size="md"
                                  className="size-11 sm:size-12 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200"
                                />

                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Link href={ROUTES.PRODUCT(p.slug)}>
                                      <h4 className="font-medium sm:font-semibold text-sm text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 hover:underline transition-colors">{p.name}</h4>
                                    </Link>
                                    <PricingBadge pricing={p.pricing} />
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate font-normal">{p.tagline}</p>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono pt-0.5 font-normal">
                                    <span>Launched {p.launchDate}</span>
                                    <span>•</span>
                                    <span>{p.commentCount} comments</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                <Link href={ROUTES.PRODUCT(p.slug)}>
                                  <Button variant="outline" size="sm" className="text-xs min-h-[36px] font-normal hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95 transition-all cursor-pointer">
                                    <span>View</span>
                                  </Button>
                                </Link>

                                <Button
                                  size="sm"
                                  onClick={() => handleUpvote(p._id)}
                                  disabled={pendingUpvoteId === p._id}
                                  className={cn(
                                    "font-medium text-xs gap-1.5 min-h-[36px] shadow-xs cursor-pointer transition-all active:scale-95",
                                    hasUpvoted
                                      ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                                      : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80 hover:border-orange-500/40 font-normal"
                                  )}
                                >
                                  <ChevronUp className={cn("size-3.5", hasUpvoted ? "text-white" : "text-[#FF6154]")} />
                                  <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold",
                                    hasUpvoted ? "bg-black/20 text-white" : "bg-muted text-foreground"
                                  )}>
                                    {p.upvoteCount}
                                  </span>
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}