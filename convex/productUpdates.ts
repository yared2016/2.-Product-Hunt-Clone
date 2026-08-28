import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export interface ProductUpdateWithAuthor extends Doc<"productUpdates"> {
  author: {
    name: string;
    username: string;
    avatarUrl?: string;
  } | null;
}

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args): Promise<ProductUpdateWithAuthor[]> => {
    const updates = await ctx.db
      .query("productUpdates")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();

    const results: ProductUpdateWithAuthor[] = await Promise.all(
      updates.map(async (update) => {
        const author = await ctx.db.get(update.authorId);
        return {
          ...update,
          author: author
            ? {
                name: author.name,
                username: author.username,
                avatarUrl: author.avatarUrl,
              }
            : null,
        };
      })
    );

    return results;
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    version: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"productUpdates">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to post an update.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User profile not found.");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    // Verify user is submitter or tagged maker
    const isSubmitter = product.submitterId === user._id;
    const isTaggedMaker = product.makerIds?.includes(user._id);

    if (!isSubmitter && !isTaggedMaker) {
      throw new Error("Only product makers can post changelog updates.");
    }

    const updateId = await ctx.db.insert("productUpdates", {
      productId: args.productId,
      authorId: user._id,
      version: args.version.trim(),
      title: args.title.trim(),
      body: args.body.trim(),
      createdAt: Date.now(),
    });

    return updateId;
  },
});
