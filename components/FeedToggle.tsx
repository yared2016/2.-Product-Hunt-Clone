"use client";

import { Flame, Sparkles, Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedFilterType = "featured" | "trending" | "all";

interface FeedToggleProps {
  value: FeedFilterType;
  onChange: (value: FeedFilterType) => void;
}

export function FeedToggle({ value, onChange }: FeedToggleProps) {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/80 shadow-2xs gap-1">
      {/* Featured Toggle */}
      <button
        type="button"
        onClick={() => onChange("featured")}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all select-none cursor-pointer whitespace-nowrap",
          value === "featured"
            ? "bg-background text-foreground shadow-xs font-medium ring-1 ring-border/80"
            : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-background/80 font-normal"
        )}
      >
        <Sparkles
          data-icon="inline-start"
          className={cn(
            "size-3.5 transition-colors",
            value === "featured" ? "text-orange-500" : "text-muted-foreground"
          )}
        />
        <span>Featured</span>
      </button>

      {/* Trending Toggle */}
      <button
        type="button"
        onClick={() => onChange("trending")}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all select-none cursor-pointer whitespace-nowrap",
          value === "trending"
            ? "bg-background text-foreground shadow-xs font-medium ring-1 ring-border/80"
            : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-background/80 font-normal"
        )}
      >
        <TrendingUp
          data-icon="inline-start"
          className={cn(
            "size-3.5 transition-colors",
            value === "trending" ? "text-[#FF6154]" : "text-muted-foreground"
          )}
        />
        <span>Trending</span>
      </button>

      {/* All Launches Toggle */}
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all select-none cursor-pointer whitespace-nowrap",
          value === "all"
            ? "bg-background text-foreground shadow-xs font-medium ring-1 ring-border/80"
            : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-background/80 font-normal"
        )}
      >
        <Layers
          data-icon="inline-start"
          className={cn(
            "size-3.5 transition-colors",
            value === "all" ? "text-foreground" : "text-muted-foreground"
          )}
        />
        <span>All</span>
      </button>
    </div>
  );
}