"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProBadge } from "@/components/ProBadge";
import { ROUTES } from "@/lib/constants";
import {
  Rocket,
  Search,
  Plus,
  Menu,
  X,
  Trophy,
  Layers,
  Sparkles,
  Bookmark,
  User,
  LayoutDashboard,
  ChevronRight,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.HOME, label: "Products", exact: true },
  { href: ROUTES.LEADERBOARD, label: "Leaderboard" },
  { href: ROUTES.CATEGORIES("ai"), label: "Categories", matchPrefix: "/categories" },
  { href: ROUTES.AWARDS, label: "Hall of Fame" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const profile = useQuery(api.users.getMyProfile);
  const isPro = Boolean(profile?.isPro || profile?.plan === "pro");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true })
    );
  }, []);

  const isNavItemActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) return pathname === item.href;
    if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
    return pathname === item.href;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2)] transition-all">
        <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-1.5 sm:gap-4 w-full">
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink-0">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 group shrink-0">
              <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-tr from-orange-600 via-[#FF6154] to-amber-500 flex items-center justify-center text-white shadow-[0_2px_10px_rgba(255,97,84,0.35)] group-hover:scale-105 transition-transform active:scale-95 shrink-0">
                <Rocket className="size-4 sm:size-5" />
              </div>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Launchpad
                </span>
                <Badge
                  variant="accent"
                  className="hidden sm:inline-flex text-[10px] px-1.5 py-0 font-normal"
                >
                  v1.0
                </Badge>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              {NAV_ITEMS.map((item) => {
                const active = isNavItemActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95",
                      active
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                        : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/8 hover:border-orange-500/15 font-normal"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Search + Pro Badge/CTA + Notifications + Theme + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Search Shortcut (Desktop) */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden lg:flex items-center justify-between gap-3 h-9 px-3 text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-border/80 rounded-xl transition-all w-52 xl:w-64 cursor-pointer group/search shadow-2xs hover:border-orange-500/40"
              aria-label="Search Launchpad"
            >
              <div className="flex items-center gap-2 truncate font-normal">
                <Search className="size-3.5 shrink-0 group-hover/search:text-orange-500 transition-colors" />
                <span className="truncate">Search products...</span>
              </div>
              <kbd className="pointer-events-none hidden h-4.5 select-none items-center gap-1 rounded-md border border-border/80 bg-background/80 px-1.5 font-mono text-[9px] font-medium opacity-100 xl:inline-flex shrink-0 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Quick Search Icon Button (Mobile) */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="lg:hidden size-8 sm:size-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors shrink-0 cursor-pointer active:scale-95"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>

            {/* Notification Bell */}
            {mounted && <NotificationBell />}

            {/* Pro Badge or Upgrade CTA */}
            {mounted && (
              isPro ? (
                <Link href={ROUTES.UPGRADE} className="hidden sm:inline-flex shrink-0">
                  <ProBadge variant="crown" text="PRO" />
                </Link>
              ) : (
                <Link href={ROUTES.UPGRADE} className="hidden md:inline-flex shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 min-h-[34px] sm:min-h-[36px] font-semibold transition-all hover:scale-105 cursor-pointer"
                  >
                    <Zap className="size-3.5 fill-current" />
                    <span>Upgrade</span>
                  </Button>
                </Link>
              )
            )}

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Launch Button */}
            <Link href={ROUTES.SUBMIT} className="shrink-0">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white font-medium shadow-[0_2px_10px_rgba(255,97,84,0.3)] hover:shadow-[0_4px_16px_rgba(255,97,84,0.45)] hover:scale-[1.03] active:scale-95 transition-all min-h-[34px] sm:min-h-[36px] px-3 sm:px-3.5 text-xs sm:text-sm cursor-pointer gap-1.5"
              >
                <Plus className="size-3.5" />
                <span className="hidden xs:inline sm:inline">Submit Launch</span>
              </Button>
            </Link>

            {/* Auth Profile */}
            <div className="flex items-center shrink-0">
              {!mounted ? (
                <div className="size-8 rounded-full bg-muted/60 animate-pulse" />
              ) : (
                <>
                  <SignedOut>
                    <div className="hidden sm:flex items-center gap-1">
                      <Link href={ROUTES.SIGN_IN}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground min-h-[36px] text-xs cursor-pointer font-normal"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href={ROUTES.SIGN_UP}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[36px] text-xs cursor-pointer font-normal"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center justify-center p-0.5 rounded-full ring-2 ring-orange-500/40 hover:ring-orange-500/70 transition-all shrink-0">
                      <UserButton
                        appearance={{
                          elements: {
                            rootBox: "flex items-center justify-center shrink-0",
                            userButtonAvatarBox: "size-7 sm:size-8 rounded-full border border-border shadow-xs",
                            userButtonPopoverCard: "rounded-2xl border border-border shadow-2xl bg-background",
                            userButtonPopoverActionButton: "hover:bg-muted/80 text-foreground transition-colors",
                            userButtonPopoverActionButtonText: "text-foreground font-medium text-xs",
                            userButtonPopoverActionButtonIcon: "text-muted-foreground",
                            userButtonPopoverActionButton__manageAccount: "hidden",
                          },
                        }}
                      >
                        <UserButton.MenuItems>
                          <UserButton.Link
                            label={isPro ? "Manage Pro Superuser" : "⚡ Upgrade to Pro ($99/mo)"}
                            labelIcon={<Crown className="size-4 text-amber-500" />}
                            href={ROUTES.UPGRADE}
                          />
                          <UserButton.Link
                            label="Maker Dashboard"
                            labelIcon={<LayoutDashboard className="size-4 text-muted-foreground" />}
                            href={ROUTES.DASHBOARD}
                          />
                          <UserButton.Link
                            label="Saved Bookmarks"
                            labelIcon={<Bookmark className="size-4 text-muted-foreground" />}
                            href={ROUTES.BOOKMARKS}
                          />
                          <UserButton.Link
                            label="Maker Profile & Settings"
                            labelIcon={<User className="size-4 text-muted-foreground" />}
                            href={ROUTES.PROFILE}
                          />
                        </UserButton.MenuItems>
                      </UserButton>
                    </div>
                  </SignedIn>
                </>
              )}
            </div>

            {/* Mobile Hamburger / Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden size-8 sm:size-9 p-0 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in-0 flex flex-col pt-16">
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
            {/* Search Bar in Mobile Drawer */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCommandPalette();
              }}
              className="flex items-center justify-between w-full h-11 px-4 text-sm text-muted-foreground bg-muted/60 border border-border rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="size-4 text-orange-500" />
                <span>Search products, categories, makers...</span>
              </div>
              <kbd className="h-5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
                ⌘K
              </kbd>
            </button>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-1">
                Explore
              </span>
              <Link
                href={ROUTES.HOME}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === ROUTES.HOME
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <Rocket className="size-4 text-orange-500" />
                  <span>Discover Products</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </Link>

              <Link
                href={ROUTES.CATEGORIES("ai")}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname.startsWith("/categories")
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <Layers className="size-4 text-muted-foreground" />
                  <span>Categories</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </Link>

              <Link
                href={ROUTES.LEADERBOARD}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === ROUTES.LEADERBOARD
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="size-4 text-muted-foreground" />
                  <span>Leaderboard</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </Link>

              <Link
                href={ROUTES.AWARDS}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === ROUTES.AWARDS
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="size-4 text-muted-foreground" />
                  <span>Hall of Fame</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </Link>

              <Link
                href={ROUTES.UPGRADE}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === ROUTES.UPGRADE
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 font-semibold"
                )}
              >
                <div className="flex items-center gap-3">
                  <Crown className="size-4 text-amber-500 fill-amber-500" />
                  <span>{isPro ? "Pro Superuser Active" : "Upgrade to Pro ($99/mo)"}</span>
                </div>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/40 text-amber-600">
                  {isPro ? "PRO" : "$99"}
                </Badge>
              </Link>
            </div>

            {/* Account Links */}
            {mounted && (
              <SignedIn>
                <div className="pt-2 border-t border-border flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-1">
                    My Account
                  </span>
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === ROUTES.DASHBOARD
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="size-4 text-muted-foreground" />
                      <span>Maker Dashboard</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50" />
                  </Link>
                  <Link
                    href={ROUTES.BOOKMARKS}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === ROUTES.BOOKMARKS
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Bookmark className="size-4 text-muted-foreground" />
                      <span>Saved Bookmarks</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50" />
                  </Link>
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === ROUTES.PROFILE
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <User className="size-4 text-muted-foreground" />
                      <span>Public Maker Profile</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50" />
                  </Link>
                </div>
              </SignedIn>
            )}

            {/* Signed Out Auth CTA */}
            {mounted && (
              <SignedOut>
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  <Link href={ROUTES.SIGN_IN} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center min-h-[44px] font-medium">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={ROUTES.SIGN_UP} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium min-h-[44px]">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            )}
          </div>
        </div>
      )}
    </>
  );
}
