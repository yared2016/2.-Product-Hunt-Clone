"use client";

import {
  TrendingUp,
  Flame,
  MessageSquare,
  Award,
  Users,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductMetrics {
  _id: string;
  name: string;
  slug: string;
  upvoteCount: number;
  commentCount: number;
  launchDate: string;
  pricing: string;
  status: string;
}

interface MakerAnalyticsProps {
  products: ProductMetrics[];
  totalUpvotes: number;
  makerRank?: number;
}

export function MakerAnalytics({
  products,
  totalUpvotes,
  makerRank = 1,
}: MakerAnalyticsProps) {
  const launchedProducts = products.filter((p) => p.status === "launched");
  const totalComments = products.reduce((acc, p) => acc + (p.commentCount || 0), 0);
  const avgUpvotes = launchedProducts.length > 0 ? Math.round(totalUpvotes / launchedProducts.length) : 0;
  const engagementRate = totalUpvotes > 0 ? ((totalComments / totalUpvotes) * 100).toFixed(1) : "0.0";

  // Calculate highest performing launch
  const topProduct = [...launchedProducts].sort((a, b) => b.upvoteCount - a.upvoteCount)[0];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Upvotes */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between gap-3 border border-border/80 bg-gradient-to-br from-orange-500/[0.06] via-card to-card hover:border-orange-500/40 transition-all rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Community Upvotes
            </span>
            <div className="size-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {totalUpvotes.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="size-3" />
              Active
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground font-normal">
            Across {launchedProducts.length} live {launchedProducts.length === 1 ? "launch" : "launches"}
          </p>
        </Card>

        {/* Average Velocity */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between gap-3 border border-border/80 bg-gradient-to-br from-amber-500/[0.06] via-card to-card hover:border-amber-500/40 transition-all rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Launch Velocity
            </span>
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {avgUpvotes}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono font-normal">
              upvotes / launch
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground font-normal">
            Historical launch baseline
          </p>
        </Card>

        {/* Discussions & Community Feedback */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between gap-3 border border-border/80 bg-gradient-to-br from-blue-500/[0.06] via-card to-card hover:border-blue-500/40 transition-all rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Feedback & Discussions
            </span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              {totalComments}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono font-normal">
              reviews ({engagementRate}%)
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground font-normal">
            High community response rate
          </p>
        </Card>

        {/* Global Maker Standing */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between gap-3 border border-border/80 bg-gradient-to-br from-purple-500/[0.06] via-card to-card hover:border-purple-500/40 transition-all rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Maker Standing
            </span>
            <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
              Top Tier
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              Verified
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground font-normal">
            Ranked on Maker Leaderboard
          </p>
        </Card>
      </div>

      {/* Per-Product Velocity & Performance List */}
      <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-orange-500" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              Product Performance & Trajectory Breakdown
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono font-normal">
            {launchedProducts.length} Tracked
          </span>
        </div>

        {launchedProducts.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground font-normal">
            Launch a product to see live analytics and upvote velocity graphs.
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {launchedProducts.map((p) => {
              const percentage = totalUpvotes > 0 ? Math.round((p.upvoteCount / totalUpvotes) * 100) : 0;
              const isTop = topProduct?._id === p._id;

              return (
                <div
                  key={p._id}
                  className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-foreground">
                        {p.name}
                      </span>
                      {isTop && (
                        <Badge variant="accent" className="text-[10px] py-0 px-1.5 gap-1 font-mono">
                          <Sparkles className="size-2.5" />
                          Top Performer
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground font-mono font-normal">
                        ({p.launchDate})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                        <Flame className="size-3" />
                        <span>{p.upvoteCount} upvotes</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                        <MessageSquare className="size-3" />
                        <span>{p.commentCount || 0} reviews</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar of Portfolio Contribution */}
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
