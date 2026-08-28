"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { CommentSection } from "@/components/CommentSection";
import { BookmarkButton } from "@/components/BookmarkButton";
import { NotifyMeButton } from "@/components/NotifyMeButton";
import { SimilarProducts } from "@/components/SimilarProducts";
import { EmbedBadgeModal } from "@/components/EmbedBadgeModal";
import { ShareModal } from "@/components/ShareModal";
import { ProductChangelog } from "@/components/ProductChangelog";
import { fireUpvoteConfetti } from "@/lib/confetti";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Calendar,
  Globe,
  Share2,
  Hammer,
  Code,
  Tag,
  Gift,
  Copy,
  Check,
  Play,
  Images,
  Link as LinkIcon,
  History,
  MessageSquare,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getEmbedVideoUrl(rawUrl: string): string {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return "";
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    
    // YouTube
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (url.pathname.startsWith("/embed/")) return rawUrl;
    }
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\/+/, "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Loom
    if (url.hostname.includes("loom.com")) {
      const id = url.pathname.split("/share/")[1] || url.pathname.split("/")[2];
      if (id) return `https://www.loom.com/embed/${id}`;
    }
    // Vimeo
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.replace(/^\/+/, "");
      if (id && !isNaN(Number(id))) return `https://player.vimeo.com/video/${id}`;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [productTab, setProductTab] = useState<"overview" | "changelog">("overview");
  const [promoCopied, setPromoCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  const router = useRouter();
  const { isSignedIn } = useAuth();

  const product = useQuery(api.products.getBySlug, { slug });
  const currentUser = useQuery(api.users.getCurrentUser);
  const hasUpvoted = useQuery(
    api.upvotes.hasUpvoted,
    product ? { productId: product._id } : "skip"
  ) ?? false;

  const toggleUpvote = useMutation(api.upvotes.toggle);

  const handleUpvote = async (e?: React.MouseEvent) => {
    if (!product) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsUpvoting(true);
      if (!hasUpvoted) {
        fireUpvoteConfetti(e);
      }
      await toggleUpvote({ productId: product._id });
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const isOwner = Boolean(
    currentUser &&
      product &&
      (product.submitterId === currentUser._id ||
        (product.makerIds ?? []).includes(currentUser._id))
  );

  const isScheduled = product?.status === "scheduled";

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const embedVideoUrl = product?.videoUrl ? getEmbedVideoUrl(product.videoUrl) : "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Breadcrumb / Back Link & Share Actions */}
        <div className="flex items-center justify-between gap-2 pb-5 sm:pb-6 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
          >
            <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Products</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 gap-1.5 h-8 px-3 cursor-pointer transition-all active:scale-95"
            >
              <Share2 className="size-3.5 text-orange-500" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {product === undefined ? (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 sm:size-20 rounded-2xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-48 rounded" />
                  <Skeleton className="h-4 w-72 rounded" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        ) : product === null ? (
          /* Product Not Found */
          <Card className="p-12 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-10">
            <h2 className="text-xl font-bold">Product not found</h2>
            <p className="text-sm text-muted-foreground">
              The product you are looking for does not exist or may have been removed.
            </p>
            <Link href="/">
              <Button className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white min-h-[40px] px-5">
                Explore Top Launches
              </Button>
            </Link>
          </Card>
        ) : (
          /* Main Product Details Content */
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Header Hero Section */}
            <div className="flex flex-col gap-4 pb-6 sm:pb-8 border-b border-border/80">
              {/* Product Hero Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <Avatar className="size-16 sm:size-20 rounded-2xl border-2 border-border shadow-md shrink-0 bg-muted">
                    {product.logoUrl && (
                      <AvatarImage src={product.logoUrl} alt={product.name} />
                    )}
                    <AvatarFallback className="rounded-2xl font-bold text-xl bg-muted text-foreground">
                      {getInitials(product.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {product.name}
                      </h1>

                      {/* Daily Ranking Badge - Highly visible and vibrant for all launched products */}
                      {!isScheduled && (product.dailyRank || product.status === "launched") && (
                        (() => {
                          const rank = product.dailyRank || 1;
                          if (rank === 1) {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold text-xs font-mono shadow-sm shadow-amber-500/25 tracking-tight border border-amber-300 select-none">
                                <Sparkles className="size-3.5 fill-white/40" />
                                <span>#1 Product of the Day</span>
                              </span>
                            );
                          }
                          if (rank === 2) {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-slate-500 select-none">
                                <Sparkles className="size-3.5 fill-white/40" />
                                <span>#2 Product of the Day</span>
                              </span>
                            );
                          }
                          if (rank === 3) {
                            return (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-amber-600 select-none">
                                <Sparkles className="size-3.5 fill-white/40" />
                                <span>#3 Product of the Day</span>
                              </span>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 via-[#FF6154] to-red-500 text-white font-semibold text-xs font-mono shadow-sm shadow-orange-500/25 tracking-tight border border-orange-400/40 select-none">
                              <Sparkles className="size-3.5 fill-white/40" />
                              <span>#{rank} Product of the Day</span>
                            </span>
                          );
                        })()
                      )}

                      {/* Scheduled Status Badge */}
                      {isScheduled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white font-semibold text-xs font-mono shadow-sm tracking-tight border border-blue-400/40 select-none">
                          <span>Launching Soon ({product.launchDate})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs capitalize py-0 px-2 font-normal"
                      >
                        {product.pricing}
                      </Badge>
                      {product.categories.map((cat: string) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-[10px] sm:text-xs py-0 px-2 font-normal text-muted-foreground"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons (Desktop >= 640px) */}
                <div className="hidden sm:flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
                  {/* Bookmark Button */}
                  <BookmarkButton productId={product._id} variant="button" />

                  {isOwner && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmbedModalOpen(true)}
                        className="gap-1.5 min-h-[42px] px-3.5 hover:text-foreground cursor-pointer font-normal"
                        title="Get live embeddable badge code"
                      >
                        <Code className="size-3.5 text-muted-foreground" />
                        <span>Embed Badge</span>
                      </Button>

                      <Link href={`/products/${product.slug}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 min-h-[42px] px-3.5 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5 text-orange-600 dark:text-orange-400 cursor-pointer font-normal"
                        >
                          <Hammer className="size-3.5" />
                          <span>Edit Product</span>
                        </Button>
                      </Link>
                    </>
                  )}

                  {product.websiteUrl && (
                    <a
                      href={product.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 min-h-[42px] px-3.5 active:scale-95 transition-all cursor-pointer hover:border-orange-500/50 font-normal"
                      >
                        <Globe className="size-4 text-muted-foreground" />
                        <span>Visit Website</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Button>
                    </a>
                  )}

                  {isScheduled ? (
                    <NotifyMeButton
                      productId={product._id}
                      variant="hero"
                      size="default"
                    />
                  ) : (
                    <Button
                      size="sm"
                      disabled={isUpvoting}
                      onClick={handleUpvote}
                      className={cn(
                        "gap-2 min-h-[42px] px-5 font-medium active:scale-95 transition-all shadow-xs cursor-pointer",
                        hasUpvoted
                          ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                          : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80 font-normal"
                      )}
                    >
                      <ChevronUp
                        className={cn("size-4 shrink-0", hasUpvoted ? "text-white" : "text-[#FF6154]")}
                      />
                      <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-xs font-mono font-semibold",
                        hasUpvoted ? "bg-black/20 text-white" : "bg-muted text-foreground"
                      )}>
                        {product.upvoteCount}
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed w-full font-normal">
                {product.tagline}
              </p>

              {/* Promo Code & Special Launch Offer (if exists) */}
              {product.promoCode && (
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                      <Gift className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          Special Launch Offer
                        </span>
                        {product.promoDiscount && (
                          <Badge variant="accent" className="text-[10px] py-0 px-1.5 font-medium">
                            {product.promoDiscount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate font-normal">
                        Use promo code at checkout for an exclusive community discount
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopyPromo(product.promoCode!)}
                    className="gap-1.5 font-mono text-xs h-8 px-3 border border-border shrink-0 cursor-pointer"
                  >
                    {promoCopied ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 text-muted-foreground" />
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {product.promoCode}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Action Buttons (Mobile < 640px) */}
              <div className="flex sm:hidden items-center gap-2 w-full pt-1 flex-wrap">
                <BookmarkButton
                  productId={product._id}
                  variant="button"
                  className="flex-1"
                />

                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEmbedModalOpen(true)}
                      className="gap-1 min-h-[40px] px-3 cursor-pointer"
                    >
                      <Code className="size-3.5 text-muted-foreground" />
                      <span>Badge</span>
                    </Button>

                    <Link href={`/products/${product.slug}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 min-h-[40px] px-3 border-orange-500/30 text-orange-600 dark:text-orange-400 cursor-pointer"
                      >
                        <Hammer className="size-3.5" />
                        <span>Edit</span>
                      </Button>
                    </Link>
                  </>
                )}

                {product.websiteUrl && (
                  <a
                    href={product.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px]"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 min-h-[40px] px-3 cursor-pointer"
                    >
                      <Globe className="size-3.5 text-muted-foreground" />
                      <span>Visit</span>
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </Button>
                  </a>
                )}

                {isScheduled ? (
                  <div className="w-full pt-1">
                    <NotifyMeButton
                      productId={product._id}
                      variant="hero"
                      size="default"
                    />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={isUpvoting}
                    onClick={handleUpvote}
                    className={cn(
                      "w-full gap-2 min-h-[42px] font-semibold active:scale-95 transition-all shadow-xs cursor-pointer",
                      hasUpvoted
                        ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90 border border-[#FF6154]"
                        : "bg-background hover:bg-orange-500/10 text-foreground hover:text-[#FF6154] border border-border/80"
                    )}
                  >
                    <ChevronUp
                      className={cn("size-4 shrink-0", hasUpvoted ? "text-white" : "text-[#FF6154]")}
                    />
                    <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold",
                      hasUpvoted ? "bg-black/20 text-white" : "bg-muted text-foreground"
                    )}>
                      {product.upvoteCount}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content Grid: Description/Media (8 cols) + Sidebar (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Media Gallery, Video & Full Description */}
              <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
                {/* Demo Video (if provided) */}
                {embedVideoUrl && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground uppercase tracking-wider">
                      <Play className="size-3.5 text-orange-500" />
                      <span>Product Demo Video</span>
                    </div>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black/5 shadow-xs">
                      <iframe
                        src={embedVideoUrl}
                        title={`${product.name} demo video`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Screenshot Gallery (if provided) */}
                {product.galleryUrls && product.galleryUrls.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground uppercase tracking-wider">
                        <Images className="size-3.5 text-orange-500" />
                        <span>Product Screenshots & Media ({product.galleryUrls.length})</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-normal">Click to enlarge</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.galleryUrls.map((url: string, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedGalleryImage(url)}
                          className="w-full aspect-video rounded-2xl overflow-hidden border border-border/80 bg-muted shadow-2xs hover:border-orange-500/50 hover:shadow-md transition-all group relative cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`${product.name} screenshot ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 text-foreground text-xs px-2.5 py-1 rounded-lg font-medium shadow-xs">
                              Enlarge
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Tabs (Overview & Discussion vs Changelog) */}
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <button
                    type="button"
                    onClick={() => setProductTab("overview")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 active:scale-95",
                      productTab === "overview"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-semibold shadow-2xs"
                        : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/5 font-normal"
                    )}
                  >
                    <MessageSquare className="size-3.5" />
                    <span>Overview & Discussion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductTab("changelog")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 active:scale-95",
                      productTab === "changelog"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 font-semibold shadow-2xs"
                        : "border border-transparent text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/5 font-normal"
                    )}
                  >
                    <History className="size-3.5" />
                    <span>Changelog & Updates</span>
                  </button>
                </div>

                {productTab === "overview" ? (
                  <>
                    {/* About / Description Card */}
                    <Card className="p-5 sm:p-6">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-base sm:text-lg font-semibold">
                          About {product.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-sm text-muted-foreground leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none font-normal">
                        {product.description}
                      </CardContent>
                    </Card>

                    {/* Discussion / Comments Section */}
                    <CommentSection
                      productId={product._id}
                      productName={product.name}
                      isProductOwner={isOwner}
                    />
                  </>
                ) : (
                  /* Changelog & Updates Tab */
                  <ProductChangelog
                    productId={product._id}
                    productName={product.name}
                    isMakerOrSubmitter={isOwner}
                  />
                )}

                {/* Similar Products & Alternatives Recommendations */}
                <SimilarProducts
                  productId={product._id}
                  currentProductName={product.name}
                />
              </div>

              {/* Right Column: Maker Info, Launch Details, Direct Links */}
              <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
                {/* Maker Card with Live Indicator */}
                <Card className="p-5">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground uppercase tracking-wider">
                      <Hammer className="size-3.5 text-orange-500" />
                      <span>Makers</span>
                    </div>

                    {/* Maker is Live Indicator */}
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online for Launch</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {product.makers && product.makers.length > 0 ? (
                      product.makers.map((maker) => (
                        <div
                          key={maker._id}
                          className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="size-10 rounded-full border border-border bg-muted shrink-0">
                              {maker.avatarUrl && (
                                <AvatarImage
                                  src={maker.avatarUrl}
                                  alt={maker.name}
                                />
                              )}
                              <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                                {getInitials(maker.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-foreground truncate">
                                {maker.name}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono truncate font-normal">
                                @{maker.username}
                              </span>
                            </div>
                          </div>

                          {maker.role && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30 px-2 py-0.5 shrink-0"
                            >
                              {maker.role}
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : product.submitter ? (
                      <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="size-10 rounded-full border border-border bg-muted shrink-0">
                            {product.submitter.avatarUrl && (
                              <AvatarImage
                                src={product.submitter.avatarUrl}
                                alt={product.submitter.name}
                              />
                            )}
                            <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">
                              {getInitials(product.submitter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground truncate">
                              {product.submitter.name}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono truncate font-normal">
                              @{product.submitter.username}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30 px-2 py-0.5 shrink-0"
                        >
                          {product.submitter.role || "Founder"}
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </Card>

                {/* Product Metadata & Links Card */}
                <Card className="p-5 flex flex-col gap-4">
                  <div className="text-xs font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="size-3.5 text-orange-500" />
                    <span>Launch Details</span>
                  </div>

                  {/* Launch Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-normal">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span>Launched On</span>
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {product.launchDate}
                    </span>
                  </div>

                  {/* Product URL Slug */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-normal">
                      <LinkIcon className="size-3.5 text-muted-foreground" />
                      <span>Slug</span>
                    </span>
                    <span className="font-mono font-medium text-orange-600 dark:text-orange-400">
                      /{product.slug}
                    </span>
                  </div>

                  {/* Website URL */}
                  {product.websiteUrl && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-normal">
                        <Globe className="size-3.5 text-muted-foreground" />
                        <span>Website</span>
                      </span>
                      <a
                        href={product.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-normal text-orange-600 hover:underline truncate max-w-[140px] inline-flex items-center gap-1"
                      >
                        <span className="truncate">{product.websiteUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="size-2.5 shrink-0" />
                      </a>
                    </div>
                  )}

                  <Separator />

                  {/* Categories & Topics */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-foreground">
                      Topics & Categories
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.categories.map((c: string) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          #{c.toLowerCase().replace(/\s+/g, "")}
                        </Badge>
                      ))}
                      {product.topics && product.topics.length > 0 &&
                        product.topics.map((t: string) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="text-[11px] font-normal"
                          >
                            #{t}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Image Preview Modal */}
      {selectedGalleryImage && (
        <div
          onClick={() => setSelectedGalleryImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in-0"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedGalleryImage}
              alt="Enlarged screenshot preview"
              className="w-full h-full object-contain max-h-[85vh] rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Embed Badge Modal */}
      {product && (
        <EmbedBadgeModal
          productName={product.name}
          productSlug={product.slug}
          isOpen={embedModalOpen}
          onClose={() => setEmbedModalOpen(false)}
        />
      )}

      {/* Share Modal */}
      {product && (
        <ShareModal
          productName={product.name}
          productTagline={product.tagline}
          productSlug={product.slug}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
