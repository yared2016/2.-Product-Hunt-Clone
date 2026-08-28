"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
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

  const handleUpvote = useCallback(async () => {
    if (!isSignedIn) {
      router.push(ROUTES.SIGN_IN);
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
  }, [isSignedIn, router, toggleCommentUpvote, comment._id]);

  const handleTogglePin = useCallback(async () => {
    try {
      setIsPinning(true);
      await togglePin({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    } finally {
      setIsPinning(false);
    }
  }, [togglePin, comment._id]);

  const handleReplySubmit = useCallback(async () => {
    if (!isSignedIn) {
      router.push(ROUTES.SIGN_IN);
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
  }, [isSignedIn, router, replyText, createComment, productId, comment._id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      setIsDeleting(true);
      await deleteComment({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteComment, comment._id]);

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
        <UserAvatar
          name={comment.author.name}
          src={comment.author.avatarUrl}
          size="sm"
          className="size-8 sm:size-9 rounded-full mt-0.5"
        />

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

            {/* Reply Trigger */}
            {!isAuthor && (
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 px-2.5 py-1.5 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer min-h-[36px] font-normal"
              >
                <MessageSquare className="size-3.5 shrink-0" />
                <span>Reply</span>
              </button>
            )}

            {/* Pin Action (For product owner only on top-level comments) */}
            {isProductOwner && !comment.parentId && (
              <button
                type="button"
                onClick={handleTogglePin}
                disabled={isPinning}
                className={cn(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] font-normal",
                  comment.isPinned
                    ? "text-orange-600 bg-orange-500/10"
                    : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10"
                )}
                title={comment.isPinned ? "Unpin comment" : "Pin comment to top"}
              >
                <Pin className={cn("size-3.5 shrink-0", comment.isPinned && "fill-current")} />
                <span className="hidden sm:inline">{comment.isPinned ? "Unpin" : "Pin"}</span>
              </button>
            )}

            {/* Delete (author only) */}
            {isAuthor && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer min-h-[36px] font-normal opacity-70 hover:opacity-100"
                title="Delete comment"
              >
                <Trash2 className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {/* Toggle Nested Replies */}
            {replyCount > 0 && (
              <button
                type="button"
                onClick={() => setShowReplies(!showReplies)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] font-normal ml-auto"
              >
                {showReplies ? (
                  <>
                    <ChevronDown className="size-3.5 shrink-0" />
                    <span>Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="size-3.5 shrink-0" />
                    <span>Show {replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Inline Reply Input Box */}
          {isReplying && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CornerDownRight className="size-3.5 text-orange-500" />
                <span>
                  Replying to <span className="font-semibold text-foreground">@{comment.author.username}</span>
                </span>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Write a thoughtful reply to @${comment.author.username}...`}
                className="min-h-[80px] text-xs resize-y"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  className="text-xs min-h-[36px] font-normal cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="bg-[#FF6154] hover:bg-[#FF6154]/90 text-white text-xs min-h-[36px] font-medium cursor-pointer"
                >
                  {isSubmittingReply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies Rendering */}
          {showReplies && replyCount > 0 && (
            <div className="flex flex-col gap-2 mt-2 pl-3 sm:pl-4 border-l-2 border-border/60">
              {comment.replies?.map((reply) => (
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
      </div>
    </div>
  );
}
