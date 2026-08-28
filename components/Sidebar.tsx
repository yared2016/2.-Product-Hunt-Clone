"use client";

import Link from "next/link";
import { Rocket, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES, ROUTES } from "@/lib/constants";

export function Sidebar() {
  return (
    <aside className="@container flex flex-col gap-5 w-full">
      {/* Launch CTA Card */}
      <Card className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/30 overflow-hidden relative">
        <div className="absolute -right-4 -bottom-4 size-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium text-xs uppercase tracking-wider">
            <Rocket className="size-3.5" />
            <span>Launch Your Product</span>
          </div>
          <CardTitle className="text-sm sm:text-base font-semibold pt-1">Have something great to share?</CardTitle>
          <CardDescription className="text-xs font-normal">
            Join thousands of makers and showcase your next big idea to an active tech community.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Link href={ROUTES.SUBMIT} className="block">
            <Button size="sm" className="w-full bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium gap-1.5 shadow-xs cursor-pointer">
              <span>Submit a Product</span>
              <ArrowRight data-icon="inline-end" className="size-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Trending Categories */}
      <Card className="p-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground uppercase tracking-wider">
            <TrendingUp className="size-3.5 text-orange-500" />
            <span>Explore Categories</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={ROUTES.CATEGORIES(cat.slug)}>
              <Badge
                variant="outline"
                className="cursor-pointer text-xs py-1 px-2.5 font-normal hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/40 transition-colors"
              >
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </Card>

      {/* Hall of Fame Teaser */}
      <Card className="p-4 bg-muted/40">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="size-4" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <h4 className="font-semibold text-xs text-foreground">Hall of Fame</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-normal">
              Check out top-ranked products of the day, week, and month.
            </p>
            <Link href={ROUTES.AWARDS} className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline pt-1 inline-flex items-center gap-1">
              <span>View Leaderboard</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
}
