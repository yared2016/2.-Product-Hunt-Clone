import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";

export const toggle = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existingUpvote = await ctx.db
      .query("productUpvotes")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existingUpvote) {
      // Remove upvote
      await ctx.db.delete(existingUpvote._id);
      const newCount = Math.max(0, product.upvoteCount - 1);
      await ctx.db.patch(product._id, {
        upvoteCount: newCount,
      });
      return { upvoted: false, upvoteCount: newCount };
    } else {
      // Add upvote
      await ctx.db.insert("productUpvotes", {
        userId: user._id,
        productId: args.productId,
        createdAt: Date.now(),
      });
      const newCount = product.upvoteCount + 1;
      await ctx.db.patch(product._id, {
        upvoteCount: newCount,
      });

      // Send notification to submitter if not the upvoter
      if (product.submitterId !== user._id) {
        await ctx.db.insert("notifications", {
          recipientId: product.submitterId,
          type: "upvote",
          title: "New upvote on your product",
          body: `${user.name} upvoted "${product.name}"`,
          linkUrl: `/products/${product.slug}`,
          relatedProductId: product._id,
          actorId: user._id,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { upvoted: true, upvoteCount: newCount };
    }
  },
});

export const hasUpvoted = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return false;
    }

    const upvote = await ctx.db
      .query("productUpvotes")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    return upvote !== null;
  },
});

export const getMyUpvotedProductIds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [] as Id<"products">[];
    }

    const upvotes = await ctx.db
      .query("productUpvotes")
      .withIndex("by_user_product", (q) => q.eq("userId", user._id))
      .collect();

    return upvotes.map((u) => u.productId);
  },
});
