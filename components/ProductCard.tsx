"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookmarkButton } from "@/components/BookmarkButton";
import { NotifyMeButton } from "@/components/NotifyMeButton";
import {
  ChevronUp,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    _id: Id<"products">;
    name: string;
    slug: string;
    tagline: string;
    pricing: "free" | "freemium" | "paid";
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

export function ProductCard({
  product,
  rank,
  hasUpvoted = false,
  isUpvoting = false,
  onUpvote,
}: ProductCardProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case "free":
        return (
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
            Free
          </Badge>
        );
      case "freemium":
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
            Freemium
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
            Paid
          </Badge>
        );
      default:
        return null;
    }
  };

  const isScheduled = product.status === "scheduled";

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("[data-no-card-click]")) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.slug}#comments`);
  };

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
              href={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 group/logo"
            >
              <Avatar className="size-11 sm:size-13 rounded-xl sm:rounded-2xl border border-border/80 shadow-2xs group-hover/logo:scale-105 transition-transform bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                {product.logoUrl && <AvatarImage src={product.logoUrl} alt={product.name} />}
                <AvatarFallback className="rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm bg-muted text-foreground">
                  {getInitials(product.name)}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Text Info */}
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium sm:font-semibold text-sm sm:text-base text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors tracking-tight truncate hover:underline"
                >
                  {product.name}
                </Link>

                {/* Pro Sponsored Boost Badge */}
                {product.isPromoted && (
                  <Badge className="text-[10px] py-0 px-2 gap-1 font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-0 shadow-2xs animate-in fade-in-0">
                    <Zap className="size-2.5 fill-current" />
                    <span>{product.promoBadgeText || "PRO SPONSORED"}</span>
                  </Badge>
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
                  {getPricingBadge(product.pricing)}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-relaxed font-normal">
                {product.tagline}
              </p>

              {/* Categories, Comments & Bookmark */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                {product.categories.slice(0, 2).map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant="secondary"
                      className="text-[10px] py-0 px-1.5 font-normal bg-muted/80 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
                    >
                      {cat}
                    </Badge>
                  </Link>
                ))}
                {product.categories.length > 2 && (
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    +{product.categories.length - 2}
                  </span>
                )}

                <div className="flex items-center gap-1.5 ml-auto sm:ml-1 pl-1">
                  {/* Interactive Clickable Comment Button */}
                  <button
                    type="button"
                    onClick={handleCommentClick}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 dark:hover:bg-orange-500/15 border border-transparent hover:border-orange-500/30 transition-all cursor-pointer select-none active:scale-95 group/comment"
                    title={`View ${product.commentCount} discussion comments`}
                  >
                    <MessageSquare className="size-3.5 group-hover/comment:text-orange-600 dark:group-hover/comment:text-orange-400 transition-colors" />
                    <span className="font-medium">{product.commentCount}</span>
                  </button>

                  <div onClick={(e) => e.stopPropagation()}>
                    <BookmarkButton productId={product._id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upvote Button OR NotifyMe Button */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isScheduled ? (
              <NotifyMeButton productId={product._id} />
            ) : (
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                disabled={isUpvoting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpvote?.(e);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-12 sm:h-14 w-12 sm:w-14 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none active:scale-90",
                  hasUpvoted
                    ? "bg-[#FF6154] text-white border-[#FF6154] hover:bg-[#FF6154]/90 shadow-xs"
                    : "border-border/80 hover:border-orange-500/50 hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 bg-background/50"
                )}
              >
                <ChevronUp
                  data-icon="inline-start"
                  className={cn(
                    "size-4 sm:size-4.5 shrink-0 transition-transform",
                    isUpvoting && "animate-pulse"
                  )}
                />
                <span className="font-semibold text-[11px] sm:text-xs tracking-tight font-mono">
                  {product.upvoteCount}
                </span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
