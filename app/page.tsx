"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { DateNav } from "@/components/DateNav";
import { FeedToggle, FeedFilterType } from "@/components/FeedToggle";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Sidebar } from "@/components/Sidebar";
import { HomeLeaderboardWidget } from "@/components/HomeLeaderboardWidget";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import { EmptyState } from "@/components/EmptyState";
import { BASE_DATE, ROUTES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Rocket, TrendingUp, Flame, Calendar, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendingTimeframe = "today" | "week" | "month" | "year";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>(BASE_DATE);
  const [selectedFilter, setSelectedFilter] = useState<FeedFilterType>("featured");
  const [trendingTimeframe, setTrendingTimeframe] = useState<TrendingTimeframe>("today");
  const [pendingUpvoteId, setPendingUpvoteId] = useState<string | null>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Queries
  const dateProducts = useQuery(
    api.products.listByDate,
    selectedFilter !== "trending"
      ? {
          date: selectedDate,
          filter: selectedFilter,
        }
      : "skip"
  );

  const trendingProducts = useQuery(
    api.products.listTrending,
    selectedFilter === "trending"
      ? {
          timeframe: trendingTimeframe,
          limit: 30,
        }
      : "skip"
  );

  const products = selectedFilter === "trending" ? trendingProducts : dateProducts;

  const upvotedIds = useQuery(api.upvotes.getMyUpvotedProductIds) ?? [];
  const toggleUpvote = useMutation(api.upvotes.toggle);

  const handleUpvote = useCallback(async (productId: Id<"products">) => {
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
  }, [isSignedIn, router, toggleUpvote]);

  const TRENDING_TIMEFRAMES: Array<{ key: TrendingTimeframe; label: string; icon: string }> = [
    { key: "today", label: "Trending Today", icon: "🔥" },
    { key: "week", label: "This Week", icon: "⚡" },
    { key: "month", label: "This Month", icon: "🌟" },
    { key: "year", label: "This Year", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Top Control Bar: Date Nav (Left), Countdown (Center), Feed Toggle (Right) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border/60 w-full">
          {/* Left: Date Step & Custom Dropdown */}
          <div className="shrink-0 flex items-center">
            <DateNav
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (selectedFilter === "trending") {
                  setSelectedFilter("featured");
                }
              }}
            />
          </div>

          {/* Center: Live 24h Launch Countdown Clock */}
          <div className="flex items-center justify-center shrink-0">
            <LaunchCountdown />
          </div>

          {/* Right: Feed Toggle Switcher */}
          <div className="flex items-center justify-end shrink-0">
            <FeedToggle value={selectedFilter} onChange={setSelectedFilter} />
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-5 sm:pt-6 w-full">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3 sm:gap-4 min-w-0">
            {/* Live Today's Leaderboard Insight Widget */}
            {selectedDate === "2026-08-28" && selectedFilter !== "trending" && (
              <HomeLeaderboardWidget />
            )}

            {/* Trending Sub-Filter Bar (Wrapped, No Horizontal Scrolling) */}
            {selectedFilter === "trending" && (
              <div className="flex flex-wrap items-center gap-1.5 pb-1 pt-0.5">
                {TRENDING_TIMEFRAMES.map((tf) => {
                  const isActive = trendingTimeframe === tf.key;
                  return (
                    <button
                      key={tf.key}
                      type="button"
                      onClick={() => setTrendingTimeframe(tf.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all select-none cursor-pointer border min-h-[36px] active:scale-95",
                        isActive
                          ? "bg-[#FF6154] text-white border-[#FF6154] font-medium shadow-xs"
                          : "border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 font-normal"
                      )}
                    >
                      <span>{tf.icon}</span>
                      <span>{tf.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feed Header */}
            <div className="flex items-center justify-between pb-0.5">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                {selectedFilter === "trending" ? (
                  <span className="flex items-center gap-1.5 text-foreground">
                    <TrendingUp className="size-4 text-[#FF6154]" />
                    <span>
                      {trendingTimeframe === "today"
                        ? "Trending Today"
                        : trendingTimeframe === "week"
                        ? "Trending This Week"
                        : trendingTimeframe === "month"
                        ? "Trending This Month"
                        : "Trending This Year"}
                    </span>
                  </span>
                ) : (
                  <span>
                    {selectedDate === BASE_DATE
                      ? "Today's Launches"
                      : selectedDate === "2026-08-27"
                      ? "Yesterday's Launches"
                      : `Launches for ${selectedDate}`}
                  </span>
                )}

                {products && (
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                    {products.length} {products.length === 1 ? "product" : "products"}
                  </span>
                )}
              </h2>

              {selectedFilter === "trending" && (
                <span className="text-xs text-muted-foreground font-mono hidden sm:inline-flex items-center gap-1 font-normal">
                  <Flame className="size-3 text-orange-500" />
                  <span>Ranked by community momentum</span>
                </span>
              )}
            </div>

            {/* Product Feed List */}
            {products === undefined ? (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title="No launches found"
                description={
                  selectedFilter === "trending"
                    ? "No trending products found for this timeframe. Check out Today's discover feed!"
                    : `No products were launched on ${selectedDate}. Be the first to launch!`
                }
                actionLabel={selectedFilter !== "trending" ? "Submit Product" : undefined}
                actionHref={selectedFilter !== "trending" ? ROUTES.SUBMIT : undefined}
              />
            ) : (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {products.map((product, idx) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    rank={idx + 1}
                    hasUpvoted={upvotedIds.includes(product._id)}
                    isUpvoting={pendingUpvoteId === product._id}
                    onUpvote={() => handleUpvote(product._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 min-w-0">
            <Sidebar />
          </div>
        </div>
      </main>
    </div>
  );
}