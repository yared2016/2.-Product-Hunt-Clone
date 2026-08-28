import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";

export const toggle = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const existing = await ctx.db
      .query("commentUpvotes")
      .withIndex("by_user_comment", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      const newCount = Math.max(0, comment.upvoteCount - 1);
      await ctx.db.patch(comment._id, { upvoteCount: newCount });
      return { upvoted: false, upvoteCount: newCount };
    } else {
      await ctx.db.insert("commentUpvotes", {
        userId: user._id,
        commentId: args.commentId,
        createdAt: Date.now(),
      });
      const newCount = comment.upvoteCount + 1;
      await ctx.db.patch(comment._id, { upvoteCount: newCount });
      return { upvoted: true, upvoteCount: newCount };
    }
  },
});

export const getMyUpvotedCommentIds = query({
  args: {
    commentIds: v.array(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user || args.commentIds.length === 0) {
      return [] as Id<"comments">[];
    }

    const upvotedIds: Id<"comments">[] = [];
    for (const cId of args.commentIds) {
      const exists = await ctx.db
        .query("commentUpvotes")
        .withIndex("by_user_comment", (q) =>
          q.eq("userId", user._id).eq("commentId", cId)
        )
        .first();
      if (exists) {
        upvotedIds.push(cId);
      }
    }

    return upvotedIds;
  },
});
