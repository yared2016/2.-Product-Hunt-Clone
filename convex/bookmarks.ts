import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";
import { Id } from "./_generated/dataModel";

export const toggle = mutation({
  args: {
    productId: v.id("products"),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    } else {
      await ctx.db.insert("bookmarks", {
        userId: user._id,
        productId: args.productId,
        collectionId: args.collectionId,
        createdAt: Date.now(),
      });
      return { bookmarked: true };
    }
  },
});

export const hasBookmarked = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return false;
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    return bookmark !== null;
  },
});

export const getMyBookmarkedProductIds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [] as Id<"products">[];
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return bookmarks.map((b) => b.productId);
  },
});

export const getMyBookmarks = query({
  args: {
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    let bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (args.collectionId) {
      bookmarks = bookmarks.filter((b) => b.collectionId === args.collectionId);
    }

    bookmarks.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      bookmarks.map(async (b) => {
        const product = await ctx.db.get(b.productId);
        if (!product) return null;

        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }

        let collection = null;
        if (b.collectionId) {
          const colDoc = await ctx.db.get(b.collectionId);
          if (colDoc) {
            collection = {
              _id: colDoc._id,
              name: colDoc.name,
              slug: colDoc.slug,
            };
          }
        }

        return {
          bookmarkId: b._id,
          bookmarkedAt: b.createdAt,
          collection,
          product: {
            ...product,
            logoUrl,
          },
        };
      })
    ).then((res) => res.filter((item): item is NonNullable<typeof item> => item !== null));
  },
});

export const createCollection = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const cleanSlug = args.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    let slug = cleanSlug || "collection";
    let counter = 1;

    while (true) {
      const existing = await ctx.db
        .query("collections")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${cleanSlug}-${counter++}`;
    }

    return await ctx.db.insert("collections", {
      userId: user._id,
      name: args.name.trim(),
      slug,
      description: args.description?.trim(),
      visibility: args.visibility,
      createdAt: Date.now(),
    });
  },
});

export const updateCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const col = await ctx.db.get(args.collectionId);
    if (!col || col.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    const updates: {
      name?: string;
      description?: string;
      visibility?: "public" | "private";
    } = {};

    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined) updates.description = args.description.trim();
    if (args.visibility !== undefined) updates.visibility = args.visibility;

    await ctx.db.patch(args.collectionId, updates);
    return args.collectionId;
  },
});

export const deleteCollection = mutation({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const col = await ctx.db.get(args.collectionId);
    if (!col || col.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    // Unlink bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_collection", (q) => q.eq("collectionId", col._id))
      .collect();

    for (const b of bookmarks) {
      await ctx.db.patch(b._id, { collectionId: undefined });
    }

    await ctx.db.delete(col._id);
    return { success: true };
  },
});

export const getMyCollections = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      collections.map(async (col) => {
        const bookmarks = await ctx.db
          .query("bookmarks")
          .withIndex("by_collection", (q) => q.eq("collectionId", col._id))
          .collect();

        return {
          ...col,
          itemCount: bookmarks.length,
        };
      })
    );
  },
});

export const addToCollection = mutation({
  args: {
    productId: v.id("products"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const col = await ctx.db.get(args.collectionId);
    if (!col || col.userId !== user._id) {
      throw new Error("Collection not found or unauthorized");
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (bookmark) {
      await ctx.db.patch(bookmark._id, { collectionId: args.collectionId });
      return bookmark._id;
    } else {
      return await ctx.db.insert("bookmarks", {
        userId: user._id,
        productId: args.productId,
        collectionId: args.collectionId,
        createdAt: Date.now(),
      });
    }
  },
});

export const removeFromCollection = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .first();

    if (bookmark) {
      await ctx.db.patch(bookmark._id, { collectionId: undefined });
    }

    return { success: true };
  },
});
