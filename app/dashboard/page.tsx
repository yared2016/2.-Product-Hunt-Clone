"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth, useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { MakerAnalytics } from "@/components/MakerAnalytics";
import { MakerBadges } from "@/components/MakerBadges";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Rocket,
  Clock,
  FileEdit,
  Plus,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Flame,
  Calendar,
  Hammer,
  Trash2,
  AlertTriangle,
  User,
  Check,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const products = useQuery(api.products.listBySubmitter);
  const profile = useQuery(api.users.getMyProfile);

  const publishNowMutation = useMutation(api.products.publishNow);
  const removeProductMutation = useMutation(api.products.remove);

  const [publishingId, setPublishingId] = useState<Id<"products"> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"products"> | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: Id<"products">; name: string } | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("launched");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const launchedProducts = products?.filter((p) => p.status === "launched") ?? [];
  const scheduledProducts = products?.filter((p) => p.status === "scheduled") ?? [];
  const draftProducts = products?.filter((p) => p.status === "draft") ?? [];
  const totalUpvotes = launchedProducts.reduce((acc, p) => acc + (p.upvoteCount || 0), 0);
  const totalComments = launchedProducts.reduce((acc, p) => acc + (p.commentCount || 0), 0);

  const handlePublishNow = async (productId: Id<"products">, productName: string) => {
    try {
      setPublishingId(productId);
      await publishNowMutation({
        productId,
        launchDate: "2026-08-28",
      });
      setActionSuccessMessage(`Successfully published ${productName} live to Today's feed!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Failed to publish product:", err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeletingId(productToDelete.id);
      await removeProductMutation({ productId: productToDelete.id });
      setActionSuccessMessage(`Deleted ${productToDelete.name}.`);
      setProductToDelete(null);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-border/80 w-full">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="size-12 sm:size-14 rounded-2xl border border-border shadow-xs shrink-0 bg-muted">
              {user?.imageUrl && <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} />}
              <AvatarFallback className="rounded-2xl font-semibold text-sm bg-muted text-foreground">
                {user?.fullName ? getInitials(user.fullName) : "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  Maker Dashboard
                </h1>
                <Link href="/profile">
                  <Badge variant="outline" className="text-[10px] gap-1 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 cursor-pointer font-normal">
                    <User className="size-2.5" />
                    <span>Edit Profile</span>
                  </Badge>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate font-normal">
                Manage your submitted products, launches, drafts, and schedule tests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="min-h-[40px] gap-1.5 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all">
                <User className="size-4 text-muted-foreground" />
                <span>My Profile</span>
              </Button>
            </Link>

            <Link href="/submit" className="group">
              <Button
                size="sm"
                className="bg-[#FF6154] hover:bg-[#e04f43] text-white font-semibold gap-2 shadow-xs hover:shadow-md hover:shadow-orange-500/25 min-h-[40px] px-4 text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-orange-500/30"
              >
                <Plus data-icon="inline-start" className="size-4 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                <span>Submit Product</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Action Banner */}
        {actionSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
            <Check className="size-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {!isSignedIn ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl my-8 flex flex-col items-center gap-3">
            <Rocket className="size-10 text-orange-500 opacity-60" />
            <h3 className="font-semibold text-base">Sign in to view your dashboard</h3>
            <p className="text-xs text-muted-foreground max-w-sm font-normal">
              You need to be logged in to manage your submitted products and drafts.
            </p>
            <Link href="/sign-in">
              <Button className="bg-[#FF6154] text-white font-medium">Sign In</Button>
            </Link>
          </div>
        ) : (
          /* Dashboard Tabs */
          <div className="pt-6 sm:pt-8 w-full flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-3 w-full flex flex-wrap h-auto gap-1.5 p-1.5 bg-muted/60">
                <TabsTrigger
                  value="launched"
                  className={cn(
                    "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                    activeTab === "launched"
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-orange-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                  )}
                >
                  <Rocket className={cn("size-3.5 transition-transform duration-200", activeTab === "launched" ? "text-orange-500 scale-110" : "text-muted-foreground")} />
                  <span>Launched ({launchedProducts.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="scheduled"
                  className={cn(
                    "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                    activeTab === "scheduled"
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-amber-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                  )}
                >
                  <Clock className={cn("size-3.5 transition-transform duration-200", activeTab === "scheduled" ? "text-amber-500 scale-110" : "text-muted-foreground")} />
                  <span>Scheduled ({scheduledProducts.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="drafts"
                  className={cn(
                    "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                    activeTab === "drafts"
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-blue-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                  )}
                >
                  <FileEdit className={cn("size-3.5 transition-transform duration-200", activeTab === "drafts" ? "text-blue-500 scale-110" : "text-muted-foreground")} />
                  <span>Drafts ({draftProducts.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="analytics"
                  className={cn(
                    "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                    activeTab === "analytics"
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-purple-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                  )}
                >
                  <BarChart3 className={cn("size-3.5 transition-transform duration-200", activeTab === "analytics" ? "text-purple-500 scale-110" : "text-muted-foreground")} />
                  <span>Analytics & Velocity</span>
                </TabsTrigger>

                <TabsTrigger
                  value="badges"
                  className={cn(
                    "flex-1 sm:flex-initial gap-2 text-xs sm:text-sm cursor-pointer min-h-[38px] transition-all duration-200",
                    activeTab === "badges"
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80 border-b-2 border-b-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60 hover:shadow-2xs font-normal"
                  )}
                >
                  <ShieldCheck className={cn("size-3.5 transition-transform duration-200", activeTab === "badges" ? "text-emerald-500 scale-110" : "text-muted-foreground")} />
                  <span>Milestones & Badges</span>
                </TabsTrigger>
              </TabsList>

              {/* Active Tab View Indicator */}
              <div className="flex items-center justify-between pb-4 pt-1 text-xs text-muted-foreground border-b border-border/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">Active Section:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-xs border border-orange-500/25">
                    {activeTab === "launched" && <Rocket className="size-3 text-orange-500" />}
                    {activeTab === "scheduled" && <Clock className="size-3 text-amber-500" />}
                    {activeTab === "drafts" && <FileEdit className="size-3 text-blue-500" />}
                    {activeTab === "analytics" && <BarChart3 className="size-3 text-purple-500" />}
                    {activeTab === "badges" && <ShieldCheck className="size-3 text-emerald-500" />}
                    <span>
                      {activeTab === "launched" && `Live Launches (${launchedProducts.length})`}
                      {activeTab === "scheduled" && `Scheduled Launches (${scheduledProducts.length})`}
                      {activeTab === "drafts" && `Draft Products (${draftProducts.length})`}
                      {activeTab === "analytics" && "Maker Analytics & Upvote Velocity"}
                      {activeTab === "badges" && "Milestones & Badges Showcase"}
                    </span>
                  </span>
                </div>
                <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground/80">
                  {activeTab === "launched" && "Currently live on Leaderboard & Discover Feed"}
                  {activeTab === "scheduled" && "Queued to auto-publish on target launch date"}
                  {activeTab === "drafts" && "Private drafts saved to your maker account"}
                  {activeTab === "analytics" && "Real-time upvotes, velocity & engagement metrics"}
                  {activeTab === "badges" && "Maker progression milestones & unlocked badges"}
                </span>
              </div>

              {/* Launched Tab */}
              <TabsContent value="launched">
                {products === undefined ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : launchedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20 gap-3">
                    <Rocket className="size-8 text-muted-foreground opacity-50" />
                    <h4 className="font-semibold text-sm">No launched products yet</h4>
                    <p className="text-xs text-muted-foreground font-normal">
                      Ready to share your creation with the world? Launch a product today.
                    </p>
                    <Link href="/submit">
                      <Button size="sm" variant="outline" className="mt-1 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400">
                        Launch Product
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {launchedProducts.map((p) => (
                      <Card key={p._id} className="p-3.5 sm:p-4 hover:border-border transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
                          {/* Left Column */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="size-11 sm:size-12 rounded-xl border border-border shadow-2xs shrink-0 bg-muted">
                              {p.logoUrl && <AvatarImage src={p.logoUrl} alt={p.name} />}
                              <AvatarFallback className="rounded-xl font-semibold text-xs bg-muted text-foreground">
                                {getInitials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/products/${p.slug}`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                  <h3 className="font-medium sm:font-semibold text-sm text-foreground truncate hover:underline">{p.name}</h3>
                                </Link>
                                <Badge variant="secondary" className="text-[10px] capitalize py-0 px-1.5 font-normal">
                                  {p.pricing}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate font-normal">{p.tagline}</p>
                              <div className="flex items-center gap-2.5 sm:gap-3.5 text-[11px] text-muted-foreground font-mono pt-0.5 flex-wrap font-normal">
                                <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                  <Calendar className="size-3 text-orange-500 shrink-0" />
                                  <span className="font-medium text-foreground">{p.launchDate}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                  <Flame className="size-3 text-orange-500 shrink-0" />
                                  <span>{p.upvoteCount} upvotes</span>
                                </span>
                                <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                                  <MessageSquare className="size-3 text-muted-foreground shrink-0" />
                                  <span>{p.commentCount} comments</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Actions */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                            <Link href={`/products/${p.slug}`}>
                              <Button variant="outline" size="sm" className="gap-1 min-h-[36px] text-xs font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all">
                                <span>View</span>
                                <ChevronRight className="size-3.5" />
                              </Button>
                            </Link>

                            <Link href={`/products/${p.slug}/edit`}>
                              <Button variant="outline" size="sm" className="gap-1 min-h-[36px] text-xs border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-normal">
                                <Hammer className="size-3" />
                                <span>Edit</span>
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete({ id: p._id, name: p.name })}
                              className="size-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Scheduled Tab */}
              <TabsContent value="scheduled">
                {products === undefined ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : scheduledProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20 gap-3">
                    <Clock className="size-8 text-muted-foreground opacity-50" />
                    <h4 className="font-semibold text-sm">No scheduled launches</h4>
                    <p className="text-xs text-muted-foreground font-normal">
                      Schedule a future launch date on the submit page to build anticipation and buzz.
                    </p>
                    <Link href="/submit">
                      <Button size="sm" variant="outline" className="mt-1 font-normal">
                        Schedule a Launch
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {scheduledProducts.map((p) => (
                      <Card key={p._id} className="p-3.5 sm:p-4 border-amber-500/30 bg-amber-500/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="size-11 sm:size-12 rounded-xl border border-border shadow-2xs shrink-0 bg-muted">
                              {p.logoUrl && <AvatarImage src={p.logoUrl} alt={p.name} />}
                              <AvatarFallback className="rounded-xl font-semibold text-xs bg-muted text-foreground">
                                {getInitials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/products/${p.slug}`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                  <h3 className="font-medium sm:font-semibold text-sm text-foreground truncate hover:underline">{p.name}</h3>
                                </Link>
                                <Badge variant="accent" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-normal">
                                  Scheduled
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate font-normal">{p.tagline}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-mono pt-0.5 font-normal">
                                <Calendar className="size-3 shrink-0" />
                                <span>Scheduled for {p.launchDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Scheduled Actions (Instant Launch Test!) */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                            <Button
                              size="sm"
                              onClick={() => handlePublishNow(p._id, p.name)}
                              disabled={publishingId === p._id}
                              className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium text-xs gap-1.5 min-h-[36px] shadow-xs cursor-pointer"
                            >
                              {publishingId === p._id ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Rocket className="size-3" />
                              )}
                              <span>Publish Live Now (Test Launch)</span>
                            </Button>

                            <Link href={`/products/${p.slug}/edit`}>
                              <Button variant="outline" size="sm" className="gap-1 min-h-[36px] text-xs font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all">
                                <Hammer className="size-3" />
                                <span>Edit</span>
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete({ id: p._id, name: p.name })}
                              className="size-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Drafts Tab */}
              <TabsContent value="drafts">
                {products === undefined ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : draftProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20 gap-3">
                    <FileEdit className="size-8 text-muted-foreground opacity-50" />
                    <h4 className="font-semibold text-sm">No drafts saved</h4>
                    <p className="text-xs text-muted-foreground font-normal">
                      Save drafts while preparing your launch materials and screenshots.
                    </p>
                    <Link href="/submit">
                      <Button size="sm" variant="outline" className="mt-1 font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400">
                        Create Draft
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {draftProducts.map((p) => (
                      <Card key={p._id} className="p-3.5 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="size-11 sm:size-12 rounded-xl border border-border shrink-0 bg-muted">
                              {p.logoUrl && <AvatarImage src={p.logoUrl} alt={p.name} />}
                              <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                                {getInitials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/products/${p.slug}/edit`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                                  <h3 className="font-medium sm:font-semibold text-sm truncate hover:underline">{p.name}</h3>
                                </Link>
                                <Badge variant="secondary" className="text-[10px] font-mono font-normal">
                                  Draft
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate font-normal">{p.tagline}</p>
                              <span className="text-[11px] text-muted-foreground font-mono font-normal">
                                Last updated on {p.launchDate}
                              </span>
                            </div>
                          </div>

                          {/* Draft Actions */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                            <Button
                              size="sm"
                              onClick={() => handlePublishNow(p._id, p.name)}
                              disabled={publishingId === p._id}
                              className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium text-xs gap-1.5 min-h-[36px] shadow-xs cursor-pointer"
                            >
                              {publishingId === p._id ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Rocket className="size-3" />
                              )}
                              <span>Launch Live Now</span>
                            </Button>

                            <Link href={`/products/${p.slug}/edit`}>
                              <Button variant="outline" size="sm" className="gap-1 min-h-[36px] text-xs font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all">
                                <Hammer className="size-3" />
                                <span>Edit Draft</span>
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete({ id: p._id, name: p.name })}
                              className="size-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Draft"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Analytics & Velocity Tab */}
              <TabsContent value="analytics">
                <MakerAnalytics
                  products={launchedProducts}
                  totalUpvotes={totalUpvotes}
                />
              </TabsContent>

              {/* Milestones & Badges Tab */}
              <TabsContent value="badges">
                <div className="pt-2">
                  <MakerBadges
                    stats={{
                      launchCount: launchedProducts.length,
                      totalUpvotes,
                      totalComments,
                      hasChampionLaunch: launchedProducts.some((p) => p.upvoteCount >= 20),
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 flex flex-col gap-4 shadow-xl animate-in zoom-in-95">
              <div className="flex items-start gap-3 text-destructive">
                <AlertTriangle className="size-6 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-base text-foreground">Delete {productToDelete.name}?</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This action is permanent and cannot be undone. All product details, comments, discussions, and upvotes will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setProductToDelete(null)}
                  disabled={Boolean(deletingId)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={Boolean(deletingId)}
                  className="gap-1.5"
                >
                  {deletingId ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                  <span>Confirm Delete</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}