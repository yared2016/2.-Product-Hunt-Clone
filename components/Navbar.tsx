"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background page scrolling when mobile menu is open
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

  const openCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, metaKey: true })
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2)] transition-all">
      <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-1.5 sm:gap-4 w-full">
        {/* Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
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
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95",
                pathname === "/"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                  : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/8 hover:border-orange-500/15 font-normal"
              )}
            >
              Products
            </Link>
            <Link
              href="/leaderboard"
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95",
                pathname === "/leaderboard"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                  : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/8 hover:border-orange-500/15 font-normal"
              )}
            >
              Leaderboard
            </Link>
            <Link
              href="/categories/ai"
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95",
                pathname.startsWith("/categories")
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                  : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/8 hover:border-orange-500/15 font-normal"
              )}
            >
              Categories
            </Link>
            <Link
              href="/awards"
              className={cn(
                "px-3 py-1.5 rounded-xl text-sm transition-all whitespace-nowrap active:scale-95",
                pathname === "/awards"
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/25 shadow-2xs"
                  : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/8 hover:border-orange-500/15 font-normal"
              )}
            >
              Hall of Fame
            </Link>
          </nav>
        </div>

        {/* Right Navigation & Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Search Button (Desktop) */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden lg:inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-orange-500/5 hover:border-orange-500/40 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-all min-h-[36px] active:scale-95 text-xs cursor-pointer w-36 xl:w-48 font-normal shadow-2xs hover:shadow-xs group/search"
          >
            <div className="flex items-center gap-2 truncate">
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

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Launch Button */}
          <Link href="/submit" className="shrink-0">
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
                    <Link href="/sign-in">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground min-h-[36px] text-xs cursor-pointer"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[36px] text-xs cursor-pointer"
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
                        },
                      }}
                    >
                      <UserButton.MenuItems>
                        <UserButton.Link
                          label="Maker Dashboard"
                          labelIcon={<LayoutDashboard className="size-4 text-muted-foreground" />}
                          href="/dashboard"
                        />
                        <UserButton.Link
                          label="Saved Bookmarks"
                          labelIcon={<Bookmark className="size-4 text-muted-foreground" />}
                          href="/bookmarks"
                        />
                        <UserButton.Link
                          label="Maker Profile & Settings"
                          labelIcon={<User className="size-4 text-muted-foreground" />}
                          href="/profile"
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

    {/* Full-Screen Mobile Drawer - Positioned outside header so it is not clipped by backdrop-filter */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-[100] w-full border-t border-border bg-background px-4 py-5 overflow-y-auto overscroll-contain flex flex-col justify-between gap-6 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-4">
            {/* Main Exploration Links */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-1">
                Explore
              </span>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === "/"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <Rocket className="size-4 text-muted-foreground" />
                  <span>Products Feed</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCommandPalette();
                }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 text-left transition-colors min-h-[44px] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Search className="size-4 text-muted-foreground" />
                  <span>Search Products (⌘K)</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </button>

              <Link
                href="/categories/ai"
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
                href="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === "/leaderboard"
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
                href="/awards"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  pathname === "/awards"
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
            </div>

            {/* Account Links */}
            {mounted && (
              <SignedIn>
                <div className="pt-2 border-t border-border flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-1">
                    My Account
                  </span>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === "/dashboard"
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
                    href="/bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === "/bookmarks"
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
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                      pathname === "/profile"
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
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full justify-center min-h-[44px] font-medium text-sm cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-[#FF6154] hover:bg-[#FF6154]/90 text-white min-h-[44px] font-medium text-sm cursor-pointer">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            )}
          </div>

          {/* Launch CTA pinned at the bottom of the mobile drawer */}
          <div className="pt-3 pb-2 border-t border-border">
            <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-semibold min-h-[46px] gap-2 shadow-xs cursor-pointer text-sm">
                <Plus className="size-4" />
                <span>Submit / Launch a Product</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
