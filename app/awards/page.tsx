"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { PricingBadge } from "@/components/PricingBadge";
import { ROUTES } from "@/lib/constants";
import {
  Trophy,
  Medal,
  Crown,
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AwardsPage() {
  const router = useRouter();

  const leaderboard = useQuery(api.awards.getLeaderboard, { limit: 20 });

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3.5 pb-10 sm:pb-12 border-b border-border/80">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-medium uppercase tracking-wider shadow-xs">
            <Trophy className="size-4 text-amber-500 fill-amber-500/20" />
            <span>Launchpad Hall of Fame</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Top Ranked Products
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-normal max-w-xl leading-relaxed">
            Recognizing the most upvoted and acclaimed tech products launched by creators and makers on Launchpad.
          </p>
        </div>

        {/* Podium Top 3 Section */}
        {leaderboard === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 items-end">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-84 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
        ) : top3.length === 0 ? (
          <Card className="p-12 text-center mt-10 border-dashed">
            <p className="text-sm text-muted-foreground font-normal">No ranked products yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-8 sm:pt-10 items-end">
            {/* 🥈 2nd Place (Silver - Left) */}
            {top3[1] && (
              <div className="order-2 md:order-1 flex flex-col">
                <Card className="h-full p-4.5 sm:p-6 flex flex-col items-center text-center justify-between gap-4 border border-border/80 bg-card hover:border-orange-500/40 hover:shadow-md transition-all rounded-2xl sm:rounded-3xl min-h-[320px] group">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-slate-500 select-none">
                    <Sparkles className="size-3.5 fill-white/40" />
                    <span>#2 Product of the Day</span>
                  </span>

                  <UserAvatar
                    name={top3[1].name}
                    src={top3[1].logoUrl}
                    size="xl"
                    className="size-16 sm:size-20 rounded-2xl border-2 border-border shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />

                  <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                    <Link href={ROUTES.PRODUCT(top3[1].slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground tracking-tight line-clamp-1">{top3[1].name}</h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 font-normal">{top3[1].tagline}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60 w-full">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono font-medium text-xs">
                      <Flame className="size-3.5 text-orange-500 fill-orange-500 shrink-0" />
                      <span>{top3[1].upvoteCount} upvotes</span>
                    </div>
                    <Link href={ROUTES.PRODUCT(top3[1].slug)}>
                      <Button variant="outline" size="sm" className="min-h-[36px] px-3.5 font-medium text-xs hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all active:scale-95 cursor-pointer">
                        <span>View</span>
                        <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}

            {/* 🥇 1st Place (Gold Champion - Center, elevated higher) */}
            {top3[0] && (
              <div className="order-1 md:order-2 flex flex-col md:-translate-y-4 z-10">
                <Card className="h-full p-5 sm:p-7 flex flex-col items-center text-center justify-between gap-4.5 border-2 border-amber-500/40 dark:border-amber-500/30 bg-card hover:border-amber-500/80 hover:shadow-xl hover:bg-amber-500/[0.03] transition-all rounded-2xl sm:rounded-3xl min-h-[340px] sm:min-h-[360px] group active:scale-[0.995]">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold text-xs font-mono shadow-sm shadow-amber-500/25 tracking-tight border border-amber-300 select-none">
                    <Sparkles className="size-3.5 fill-white/40" />
                    <span>#1 Product of the Day</span>
                  </span>

                  <UserAvatar
                    name={top3[0].name}
                    src={top3[0].logoUrl}
                    size="xl"
                    className="size-18 sm:size-22 rounded-2xl border-2 border-amber-500/60 shadow-md shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />

                  <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                    <Link href={ROUTES.PRODUCT(top3[0].slug)}>
                      <h3 className="font-semibold text-lg sm:text-xl text-foreground tracking-tight line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{top3[0].name}</h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 sm:px-2 font-normal">{top3[0].tagline}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-border/60 w-full">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono font-medium text-xs">
                      <Flame className="size-4 text-orange-500 fill-orange-500 shrink-0" />
                      <span>{top3[0].upvoteCount} upvotes</span>
                    </div>
                    <Link href={ROUTES.PRODUCT(top3[0].slug)}>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 via-[#FF6154] to-red-500 hover:from-orange-600 hover:to-[#FF6154]/90 text-white min-h-[36px] px-4 sm:px-5 font-medium text-xs shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
                        <span>View</span>
                        <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}

            {/* 🥉 3rd Place (Bronze - Right) */}
            {top3[2] && (
              <div className="order-3 md:order-3 flex flex-col">
                <Card className="h-full p-4.5 sm:p-6 flex flex-col items-center text-center justify-between gap-4 border border-border/80 bg-card hover:border-orange-500/50 hover:shadow-lg hover:bg-orange-500/[0.02] transition-all rounded-2xl sm:rounded-3xl min-h-[320px] group active:scale-[0.995]">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-amber-600 select-none">
                    <Sparkles className="size-3.5 fill-white/40" />
                    <span>#3 Product of the Day</span>
                  </span>

                  <UserAvatar
                    name={top3[2].name}
                    src={top3[2].logoUrl}
                    size="xl"
                    className="size-16 sm:size-20 rounded-2xl border-2 border-border shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />

                  <div className="flex flex-col gap-1.5 w-full flex-1 justify-center">
                    <Link href={ROUTES.PRODUCT(top3[2].slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground tracking-tight line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{top3[2].name}</h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed px-1 font-normal">{top3[2].tagline}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60 w-full">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-mono font-medium text-xs">
                      <Flame className="size-3.5 text-orange-500 fill-orange-500 shrink-0" />
                      <span>{top3[2].upvoteCount} upvotes</span>
                    </div>
                    <Link href={ROUTES.PRODUCT(top3[2].slug)}>
                      <Button variant="outline" size="sm" className="min-h-[36px] px-3.5 font-medium text-xs hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-all active:scale-95 cursor-pointer">
                        <span>View</span>
                        <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* All-Time Leaderboard List */}
        {rest.length > 0 && (
          <div className="pt-12 sm:pt-16 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
              <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Sparkles className="size-4 text-orange-500" />
                <span>All-Time Leaderboard</span>
              </h2>
              <span className="text-xs text-muted-foreground font-mono font-normal">
                Top {leaderboard?.length} Products
              </span>
            </div>

            <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              {rest.map((p, idx) => (
                <div
                  key={p._id}
                  className="p-3.5 sm:p-4 hover:bg-orange-500/[0.04] dark:hover:bg-orange-500/[0.08] transition-all flex items-center justify-between gap-3 sm:gap-4 group/item cursor-pointer active:scale-[0.995]"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <span className="font-mono text-xs sm:text-sm font-semibold text-muted-foreground group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 w-6 text-center shrink-0 transition-colors">
                      #{idx + 4}
                    </span>

                    {/* Square Logo */}
                    <UserAvatar
                      name={p.name}
                      src={p.logoUrl}
                      size="md"
                      className="size-11 sm:size-12 rounded-xl shrink-0 group-hover/item:scale-105 transition-transform duration-200"
                    />

                    {/* Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={ROUTES.PRODUCT(p.slug)}>
                          <span className="font-medium sm:font-semibold text-sm text-foreground truncate hover:underline group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors">
                            {p.name}
                          </span>
                        </Link>
                        {p.categories && p.categories[0] && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                            {p.categories[0]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-normal">
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Upvotes & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20 group-hover/item:bg-orange-500/20 group-hover/item:scale-105 transition-all">
                      <Flame className="size-3.5" />
                      <span>{p.upvoteCount}</span>
                    </div>

                    <Link
                      href={ROUTES.PRODUCT(p.slug)}
                      className="size-8 rounded-xl flex items-center justify-center text-muted-foreground bg-muted/40 border border-border/40 group-hover/item:border-transparent group-hover/item:bg-gradient-to-r group-hover/item:from-orange-500 group-hover/item:to-[#FF6154] group-hover/item:text-white hover:!from-orange-600 hover:!to-[#FF6154] hover:!text-white hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-2xs group-hover/item:shadow-xs shrink-0"
                    >
                      <ArrowRight className="size-4 transition-transform group-hover/item:translate-x-0.5 text-inherit" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
