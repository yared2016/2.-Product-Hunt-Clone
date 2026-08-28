"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronUp, ArrowRight } from "lucide-react";

interface SimilarProductsProps {
  productId: Id<"products">;
  currentProductName: string;
}

export function SimilarProducts({
  productId,
  currentProductName,
}: SimilarProductsProps) {
  const similarProducts = useQuery(api.products.getSimilarProducts, {
    productId,
    limit: 4,
  });

  if (!similarProducts || similarProducts.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-3.5 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-orange-500" />
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Similar to {currentProductName}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-normal">
          Recommended by category
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {similarProducts.map((p) => (
          <Link key={p._id} href={`/products/${p.slug}`} className="block group">
            <Card className="p-3.5 hover:border-orange-500/40 hover:shadow-xs transition-all bg-card/70 hover:bg-card flex items-start gap-3">
              <Avatar className="size-10 rounded-xl border border-border bg-muted shrink-0 group-hover:scale-105 transition-transform">
                {p.logoUrl && <AvatarImage src={p.logoUrl} alt={p.name} />}
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(p.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium sm:font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                    {p.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono gap-0.5 shrink-0 font-normal">
                    <ChevronUp className="size-2.5 text-orange-500" />
                    <span>{p.upvoteCount}</span>
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1 font-normal">
                  {p.tagline}
                </p>

                <div className="flex items-center gap-1.5 pt-1">
                  {p.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] text-muted-foreground bg-muted/80 px-1.5 py-0.2 rounded font-normal"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
