import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listAwards = query({
  args: {
    period: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("product_of_the_day"),
        v.literal("product_of_the_week"),
        v.literal("product_of_the_month")
      )
    ),
  },
  handler: async (ctx, args) => {
    let awards = await ctx.db.query("awards").collect();

    if (args.type) {
      awards = awards.filter((a) => a.type === args.type);
    }
    if (args.period) {
      awards = awards.filter((a) => a.period === args.period);
    }

    awards.sort((a, b) => a.rank - b.rank);

    return await Promise.all(
      awards.map(async (award) => {
        const product = await ctx.db.get(award.productId);
        let logoUrl = null;
        if (product?.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        return {
          ...award,
          product: product
            ? {
                ...product,
                logoUrl,
              }
            : null,
        };
      })
    );
  },
});

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    products.sort((a, b) => b.upvoteCount - a.upvoteCount);

    const top = products.slice(0, limit);

    return await Promise.all(
      top.map(async (product, index) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        return {
          ...product,
          rank: index + 1,
          logoUrl,
          submitter: submitter
            ? {
                _id: submitter._id,
                name: submitter.name,
                username: submitter.username,
                avatarUrl: submitter.avatarUrl,
              }
            : null,
        };
      })
    );
  },
});
