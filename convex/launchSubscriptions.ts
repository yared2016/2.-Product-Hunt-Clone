import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";
import { Id } from "./_generated/dataModel";

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

    const existing = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      const remaining = await ctx.db
        .query("launchSubscriptions")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();
      return { subscribed: false, subscriberCount: remaining.length };
    } else {
      await ctx.db.insert("launchSubscriptions", {
        userId: user._id,
        productId: args.productId,
        createdAt: Date.now(),
      });
      const total = await ctx.db
        .query("launchSubscriptions")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();
      return { subscribed: true, subscriberCount: total.length };
    }
  },
});

export const hasSubscribed = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return false;
    }

    const sub = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    return sub !== null;
  },
});

export const getSubscriberCount = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    return subs.length;
  },
});

export const getMySubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const subs = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      subs.map(async (sub) => {
        const product = await ctx.db.get(sub.productId);
        if (!product) return null;

        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }

        return {
          subscriptionId: sub._id,
          subscribedAt: sub.createdAt,
          product: {
            ...product,
            logoUrl,
          },
        };
      })
    ).then((res) => res.filter((item): item is NonNullable<typeof item> => item !== null));
  },
});
