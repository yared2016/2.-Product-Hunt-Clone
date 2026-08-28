import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
      });
      return existingUser._id;
    }

    // Ensure username uniqueness
    let username = args.username.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    const baseUsername = username;
    let counter = 1;
    while (true) {
      const taken = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      if (!taken) break;
      username = `${baseUsername}${counter++}`;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      username,
      email: args.email,
      avatarUrl: args.avatarUrl,
      createdAt: Date.now(),
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const getOrCreateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx) => {
    return await getOrCreateCurrentUser(ctx);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return null;
    }

    // Compute maker stats
    const products = await ctx.db
      .query("products")
      .withIndex("by_submitter", (q) => q.eq("submitterId", user._id))
      .collect();

    const totalUpvotes = products.reduce((sum, p) => sum + p.upvoteCount, 0);
    const totalComments = products.reduce((sum, p) => sum + p.commentCount, 0);

    return {
      ...user,
      stats: {
        totalProducts: products.length,
        launchedProducts: products.filter((p) => p.status === "launched").length,
        scheduledProducts: products.filter((p) => p.status === "scheduled").length,
        draftProducts: products.filter((p) => p.status === "draft").length,
        totalUpvotes,
        totalComments,
      },
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    // Validate and check username uniqueness if changed
    if (args.username && args.username !== user.username) {
      const sanitized = args.username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (sanitized.length < 3) {
        throw new Error("Username must be at least 3 characters (letters, numbers, underscores).");
      }

      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", sanitized))
        .first();

      if (existing && existing._id !== user._id) {
        throw new Error("Username is already taken. Please choose another.");
      }

      args.username = sanitized;
    }

    const updates: {
      name?: string;
      username?: string;
      bio?: string;
      websiteUrl?: string;
      avatarUrl?: string;
    } = {};

    if (args.name !== undefined) updates.name = args.name.trim() || user.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.bio !== undefined) updates.bio = args.bio.trim();
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl.trim();
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl.trim();

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const searchUsers = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.search.trim()) {
      return [];
    }

    const term = args.search.toLowerCase().trim();
    const users = await ctx.db.query("users").take(50);

    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
      .slice(0, 8)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
      }));
  },
});

export const getMakerLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const users = await ctx.db.query("users").collect();
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const makerStats = users.map((user) => {
      const userProducts = products.filter(
        (p) => p.submitterId === user._id || (p.makerIds ?? []).includes(user._id)
      );
      const totalUpvotes = userProducts.reduce((sum, p) => sum + p.upvoteCount, 0);

      return {
        _id: user._id,
        name: user.name?.trim() || "Maker",
        username: user.username?.trim() || "maker",
        avatarUrl: user.avatarUrl?.trim() || undefined,
        bio: user.bio?.trim() || "Active product creator on Launchpad",
        websiteUrl: user.websiteUrl?.trim() || undefined,
        productCount: userProducts.length,
        totalUpvotes,
      };
    });

    // Filter makers with at least 1 product or upvote
    const activeMakers = makerStats.filter((m) => m.productCount > 0 || m.totalUpvotes > 0);
    activeMakers.sort((a, b) => {
      if (b.totalUpvotes !== a.totalUpvotes) {
        return b.totalUpvotes - a.totalUpvotes;
      }
      return b.productCount - a.productCount;
    });

    return activeMakers.slice(0, limit).map((m, idx) => ({
      ...m,
      rank: idx + 1,
    }));
  },
});

// ─── Subscription & Clerk Billing Integrations ─────────────────
export const syncSubscription = mutation({
  args: {
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const isPro = args.plan === "pro";
    await ctx.db.patch(user._id, {
      plan: args.plan,
      isPro,
      proSubscribedAt: isPro ? (user.proSubscribedAt || Date.now()) : undefined,
    });
    return { success: true, plan: args.plan, isPro };
  },
});

export const upgradeToPro = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      plan: "pro",
      isPro: true,
      proSubscribedAt: Date.now(),
    });
    return { success: true, plan: "pro", isPro: true };
  },
});

export const downgradeToFree = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      plan: "free",
      isPro: false,
    });
    return { success: true, plan: "free", isPro: false };
  },
});