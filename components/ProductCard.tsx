"use client";

import React, { memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import { NotifyMeButton } from "@/components/NotifyMeButton";
import { UserAvatar } from "@/components/UserAvatar";
import { PricingBadge } from "@/components/PricingBadge";
import { ProBadge } from "@/components/ProBadge";
import { ROUTES, PricingType } from "@/lib/constants";
import {
  ChevronUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: {
    _id: Id<"products">;
    name: string;
    slug: string;
    tagline: string;
    pricing: PricingType | string;
    categories: string[];
    upvoteCount: number;
    commentCount: number;
    isFeatured?: boolean;
    isPromoted?: boolean;
    promoBadgeText?: string;
    status: "draft" | "scheduled" | "launched";
    launchDate: string;
    logoUrl?: string | null;
  };
  rank?: number;
  hasUpvoted?: boolean;
  isUpvoting?: boolean;
  onUpvote?: (e: React.MouseEvent) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  rank,
  hasUpvoted = false,
  isUpvoting = false,
  onUpvote,
}: ProductCardProps) {
  const router = useRouter();
  const isScheduled = product.status === "scheduled";
  const productUrl = ROUTES.PRODUCT(product.slug);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("[data-no-card-click]")) {
      return;
    }
    router.push(productUrl);
  }, [router, productUrl]);

  const handleCommentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${productUrl}#comments`);
  }, [router, productUrl]);

  return (
    <div className="w-full">
      <Card
        onClick={handleCardClick}
        className={cn(
          "p-3 sm:p-4 transition-all cursor-pointer group active:scale-[0.998]",
          product.isPromoted
            ? "border-amber-500/60 dark:border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-sm shadow-amber-500/10 hover:border-amber-500"
            : "hover:border-orange-500/40 hover:shadow-xs bg-card/70 hover:bg-card"
        )}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Left Column: Rank + Logo + Content */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
            {/* Optional Rank */}
            {rank !== undefined && (
              <div className="hidden sm:flex items-center justify-center size-5 text-xs font-mono font-medium text-muted-foreground/70 shrink-0">
                {rank}
              </div>
            )}

            {/* Product Logo Link */}
            <Link
              href={productUrl}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 group/logo"
            >
              <UserAvatar
                name={product.name}
                src={product.logoUrl}
                size="lg"
                className="size-11 sm:size-13 rounded-xl sm:rounded-2xl border-border/80 group-hover/logo:scale-105 transition-transform bg-gradient-to-br from-orange-500/10 to-amber-500/10"
              />
            </Link>

            {/* Text Info */}
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Link
                  href={productUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium sm:font-semibold text-sm sm:text-base text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors tracking-tight truncate hover:underline"
                >
                  {product.name}
                </Link>

                {/* Pro Sponsored Boost Badge */}
                {product.isPromoted && (
                  <ProBadge variant="sponsored" text={product.promoBadgeText} />
                )}

                {product.isFeatured && (
                  <Badge variant="accent" className="text-[10px] py-0 px-1.5 gap-0.5 font-medium hidden xs:inline-flex">
                    <Sparkles className="size-2.5" />
                    <span>Featured</span>
                  </Badge>
                )}
                {isScheduled && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/5">
                    Upcoming Launch
                  </Badge>
                )}
                <span className="hidden sm:inline-flex">
                  <PricingBadge pricing={product.pricing} />
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-relaxed font-normal">
                {product.tagline}
              </p>

              {/* Categories, Comments & Bookmark */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {product.categories.slice(0, 2).map((cat) => (
                    <Link
                      key={cat}
                      href={ROUTES.CATEGORIES(cat.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs py-0 px-1.5 font-normal text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 transition-colors cursor-pointer"
                      >
                        {cat}
                      </Badge>
                    </Link>
                  ))}
                  {product.categories.length > 2 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      +{product.categories.length - 2}
                    </span>
                  )}
                </div>

                <span className="text-border text-xs hidden xs:inline">•</span>

                {/* Comment Counter Button */}
                <button
                  type="button"
                  onClick={handleCommentClick}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer group/comment p-0.5 rounded"
                  title={`${product.commentCount} discussions`}
                  aria-label={`${product.commentCount} comments on ${product.name}`}
                >
                  <MessageSquare className="size-3 sm:size-3.5 group-hover/comment:scale-110 transition-transform" />
                  <span className="font-medium font-mono">{product.commentCount}</span>
                </button>

                {/* Bookmark Button */}
                <div onClick={(e) => e.stopPropagation()} data-no-card-click>
                  <BookmarkButton productId={product._id} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upvote Button / Notify Me */}
          <div className="flex items-center gap-2 shrink-0 pl-1">
            {isScheduled ? (
              <div onClick={(e) => e.stopPropagation()} data-no-card-click>
                <NotifyMeButton productId={product._id} />
              </div>
            ) : (
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                onClick={onUpvote}
                disabled={isUpvoting}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] h-13 sm:h-14 p-0 rounded-xl transition-all cursor-pointer select-none active:scale-95 group/btn",
                  hasUpvoted
                    ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border-transparent shadow-[0_2px_8px_rgba(255,97,84,0.3)] ring-2 ring-[#FF6154]/20"
                    : "border-border/80 hover:border-orange-500/60 hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
                aria-label={`Upvote ${product.name} (Current: ${product.upvoteCount})`}
              >
                <ChevronUp
                  className={cn(
                    "size-4.5 sm:size-5 transition-transform group-hover/btn:-translate-y-0.5",
                    hasUpvoted ? "text-white stroke-[2.5]" : "text-muted-foreground group-hover/btn:text-orange-500 stroke-[2]"
                  )}
                />
                <span
                  className={cn(
                    "text-xs sm:text-xs font-bold leading-none font-mono",
                    hasUpvoted ? "text-white" : "text-foreground group-hover/btn:text-orange-600 dark:group-hover/btn:text-orange-400"
                  )}
                >
                  {product.upvoteCount}
                </span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});
