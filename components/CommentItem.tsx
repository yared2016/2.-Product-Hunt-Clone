"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Hammer,
  CornerDownRight,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommentAuthor {
  _id: Id<"users">;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export interface CommentNode {
  _id: Id<"comments">;
  productId: Id<"products">;
  authorId: Id<"users">;
  parentId?: Id<"comments">;
  body: string;
  upvoteCount: number;
  isPinned?: boolean;
  createdAt: number;
  isMaker: boolean;
  author: CommentAuthor;
  replies?: CommentNode[];
}

interface CommentItemProps {
  comment: CommentNode;
  productId: Id<"products">;
  currentUserId?: Id<"users">;
  isProductOwner?: boolean;
  upvotedCommentIds: Id<"comments">[];
}

export function CommentItem({
  comment,
  productId,
  currentUserId,
  isProductOwner = false,
  upvotedCommentIds,
}: CommentItemProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const toggleCommentUpvote = useMutation(api.commentUpvotes.toggle);
  const createComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.remove);
  const togglePin = useMutation(api.comments.togglePin);

  const isUpvoted = upvotedCommentIds.includes(comment._id);
  const isAuthor = Boolean(currentUserId && comment.authorId === currentUserId);
  const replyCount = comment.replies?.length ?? 0;

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleUpvote = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      setIsUpvoting(true);
      await toggleCommentUpvote({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to upvote comment:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      setIsPinning(true);
      await togglePin({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    } finally {
      setIsPinning(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!replyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      await createComment({
        productId,
        body: replyText,
        parentId: comment._id,
      });
      setReplyText("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      setIsDeleting(true);
      await deleteComment({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setIsDeleting(false);
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

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-3 group rounded-xl transition-colors",
        comment.isPinned && "bg-orange-500/5 dark:bg-orange-500/10 p-3 border border-orange-500/20"
      )}
    >
      {comment.isPinned && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
          <Pin className="size-3 fill-current rotate-45" />
          <span>Pinned by Maker</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <Avatar className="size-8 sm:size-9 rounded-full border border-border shrink-0 mt-0.5 bg-muted">
          {comment.author.avatarUrl && (
            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
          )}
          <AvatarFallback className="text-[10px] font-semibold">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        {/* Comment Content */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Author Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-xs sm:text-sm text-foreground">
              {comment.author.name}
            </span>

            {comment.isMaker && (
              <Badge
                variant="accent"
                className="text-[10px] py-0 px-1.5 gap-1 font-normal bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
              >
                <Hammer className="size-2.5" />
                <span>Maker</span>
              </Badge>
            )}

            <span className="text-[11px] text-muted-foreground font-mono font-normal">
              @{comment.author.username}
            </span>

            <span className="text-[11px] text-muted-foreground/70 font-mono font-normal">
              • {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* Comment Body */}
          <div className="text-xs sm:text-sm text-foreground/80 whitespace-pre-line leading-relaxed break-words font-normal">
            {comment.body}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* Upvote Button */}
            <button
              type="button"
              onClick={handleUpvote}
              disabled={isUpvoting}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none min-h-[36px] active:scale-95",
                isUpvoted
                  ? "text-orange-600 bg-orange-500/10 font-medium"
                  : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 font-normal"
              )}
            >
              <ChevronUp className="size-3.5 shrink-0" />
              <span>{comment.upvoteCount > 0 ? comment.upvoteCount : "Upvote"}</span>
            </button>

            {/* Reply Trigger - Only available for other users' comments (cannot reply to own comment) */}
            {!isAuthor && (
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none min-h-[36px] active:scale-95",
                  isReplying
                    ? "bg-[#FF6154]/10 text-[#FF6154] font-medium"
                    : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 font-normal"
                )}
              >
                <MessageSquare className="size-3 shrink-0" />
                <span>{isReplying ? "Cancel" : "Reply"}</span>
              </button>
            )}

            {/* Collapse/Expand Replies Toggle Button (Minimize / Maximize) */}
            {replyCount > 0 && (
              <button
                type="button"
                onClick={() => setShowReplies(!showReplies)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all cursor-pointer select-none min-h-[36px]"
                title={showReplies ? "Minimize replies" : "Maximize replies"}
              >
                {showReplies ? (
                  <>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                    <span>Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="size-3.5 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      View {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Pin Trigger (Product Owner Only) */}
            {isProductOwner && !comment.parentId && (
              <button
                type="button"
                onClick={handleTogglePin}
                disabled={isPinning}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none min-h-[36px] active:scale-95",
                  comment.isPinned
                    ? "text-orange-600 font-semibold"
                    : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10"
                )}
                title={comment.isPinned ? "Unpin comment" : "Pin comment to top"}
              >
                <Pin className={cn("size-3 shrink-0 rotate-45", comment.isPinned && "fill-current")} />
                <span>{comment.isPinned ? "Unpin" : "Pin"}</span>
              </button>
            )}

            {/* Delete / Moderate button (Author or Product Owner) */}
            {(isAuthor || isProductOwner) && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg text-red-500/70 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer select-none ml-auto min-h-[36px]"
                title={isProductOwner && !isAuthor ? "Moderate / Delete Comment" : "Delete Comment"}
              >
                <Trash2 className="size-3" />
                <span className="hidden sm:inline">
                  {isProductOwner && !isAuthor ? "Moderate" : "Delete"}
                </span>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-3 flex flex-col gap-2 p-3 rounded-xl border border-border/80 bg-muted/20">
              <Textarea
                placeholder={`Reply to @${comment.author.username}...`}
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="text-xs bg-background"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-[36px] text-xs"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmittingReply || !replyText.trim()}
                  onClick={handleReplySubmit}
                  className="min-h-[36px] text-xs bg-[#FF6154] hover:bg-[#FF6154]/90 text-white font-medium active:scale-95"
                >
                  <CornerDownRight data-icon="inline-start" className="size-3" />
                  <span>Post Reply</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies with Minimize / Maximize toggle */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div className="pl-4 sm:pl-8 ml-2 sm:ml-4 border-l-2 border-border/60 flex flex-col gap-1 mt-1 animate-in fade-in-0 duration-200">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              productId={productId}
              currentUserId={currentUserId}
              isProductOwner={isProductOwner}
              upvotedCommentIds={upvotedCommentIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
