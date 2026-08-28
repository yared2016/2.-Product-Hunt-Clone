import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";
import { Id } from "./_generated/dataModel";

export const getMyNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const limit = args.limit ?? 50;

    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(limit);

    return await Promise.all(
      notifs.map(async (n) => {
        let actor = null;
        if (n.actorId) {
          const actorDoc = await ctx.db.get(n.actorId);
          if (actorDoc) {
            actor = {
              _id: actorDoc._id,
              name: actorDoc.name,
              username: actorDoc.username,
              avatarUrl: actorDoc.avatarUrl,
            };
          }
        }

        let product = null;
        if (n.relatedProductId) {
          const prodDoc = await ctx.db.get(n.relatedProductId);
          if (prodDoc) {
            product = {
              _id: prodDoc._id,
              name: prodDoc.name,
              slug: prodDoc.slug,
            };
          }
        }

        return {
          ...n,
          actor,
          product,
        };
      })
    );
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return 0;
    }

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) {
      return { success: false };
    }

    if (notif.recipientId !== user._id) {
      throw new Error("Unauthorized to mark this notification as read");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false)
      )
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }

    return { updatedCount: unread.length };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateCurrentUser(ctx);

    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .collect();

    for (const notif of notifs) {
      await ctx.db.delete(notif._id);
    }

    return { deletedCount: notifs.length };
  },
});

export const remove = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) {
      return { success: false };
    }

    if (notif.recipientId !== user._id) {
      throw new Error("Unauthorized to delete this notification");
    }

    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

export const createNotification = internalMutation({
  args: {
    recipientId: v.id("users"),
    type: v.union(
      v.literal("upvote"),
      v.literal("comment"),
      v.literal("reply"),
      v.literal("launch_live"),
      v.literal("leaderboard_rank"),
      v.literal("system")
    ),
    title: v.string(),
    body: v.string(),
    linkUrl: v.optional(v.string()),
    relatedProductId: v.optional(v.id("products")),
    actorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Don't notify oneself
    if (args.actorId && args.actorId === args.recipientId) {
      return null;
    }

    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      type: args.type,
      title: args.title,
      body: args.body,
      linkUrl: args.linkUrl,
      relatedProductId: args.relatedProductId,
      actorId: args.actorId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
