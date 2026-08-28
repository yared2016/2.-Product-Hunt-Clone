"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth, useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentItem, CommentNode } from "@/components/CommentItem";
import { MessageSquare, Send, Sparkles, Flame, Clock, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  productId: Id<"products">;
  productName: string;
  isProductOwner?: boolean;
}

type CommentSortType = "top" | "latest" | "oldest";

export function CommentSection({
  productId,
  productName,
  isProductOwner = false,
}: CommentSectionProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSortType>("top");

  const currentUser = useQuery(api.users.getCurrentUser);
  const rawComments = useQuery(api.comments.listByProduct, { productId });

  const commentIds = rawComments?.map((c) => c._id) ?? [];
  const upvotedCommentIds = useQuery(
    api.commentUpvotes.getMyUpvotedCommentIds,
    commentIds.length > 0 ? { commentIds } : "skip"
  ) ?? [];

  const createComment = useMutation(api.comments.create);

  const handlePostComment = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await createComment({
        productId,
        body: commentText.trim(),
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build recursive comment tree
  const commentMap = new Map<Id<"comments">, CommentNode>();
  const commentTree: CommentNode[] = [];

  if (rawComments) {
    for (const comment of rawComments) {
      commentMap.set(comment._id, {
        ...comment,
        replies: [],
      });
    }

    for (const comment of rawComments) {
      const node = commentMap.get(comment._id);
      if (!node) continue;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(node);
        } else {
          commentTree.push(node);
        }
      } else {
        commentTree.push(node);
      }
    }

    // Sort nested replies chronologically (oldest to newest)
    for (const node of commentMap.values()) {
      if (node.replies && node.replies.length > 0) {
        node.replies.sort((a, b) => a.createdAt - b.createdAt);
      }
    }

    // Sort root comments based on selected sort option
    commentTree.sort((a, b) => {
      // Pinned comments always appear at the very top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === "top") {
        if (b.upvoteCount !== a.upvoteCount) {
          return b.upvoteCount - a.upvoteCount;
        }
        return b.createdAt - a.createdAt;
      }
      if (sortBy === "latest") {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === "oldest") {
        return a.createdAt - b.createdAt;
      }
      return 0;
    });
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const SORT_OPTIONS: Array<{ key: CommentSortType; label: string; icon: typeof Flame }> = [
    { key: "top", label: "Top", icon: Flame },
    { key: "latest", label: "Latest", icon: Clock },
    { key: "oldest", label: "Oldest", icon: ArrowDownUp },
  ];

  return (
    <Card id="comments" className="p-4 sm:p-6 flex flex-col gap-6 scroll-mt-24">
      {/* Header with Comment Count & Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-base sm:text-lg text-foreground">Discussion</h3>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            {rawComments?.length ?? 0}
          </span>
        </div>

        {/* Sort Filter Tabs */}
        {rawComments && rawComments.length > 0 && (
          <div className="inline-flex items-center p-0.5 rounded-xl bg-muted/70 border border-border/80 text-xs self-start sm:self-auto">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = sortBy === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all select-none cursor-pointer whitespace-nowrap",
                    isSelected
                      ? "bg-background text-orange-600 dark:text-orange-400 shadow-2xs font-medium ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-background/50 font-normal"
                  )}
                >
                  <Icon className={cn("size-3", isSelected ? "text-orange-500" : "text-muted-foreground")} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* New Comment Input Box */}
      <div className="flex items-start gap-3">
        <Avatar className="size-9 rounded-full border border-border shrink-0 mt-0.5 bg-muted">
          {clerkUser?.imageUrl && (
            <AvatarImage src={clerkUser.imageUrl} alt={clerkUser.fullName || "User"} />
          )}
          <AvatarFallback className="text-xs font-semibold">
            {clerkUser?.fullName ? getInitials(clerkUser.fullName) : "ME"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col gap-2 p-3 rounded-2xl border border-border/80 bg-muted/20 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
            <Textarea
              placeholder={
                isSignedIn
                  ? `What do you think of ${productName}? Ask the makers a question...`
                  : "Sign in to join the discussion..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="text-sm bg-background/80 resize-y min-h-[80px]"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-orange-500" />
                Be kind and constructive
              </span>

              <Button
                size="sm"
                disabled={isSubmitting || !commentText.trim()}
                onClick={handlePostComment}
                className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium gap-1.5 shadow-xs min-h-[36px] text-xs cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <Spinner data-icon="inline-start" className="size-3" />
                ) : (
                  <Send data-icon="inline-start" className="size-3" />
                )}
                <span>Send Comment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="pt-2 flex flex-col divide-y divide-border/40">
        {rawComments === undefined ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        ) : commentTree.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <MessageSquare className="size-8 opacity-40 text-orange-500" />
            <h4 className="font-semibold text-sm text-foreground">No comments yet</h4>
            <p className="text-xs max-w-sm">
              Be the first to share your thoughts, ask questions, or congratulate the makers of {productName}!
            </p>
          </div>
        ) : (
          commentTree.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              productId={productId}
              currentUserId={currentUser?._id}
              isProductOwner={isProductOwner}
              upvotedCommentIds={upvotedCommentIds}
            />
          ))
        )}
      </div>
    </Card>
  );
}
