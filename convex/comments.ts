import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";

export const create = mutation({
  args: {
    productId: v.id("products"),
    body: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let parentComment = null;
    if (args.parentId) {
      parentComment = await ctx.db.get(args.parentId);
      if (!parentComment || parentComment.productId !== args.productId) {
        throw new Error("Invalid parent comment");
      }
    }

    const trimmedBody = args.body.trim();
    if (!trimmedBody) {
      throw new Error("Comment cannot be empty");
    }

    const commentId = await ctx.db.insert("comments", {
      productId: args.productId,
      authorId: user._id,
      parentId: args.parentId,
      body: trimmedBody,
      upvoteCount: 0,
      isPinned: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.productId, {
      commentCount: product.commentCount + 1,
    });

    // Send notifications
    if (parentComment && parentComment.authorId !== user._id) {
      await ctx.db.insert("notifications", {
        recipientId: parentComment.authorId,
        type: "reply",
        title: "New reply to your comment",
        body: `${user.name} replied to your comment on "${product.name}"`,
        linkUrl: `/products/${product.slug}#comments`,
        relatedProductId: product._id,
        actorId: user._id,
        isRead: false,
        createdAt: Date.now(),
      });
    } else if (!parentComment && product.submitterId !== user._id) {
      await ctx.db.insert("notifications", {
        recipientId: product.submitterId,
        type: "comment",
        title: "New comment on your launch",
        body: `${user.name} commented on "${product.name}"`,
        linkUrl: `/products/${product.slug}#comments`,
        relatedProductId: product._id,
        actorId: user._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      return [];
    }

    let makerIds: Id<"users">[] = product.makerIds ?? [];
    const makerJoinRecords = await ctx.db
      .query("productMakers")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    for (const rec of makerJoinRecords) {
      if (!makerIds.includes(rec.userId)) {
        makerIds.push(rec.userId);
      }
    }
    if (!makerIds.includes(product.submitterId)) {
      makerIds.push(product.submitterId);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const enriched = await Promise.all(
      comments.map(async (c) => {
        const author = await ctx.db.get(c.authorId);
        return {
          ...c,
          isPinned: Boolean(c.isPinned),
          isMaker: makerIds.includes(c.authorId),
          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username,
                avatarUrl: author.avatarUrl,
                bio: author.bio,
              }
            : {
                _id: c.authorId,
                name: "Community Member",
                username: "member",
                avatarUrl: undefined,
                bio: undefined,
              },
        };
      })
    );

    return enriched.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const togglePin = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const product = await ctx.db.get(comment.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const isProductOwner =
      product.submitterId === user._id || (product.makerIds ?? []).includes(user._id);

    if (!isProductOwner) {
      throw new Error("Only product makers or the submitter can pin/unpin comments");
    }

    const newPinnedState = !comment.isPinned;

    if (newPinnedState) {
      // Unpin any other pinned comments for this product
      const existingPinned = await ctx.db
        .query("comments")
        .withIndex("by_product", (q) => q.eq("productId", product._id))
        .filter((q) => q.eq(q.field("isPinned"), true))
        .collect();

      for (const p of existingPinned) {
        await ctx.db.patch(p._id, { isPinned: false });
      }
    }

    await ctx.db.patch(comment._id, { isPinned: newPinnedState });
    return { isPinned: newPinnedState };
  },
});

export const remove = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const product = await ctx.db.get(comment.productId);
    const isAuthor = comment.authorId === user._id;
    const isProductOwner =
      product &&
      (product.submitterId === user._id || (product.makerIds ?? []).includes(user._id));

    if (!isAuthor && !isProductOwner) {
      throw new Error("You do not have permission to delete or moderate this comment");
    }

    const upvotes = await ctx.db
      .query("commentUpvotes")
      .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
      .collect();

    for (const u of upvotes) {
      await ctx.db.delete(u._id);
    }

    await ctx.db.delete(comment._id);

    if (product) {
      const newCount = Math.max(0, product.commentCount - 1);
      await ctx.db.patch(product._id, { commentCount: newCount });
    }

    return { success: true };
  },
});