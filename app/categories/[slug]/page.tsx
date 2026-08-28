"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Compass,
  ArrowRight,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ALL_CATEGORIES = [
  { name: "AI", slug: "ai" },
  { name: "Developer Tools", slug: "developer-tools" },
  { name: "SaaS", slug: "saas" },
  { name: "Design Tools", slug: "design-tools" },
  { name: "Productivity", slug: "productivity" },
  { name: "Marketing", slug: "marketing" },
  { name: "Crypto", slug: "crypto" },
  { name: "Open Source", slug: "open-source" },
];

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  const data = useQuery(api.products.listByCategory, { categorySlug: slug });
  const upvotedProductIds = useQuery(api.upvotes.getMyUpvotedProductIds) ?? [];
  const toggleUpvote = useMutation(api.upvotes.toggle);

  const handleToggleUpvote = async (productId: Id<"products">) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    try {
      await toggleUpvote({ productId });
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors group min-h-[36px]"
          >
            <ChevronLeft data-icon="inline-start" className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Category Pill Switcher (Wrapped, No Horizontal Scrolling) */}
        <div className="flex flex-wrap items-center gap-2 pb-6">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = cat.slug === slug;
            return (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                <button
                  type="button"
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs transition-all select-none cursor-pointer border min-h-[38px] active:scale-95",
                    isActive
                      ? "bg-[#FF6154]/10 text-orange-600 dark:text-orange-400 border-orange-500/40 font-medium"
                      : "border-border/80 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 font-normal"
                  )}
                >
                  {cat.name}
                </button>
              </Link>
            );
          })}
        </div>

        {data === undefined ? (
          <div className="flex flex-col gap-4">
            <div className="h-24 w-full bg-muted/40 rounded-2xl animate-pulse" />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : data === null ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-dashed">
            <Compass className="size-10 text-muted-foreground opacity-40" />
            <h3 className="font-semibold text-base">Category not found</h3>
            <p className="text-xs text-muted-foreground max-w-sm font-normal">
              The category you requested does not exist. Choose one from the list above.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Category Header Banner */}
            <div className="flex flex-col gap-2 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border border-border/80">
              <div className="flex items-center gap-2">
                <Badge variant="accent" className="text-xs font-normal">
                  Category
                </Badge>
                <span className="text-xs text-muted-foreground font-mono font-normal">
                  {data.products.length} {data.products.length === 1 ? "product" : "products"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {data.category.name}
              </h1>
              {data.category.description && (
                <p className="text-sm text-muted-foreground max-w-2xl font-normal">
                  {data.category.description}
                </p>
              )}
            </div>

            {/* Products List */}
            <div className="flex flex-col gap-3">
              {data.products.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-dashed">
                  <Layers className="size-10 text-muted-foreground opacity-40" />
                  <h3 className="font-semibold text-base">No products launched yet in this category</h3>
                  <p className="text-xs text-muted-foreground max-w-sm font-normal">
                    Be the first maker to launch a product in {data.category.name}!
                  </p>
                  <Link href="/submit">
                    <Button size="sm" className="mt-2 bg-[#FF6154] hover:bg-[#FF6154]/90 text-white gap-1.5 font-medium min-h-[44px]">
                      <span>Launch in {data.category.name}</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </Card>
              ) : (
                data.products.map((product, idx) => (
                  <div
                    key={product._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <ProductCard
                      product={product}
                      rank={idx + 1}
                      hasUpvoted={upvotedProductIds.includes(product._id)}
                      onUpvote={() => handleToggleUpvote(product._id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
