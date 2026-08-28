"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { PricingBadge } from "@/components/PricingBadge";
import { ROUTES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bookmark,
  Plus,
  Trash2,
  FolderPlus,
  Folder,
  ChevronUp,
  Globe,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "collections">("all");
  const [selectedCollectionId, setSelectedCollectionId] = useState<Id<"collections"> | undefined>(undefined);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColVisibility, setNewColVisibility] = useState<"public" | "private">("public");
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  // Queries
  const bookmarks = useQuery(api.bookmarks.getMyBookmarks, {
    collectionId: selectedCollectionId,
  });
  const collections = useQuery(api.bookmarks.getMyCollections);
  const upvotedIds = useQuery(api.upvotes.getMyUpvotedProductIds) ?? [];

  // Mutations
  const toggleBookmark = useMutation(api.bookmarks.toggle);
  const toggleUpvote = useMutation(api.upvotes.toggle);
  const createCollection = useMutation(api.bookmarks.createCollection);
  const deleteCollection = useMutation(api.bookmarks.deleteCollection);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      setIsCreatingCol(true);
      await createCollection({
        name: newColName.trim(),
        description: newColDesc.trim() || undefined,
        visibility: newColVisibility,
      });
      setNewColName("");
      setNewColDesc("");
      setNewCollectionOpen(false);
    } catch (err) {
      console.error("Failed to create collection:", err);
    } finally {
      setIsCreatingCol(false);
    }
  };

  const handleDeleteCollection = async (colId: Id<"collections">) => {
    if (!window.confirm("Delete this collection? Your saved bookmarks will remain in your library.")) {
      return;
    }
    try {
      if (selectedCollectionId === colId) setSelectedCollectionId(undefined);
      await deleteCollection({ collectionId: colId });
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto flex items-center justify-center p-6 w-full">
          <EmptyState
            icon={Bookmark}
            title="Sign in to view your bookmarks"
            description="Save products, organize tools into curated stacks, and track your favorite launches across devices."
            actionLabel="Sign In to Continue"
            actionHref={ROUTES.SIGN_IN}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-border/80 w-full">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Bookmark className="size-4 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Saved Bookmarks & Stacks
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Your personal library of saved tools, curated collections, and products to try later.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setNewCollectionOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-[#FF6154] to-amber-500 hover:from-orange-600 hover:to-orange-500 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.02] ring-0 hover:ring-2 hover:ring-orange-500/30"
            >
              <FolderPlus className="size-4 transition-transform duration-200 group-hover:scale-115 group-hover:-translate-y-0.5" />
              <span>New Stack</span>
            </button>
          </div>
        </div>

        {/* Tab & Collection Filter Bar (Wrapped, No Horizontal Scrolling) */}
        <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedCollectionId(undefined);
                setActiveTab("all");
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all select-none cursor-pointer border min-h-[36px] active:scale-95 hover:shadow-2xs",
                selectedCollectionId === undefined && activeTab === "all"
                  ? "bg-[#FF6154] text-white border-[#FF6154] font-medium shadow-xs ring-1 ring-orange-500/30"
                  : "border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 font-normal"
              )}
            >
              All Saved ({bookmarks?.length ?? 0})
            </button>

            {collections &&
              collections.map((col) => (
                <button
                  key={col._id}
                  type="button"
                  onClick={() => {
                    setSelectedCollectionId(col._id);
                    setActiveTab("all");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all select-none cursor-pointer border min-h-[36px] active:scale-95 hover:shadow-2xs",
                    selectedCollectionId === col._id
                      ? "bg-gradient-to-r from-orange-600 to-[#FF6154] text-white border-orange-600 font-medium shadow-xs ring-1 ring-orange-500/30"
                      : "border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 font-normal"
                  )}
                >
                  <Folder className="size-3.5" />
                  <span>{col.name}</span>
                  <span className="text-[10px] font-mono opacity-80 font-normal">({col.itemCount})</span>
                </button>
              ))}

            {/* Quick "+ Stack" Pill Trigger */}
            <button
              type="button"
              onClick={() => setNewCollectionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm border border-dashed border-border/80 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all cursor-pointer min-h-[36px] active:scale-95 group font-normal"
            >
              <Plus className="size-3.5 transition-transform duration-200 group-hover:rotate-90 text-muted-foreground group-hover:text-orange-500" />
              <span>Create Stack</span>
            </button>
          </div>

          {selectedCollectionId && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteCollection(selectedCollectionId)}
                className="text-xs text-red-500/80 hover:text-red-600 hover:bg-red-500/10 h-8 gap-1 font-normal cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>Delete Stack</span>
              </Button>
            </div>
          )}
        </div>

        {/* Bookmarks Feed */}
        <div className="pt-6">
          {bookmarks === undefined ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : bookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved products here yet"
              description="Browse the daily feeds and click the bookmark icon to save products into your personal stacks."
              actionLabel="Explore Daily Launches"
              actionHref={ROUTES.HOME}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {bookmarks.map(({ bookmarkId, product, collection }) => {
                const hasUpvoted = upvotedIds.includes(product._id);
                return (
                  <Card
                    key={bookmarkId}
                    className="p-3.5 sm:p-4 hover:border-border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <UserAvatar
                        name={product.name}
                        src={product.logoUrl}
                        size="md"
                        className="size-11 sm:size-13 rounded-xl shrink-0"
                      />

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={ROUTES.PRODUCT(product.slug)} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                            <h4 className="font-medium sm:font-semibold text-sm sm:text-base text-foreground truncate hover:underline">
                              {product.name}
                            </h4>
                          </Link>
                          <PricingBadge pricing={product.pricing} />
                          {collection && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-orange-600 dark:text-orange-400 border-orange-500/30 bg-orange-500/5 font-normal">
                              📁 {collection.name}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed font-normal">
                          {product.tagline}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono pt-0.5 font-normal">
                          <span>{product.categories.join(", ")}</span>
                          <span>•</span>
                          <span>{product.commentCount} comments</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark({ productId: product._id })}
                        className="text-xs text-red-500/70 hover:text-red-600 hover:bg-red-500/10 min-h-[36px] px-2.5"
                        title="Remove bookmark"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>

                      <Link href={ROUTES.PRODUCT(product.slug)}>
                        <Button variant="outline" size="sm" className="text-xs min-h-[36px] font-normal hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400 transition-all">
                          <span>View</span>
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        onClick={() => toggleUpvote({ productId: product._id })}
                        className={cn(
                          "font-semibold text-xs gap-1.5 min-h-[36px] shadow-xs cursor-pointer",
                          hasUpvoted
                            ? "bg-[#FF6154] text-white hover:bg-[#FF6154]/90"
                            : "bg-[#FF6154] text-white hover:bg-[#FF6154]/90"
                        )}
                      >
                        <ChevronUp className="size-3.5" />
                        <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
                        <span className="bg-black/20 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">
                          {product.upvoteCount}
                        </span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create New Stack / Collection Modal */}
      <Dialog open={newCollectionOpen} onOpenChange={setNewCollectionOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6 bg-background border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Curated Stack</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Group your saved tools and tech products into curated stacks (e.g. &quot;My AI Toolkit&quot;, &quot;Dev Stack 2026&quot;).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCollection} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Stack Name</label>
              <Input
                placeholder="e.g. AI Dev Toolkit, Design Inspo"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                required
                className="text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Description (Optional)</label>
              <Textarea
                placeholder="What tools are in this stack and why do you recommend them?"
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                className="text-xs"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Visibility</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewColVisibility("public")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all",
                    newColVisibility === "public"
                      ? "bg-[#FF6154] text-white border-[#FF6154] font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Globe className="size-3.5" />
                  <span>Public Stack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewColVisibility("private")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all",
                    newColVisibility === "private"
                      ? "bg-[#FF6154] text-white border-[#FF6154] font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Lock className="size-3.5" />
                  <span>Private</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNewCollectionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingCol || !newColName.trim()}
                className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white min-h-[38px] px-4 font-medium cursor-pointer"
              >
                {isCreatingCol ? "Creating..." : "Create Stack"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
