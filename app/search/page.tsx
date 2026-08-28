"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "AI",
  "Developer Tools",
  "SaaS",
  "Design Tools",
  "Productivity",
  "Marketing",
  "Crypto",
  "Open Source",
];

const PRICING_OPTIONS = [
  { label: "All Pricing", value: undefined },
  { label: "Free", value: "free" as const },
  { label: "Freemium", value: "freemium" as const },
  { label: "Paid", value: "paid" as const },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPricing, setSelectedPricing] = useState<"free" | "freemium" | "paid" | undefined>(
    undefined
  );

  const router = useRouter();
  const { isSignedIn } = useAuth();

  const searchResults = useQuery(api.products.search, {
    query: searchTerm,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    pricing: selectedPricing,
  });

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
        {/* Header & Search Input */}
        <div className="flex flex-col gap-6 pb-8 border-b border-border/80">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Search Products
            </h1>
            <p className="text-sm text-muted-foreground font-normal">
              Search across tech products, developer tools, and productivity software.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, tagline, description, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-10 h-12 text-sm sm:text-base rounded-2xl bg-muted/40 border-border/80 focus-visible:ring-orange-500/20 font-normal"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Categories (Wrapped, No Horizontal Scrolling) */}
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs transition-all select-none cursor-pointer border min-h-[38px] active:scale-95",
                      isSelected
                        ? "bg-[#FF6154]/10 text-orange-600 dark:text-orange-400 border-orange-500/40 font-medium"
                        : "border-border/80 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 font-normal"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Pricing Model Selector (Wrapped) */}
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/80 shrink-0">
              {PRICING_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedPricing(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-all select-none cursor-pointer min-h-[36px] active:scale-95",
                    selectedPricing === opt.value
                      ? "bg-background text-orange-600 dark:text-orange-400 shadow-xs font-medium ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 font-normal"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="pt-8 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-normal">
            <span>
              {searchResults ? `${searchResults.length} results found` : "Searching..."}
            </span>
            {(searchTerm || selectedCategory !== "All" || selectedPricing) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedPricing(undefined);
                }}
                className="text-orange-600 dark:text-orange-400 hover:underline cursor-pointer min-h-[36px] flex items-center font-normal"
              >
                Reset filters
              </button>
            )}
          </div>

          {searchResults === undefined ? (
            <div className="flex flex-col gap-3">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : searchResults.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-dashed">
              <SearchIcon className="size-10 text-muted-foreground opacity-40" />
              <h3 className="font-semibold text-base">No products match your search</h3>
              <p className="text-xs text-muted-foreground max-w-sm font-normal">
                Try searching for a different keyword, removing filters, or browsing by category.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {searchResults.map((product, idx) => (
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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
