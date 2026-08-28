"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trophy,
  Layers,
  LayoutDashboard,
  Bookmark,
  Sparkles,
  ArrowRight,
  ChevronUp,
  X,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = useQuery(
    api.products.search,
    searchQuery.trim().length > 0 ? { query: searchQuery.trim() } : "skip"
  );

  const handleNavigate = (path: string) => {
    setOpen(false);
    setSearchQuery("");
    router.push(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const QUICK_ACTIONS = [
    {
      title: "Launch a Product",
      description: "Submit your creation to the community",
      icon: Plus,
      href: "/submit",
      color: "text-[#FF6154]",
    },
    {
      title: "Live Leaderboards",
      description: "Daily, weekly, and monthly top rankings",
      icon: Trophy,
      href: "/leaderboard",
      color: "text-amber-500",
    },
    {
      title: "Saved Bookmarks",
      description: "View your saved products and stacks",
      icon: Bookmark,
      href: "/bookmarks",
      color: "text-blue-500",
    },
    {
      title: "Explore Categories",
      description: "Browse AI, Dev Tools, SaaS and more",
      icon: Layers,
      href: "/categories/ai",
      color: "text-purple-500",
    },
    {
      title: "Hall of Fame Awards",
      description: "Golden Kitty and all-time winners",
      icon: Sparkles,
      href: "/awards",
      color: "text-yellow-500",
    },
    {
      title: "Maker Dashboard",
      description: "Manage your launches and drafts",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-emerald-500",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl rounded-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search Launchpad</DialogTitle>
        </DialogHeader>

        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border/80 gap-3">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search products, makers, categories or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />

          {/* Right Action Icons (ESC badge + Close X button with proper spacing) */}
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground select-none">
              ESC
            </kbd>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 flex flex-col gap-3">
          {/* Live Search Products */}
          {searchQuery.trim().length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-1">
                Products Matching &quot;{searchQuery}&quot;
              </div>

              {searchResults === undefined ? (
                <div className="p-4 text-center text-xs text-muted-foreground font-normal">
                  Searching products...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5 font-normal">
                  <span>No products found matching &quot;{searchQuery}&quot;</span>
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/search?q=${encodeURIComponent(searchQuery)}`)}
                    className="text-orange-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium cursor-pointer"
                  >
                    <span>Open full search page</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              ) : (
                searchResults.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleNavigate(`/products/${product.slug}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/70 transition-colors text-left group w-full cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="size-9 rounded-xl border border-border bg-muted shrink-0">
                        {product.logoUrl && <AvatarImage src={product.logoUrl} alt={product.name} />}
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(product.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium sm:font-semibold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-normal capitalize">
                            {product.pricing}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-normal">
                          {product.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      <Badge variant="outline" className="text-xs gap-1 py-0.5 px-2 font-mono font-medium">
                        <ChevronUp className="size-3 text-orange-500" />
                        <span>{product.upvoteCount}</span>
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Quick Navigation & Actions */
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-1">
                Quick Navigation & Commands
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.href}
                      type="button"
                      onClick={() => handleNavigate(action.href)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 transition-colors text-left group cursor-pointer border border-transparent hover:border-border/60"
                    >
                      <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className={`size-4 ${action.color}`} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                          {action.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                          {action.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/80 bg-muted/30 text-[11px] text-muted-foreground font-mono">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span>Press ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
