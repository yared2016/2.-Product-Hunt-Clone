"use client";

import {
  Trophy,
  Rocket,
  Flame,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MakerStats {
  launchCount: number;
  totalUpvotes: number;
  totalComments: number;
  hasChampionLaunch?: boolean;
}

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  bgGradient: string;
  borderColor: string;
  isUnlocked: (stats: MakerStats) => boolean;
  progress: (stats: MakerStats) => { current: number; max: number; label: string };
}

const BADGES: BadgeDef[] = [
  {
    id: "pioneer",
    name: "Early Pioneer",
    description: "Joined Launchpad during the v1.0 foundational cohort.",
    icon: Sparkles,
    color: "text-amber-500",
    bgGradient: "from-amber-500/15 via-orange-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    isUnlocked: () => true, // Unlocked by default for active users
    progress: () => ({ current: 1, max: 1, label: "Unlocked" }),
  },
  {
    id: "serial_maker",
    name: "Serial Maker",
    description: "Successfully launched 3 or more tech creations.",
    icon: Rocket,
    color: "text-orange-500",
    bgGradient: "from-orange-500/15 via-[#FF6154]/10 to-transparent",
    borderColor: "border-orange-500/30",
    isUnlocked: (s) => s.launchCount >= 3,
    progress: (s) => ({
      current: Math.min(s.launchCount, 3),
      max: 3,
      label: `${s.launchCount}/3 Launches`,
    }),
  },
  {
    id: "velocity_master",
    name: "Velocity Master",
    description: "Earned 100+ total community upvotes across all products.",
    icon: Flame,
    color: "text-red-500",
    bgGradient: "from-red-500/15 via-orange-500/10 to-transparent",
    borderColor: "border-red-500/30",
    isUnlocked: (s) => s.totalUpvotes >= 100,
    progress: (s) => ({
      current: Math.min(s.totalUpvotes, 100),
      max: 100,
      label: `${s.totalUpvotes}/100 Upvotes`,
    }),
  },
  {
    id: "daily_champion",
    name: "Podium Finalist",
    description: "Reached Top 3 on the Daily or Monthly Leaderboard.",
    icon: Trophy,
    color: "text-yellow-500",
    bgGradient: "from-yellow-500/15 via-amber-500/10 to-transparent",
    borderColor: "border-yellow-500/30",
    isUnlocked: (s) => !!s.hasChampionLaunch || s.totalUpvotes >= 50,
    progress: (s) => ({
      current: s.hasChampionLaunch ? 1 : Math.min(s.totalUpvotes, 50),
      max: s.hasChampionLaunch ? 1 : 50,
      label: s.hasChampionLaunch ? "Podium Champion" : `${s.totalUpvotes}/50 Upvotes`,
    }),
  },
  {
    id: "community_voice",
    name: "Community Voice",
    description: "Active reviewer and contributor in product discussions.",
    icon: MessageSquare,
    color: "text-blue-500",
    bgGradient: "from-blue-500/15 via-indigo-500/10 to-transparent",
    borderColor: "border-blue-500/30",
    isUnlocked: (s) => s.totalComments >= 5 || s.launchCount >= 1,
    progress: (s) => ({
      current: Math.max(s.totalComments, s.launchCount ? 5 : 0),
      max: 5,
      label: "Active Contributor",
    }),
  },
];

export function MakerBadges({
  stats = { launchCount: 0, totalUpvotes: 0, totalComments: 0 },
}: {
  stats?: MakerStats;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-orange-500" />
          <h3 className="font-semibold text-sm sm:text-base text-foreground">
            Maker Achievements & Milestones
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono font-normal">
          {BADGES.filter((b) => b.isUnlocked(stats)).length}/{BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {BADGES.map((badge) => {
          const unlocked = badge.isUnlocked(stats);
          const prog = badge.progress(stats);
          const Icon = badge.icon;
          const pct = Math.round((prog.current / prog.max) * 100);

          return (
            <Card
              key={badge.id}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs",
                unlocked
                  ? `border-border/80 bg-gradient-to-br ${badge.bgGradient} hover:shadow-xs hover:${badge.borderColor}`
                  : "border-border/60 bg-muted/20 opacity-75"
              )}
            >
              {/* Badge Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "size-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-2xs",
                      unlocked
                        ? `${badge.color} bg-background border-border`
                        : "text-muted-foreground bg-muted border-border/60"
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {badge.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                      {badge.description}
                    </span>
                  </div>
                </div>

                {unlocked ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                ) : (
                  <Lock className="size-3.5 text-muted-foreground/60 shrink-0" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{unlocked ? "Completed" : "Progress"}</span>
                  <span>{prog.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      unlocked ? "bg-gradient-to-r from-orange-500 to-[#FF6154]" : "bg-muted-foreground/40"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
