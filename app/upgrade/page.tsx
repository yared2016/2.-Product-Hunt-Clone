"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { ClerkPricingTableSafe } from "@/components/ClerkPricingTableSafe";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Zap,
  Crown,
  Check,
  Sparkles,
  Rocket,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Star,
  Users,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UpgradePage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const profile = useQuery(api.users.getMyProfile);

  const upgradeToProMutation = useMutation(api.users.upgradeToPro);
  const downgradeToFreeMutation = useMutation(api.users.downgradeToFree);

  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isPro = Boolean(profile?.isPro || profile?.plan === "pro");

  const handleDevUpgradeToggle = async () => {
    try {
      setIsProcessing(true);
      if (isPro) {
        await downgradeToFreeMutation();
        toast.success("Downgraded to Free Plan", {
          description: "Your account is now on the default community free tier.",
        });
      } else {
        await upgradeToProMutation();
        toast.success("Welcome to Pro Superuser! 👑", {
          description: "Your account has been upgraded. You can now boost your launches to the top!",
        });
      }
    } catch (err) {
      console.error("Failed to toggle plan:", err);
      toast.error("Failed to update subscription status");
    } finally {
      setIsProcessing(false);
    }
  };

  const FAQS = [
    {
      q: "What is the Pro Superuser plan?",
      a: "The Pro Superuser plan ($99/month) is designed for serious makers, indie hackers, and startup founders who want maximum visibility for their products. Pro users can boost their launched products directly to the top of daily feeds and rankings with exclusive PRO SPONSORED badging.",
    },
    {
      q: "How does the Top of Feed (Sponsored Boost) work?",
      a: "When you boost a product, our ranking algorithm places your listing at the top slot of the daily leaderboard, homepage discovery feed, and category filters with a vibrant Pro aura, giving your launch 5-10x more visibility and community upvotes.",
    },
    {
      q: "Can I launch products on the Free plan?",
      a: "Yes! Every user on Launchpad starts on the Free tier ($0) and can create unlimited product launches, join community discussions, and earn badges. Pro is for creators seeking an algorithmic visibility superpower.",
    },
    {
      q: "How does billing work?",
      a: "Subscriptions are billed monthly at $99/month via Clerk's secure billing engine. You can upgrade, change payment methods, or cancel anytime with one click.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3 pb-8 sm:pb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-purple-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-semibold shadow-xs">
            <Crown className="size-3.5 text-amber-500" />
            <span>Launchpad Superuser Memberships</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Supercharge Your Product Launches
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-normal">
            Gain unfair algorithmic advantage. Boost your products to the top of daily rankings, stand out with radiant Pro badging, and reach thousands of daily tech enthusiasts.
          </p>

          {/* Current Status Pill */}
          {isSignedIn && profile && (
            <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-muted/70 border border-border text-xs">
              <span className="text-muted-foreground">Current Plan:</span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Crown className="size-3.5" />
                  <span>Pro Superuser ($99/mo)</span>
                </span>
              ) : (
                <span className="font-semibold text-foreground">Free Community Plan ($0)</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto pb-12">
          {/* Card 1: Free Community Plan */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-border bg-card shadow-xs relative">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-foreground">Free Tier</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">For indie makers getting started</p>
                </div>
                <Badge variant="outline" className="text-xs font-normal">Default</Badge>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="h-px bg-border/60" />

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-muted-foreground font-normal">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Unlimited product submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Public maker profile & portfolio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Community comments & upvotes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>Standard algorithmic leaderboard feed</span>
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="size-4 flex items-center justify-center font-bold text-xs">—</span>
                  <span className="line-through">Top of feed sponsored placement</span>
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <span className="size-4 flex items-center justify-center font-bold text-xs">—</span>
                  <span className="line-through">Radiant PRO gold badge</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border/50">
              <Button
                variant="outline"
                disabled={!isPro}
                onClick={handleDevUpgradeToggle}
                className="w-full min-h-[42px] font-normal cursor-pointer"
              >
                {!isPro ? "Current Active Plan" : "Switch to Free Tier"}
              </Button>
            </div>
          </Card>

          {/* Card 2: Pro Superuser Plan ($99/mo) */}
          <Card className="p-6 sm:p-8 flex flex-col justify-between border-2 border-orange-500/80 bg-gradient-to-b from-orange-500/5 via-card to-card shadow-xl shadow-orange-500/10 relative overflow-hidden">
            {/* Top Popular Pill */}
            <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="size-3" />
              <span>Superuser</span>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                    <span>Pro Superuser</span>
                    <Crown className="size-5 text-amber-500 fill-amber-500/20" />
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-0.5">
                    For serious creators seeking 10x launch growth
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground">$99</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="h-px bg-orange-500/30" />

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="size-3 font-bold" />
                  </div>
                  <span><strong>Top of Feed Boost:</strong> Push listings to #1 on daily rankings</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="size-3 font-bold" />
                  </div>
                  <span><strong>Radiant PRO SPONSORED Badge:</strong> Golden glowing aura on cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="size-3 font-bold" />
                  </div>
                  <span><strong>Pro Maker Crown:</strong> Stand out across comments & profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="size-3 font-bold" />
                  </div>
                  <span><strong>Real-time Upvote Velocity:</strong> In-depth traffic metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Check className="size-3 font-bold" />
                  </div>
                  <span><strong>Priority Search Indexing:</strong> Top search query results</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-orange-500/20 flex flex-col gap-2">
              <Button
                onClick={handleDevUpgradeToggle}
                disabled={isProcessing}
                className="w-full min-h-[44px] bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white font-bold shadow-md hover:shadow-orange-500/30 active:scale-95 transition-all cursor-pointer gap-2"
              >
                {isProcessing ? (
                  <Spinner className="size-4" />
                ) : isPro ? (
                  <>
                    <Crown className="size-4 text-amber-200" />
                    <span>Manage Pro Superuser</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    <span>Upgrade to Pro ($99/mo)</span>
                  </>
                )}
              </Button>

              <span className="text-[11px] text-center text-muted-foreground font-normal">
                Billed monthly via Clerk Billing. Cancel anytime in 1 click.
              </span>
            </div>
          </Card>
        </div>

        {/* Official Clerk Pricing Table Section */}
        <div className="my-10 pt-8 border-t border-border/80 flex flex-col items-center">
          <div className="text-center max-w-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Official Clerk Billing Gateway
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
              Direct checkout powered by Clerk’s drop-in component infrastructure.
            </p>
          </div>

          <div className="w-full max-w-3xl rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm overflow-hidden">
            <ClerkPricingTableSafe isPro={isPro} fallbackPlanAction={handleDevUpgradeToggle} />
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="my-12 pt-8 border-t border-border/80">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Detailed Plan Comparison
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
              Compare features side-by-side to choose what best fits your goals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 font-semibold text-foreground">Launch Capability</th>
                  <th className="py-3 px-4 font-semibold text-center text-foreground w-36">Free ($0)</th>
                  <th className="py-3 px-4 font-semibold text-center text-orange-600 dark:text-orange-400 w-44">
                    Pro Superuser ($99)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Product Submissions</td>
                  <td className="py-3 px-4 text-center font-medium text-foreground">Unlimited</td>
                  <td className="py-3 px-4 text-center font-bold text-orange-600 dark:text-orange-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Top of Feed Placement (Sponsored Boost)</td>
                  <td className="py-3 px-4 text-center text-muted-foreground opacity-40">—</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Radiant PRO / SPONSORED Badge</td>
                  <td className="py-3 px-4 text-center text-muted-foreground opacity-40">—</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Maker Profile Crown Badge</td>
                  <td className="py-3 px-4 text-center text-muted-foreground opacity-40">—</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Upvote & Comment Analytics</td>
                  <td className="py-3 px-4 text-center font-medium text-foreground">Standard</td>
                  <td className="py-3 px-4 text-center font-bold text-orange-600 dark:text-orange-400">
                    Real-time Velocity
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-muted-foreground">Maker Dashboard Launch Boost Manager</td>
                  <td className="py-3 px-4 text-center text-muted-foreground opacity-40">—</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="size-4 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="my-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
              Everything you need to know about the Launchpad Pro Superuser plan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => (
              <Card
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="p-4 sm:p-5 cursor-pointer hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground">{faq.q}</h4>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                      openFaq === idx ? "rotate-180 text-orange-500" : ""
                    )}
                  />
                </div>
                {openFaq === idx && (
                  <p className="pt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal animate-in fade-in-0">
                    {faq.a}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="my-12 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to dominate the leaderboard?</h3>
            <p className="text-xs sm:text-sm text-white/90 font-normal max-w-lg">
              Join top founders and get your products noticed by thousands of active users today.
            </p>
          </div>

          <Button
            onClick={handleDevUpgradeToggle}
            size="lg"
            className="bg-white hover:bg-white/90 text-orange-600 font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0 px-6 cursor-pointer"
          >
            <Crown className="size-4 mr-2 text-amber-500 fill-amber-500" />
            <span>{isPro ? "Manage Subscription" : "Upgrade to Pro"}</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
