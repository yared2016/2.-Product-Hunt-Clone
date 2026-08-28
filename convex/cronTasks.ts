import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Helper to get formatted date string "YYYY-MM-DD"
 */
function getFormattedDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 1. Auto-publish scheduled products whose launch date has arrived.
 * Triggered every 5 minutes by Convex Crons.
 */
export const publishScheduledProducts = internalMutation({
  args: {
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const todayStr = args.targetDate || getFormattedDate(new Date());

    // Find all scheduled products with launchDate <= todayStr
    const scheduled = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    const readyToLaunch = scheduled.filter((p) => p.launchDate <= todayStr);
    const publishedIds: Id<"products">[] = [];
    let totalNotificationsSent = 0;

    for (const product of readyToLaunch) {
      // 1. Flip status to launched
      await ctx.db.patch(product._id, {
        status: "launched",
      });
      publishedIds.push(product._id);

      // 2. Fetch all launch subscribers for this product
      const subscribers = await ctx.db
        .query("launchSubscriptions")
        .withIndex("by_product", (q) => q.eq("productId", product._id))
        .collect();

      // 3. Notify subscribers in real-time
      for (const sub of subscribers) {
        await ctx.db.insert("notifications", {
          recipientId: sub.userId,
          type: "launch_live",
          title: "Product is now LIVE! 🚀",
          body: `"${product.name}" has officially launched on Launchpad! Check it out and join the discussion.`,
          linkUrl: `/products/${product.slug}`,
          relatedProductId: product._id,
          actorId: product.submitterId,
          isRead: false,
          createdAt: Date.now(),
        });
        totalNotificationsSent++;
      }

      // Also notify submitter and team makers
      await ctx.db.insert("notifications", {
        recipientId: product.submitterId,
        type: "system",
        title: "Your Product is Live! 🎉",
        body: `Congratulations! "${product.name}" has officially launched on today's leaderboard.`,
        linkUrl: `/products/${product.slug}`,
        relatedProductId: product._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return {
      publishedCount: publishedIds.length,
      notificationsSent: totalNotificationsSent,
      targetDate: todayStr,
    };
  },
});

/**
 * 2. Calculate Daily Awards (Product of the Day #1, #2, #3).
 * Triggered at Midnight 00:00 UTC every day.
 */
export const calculateDailyAwards = internalMutation({
  args: {
    targetPeriod: v.optional(v.string()), // e.g. "2026-08-28"
  },
  handler: async (ctx, args) => {
    // Yesterday or target date
    const dateToProcess = args.targetPeriod || getFormattedDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    // Check if awards were already computed for this day
    const existingAwards = await ctx.db
      .query("awards")
      .withIndex("by_type_period", (q) =>
        q.eq("type", "product_of_the_day").eq("period", dateToProcess)
      )
      .collect();

    if (existingAwards.length > 0) {
      return { status: "already_calculated", period: dateToProcess, awardsCount: existingAwards.length };
    }

    // Get all products launched on that date
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const dayProducts = products.filter((p) => p.launchDate === dateToProcess);

    if (dayProducts.length === 0) {
      return { status: "no_products_for_date", period: dateToProcess, awardsCount: 0 };
    }

    // Sort by upvotes descending, then comments descending
    dayProducts.sort((a, b) => {
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return b.commentCount - a.commentCount;
    });

    const topThree = dayProducts.slice(0, 3);
    const createdAwards: Array<{ productId: Id<"products">; rank: number }> = [];

    for (let i = 0; i < topThree.length; i++) {
      const p = topThree[i];
      const rank = i + 1;

      await ctx.db.insert("awards", {
        productId: p._id,
        type: "product_of_the_day",
        rank,
        period: dateToProcess,
        awardedAt: Date.now(),
      });

      createdAwards.push({ productId: p._id, rank });

      // Notify submitter and makers of their achievement
      const trophyEmoji = rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3";
      await ctx.db.insert("notifications", {
        recipientId: p.submitterId,
        type: "leaderboard_rank",
        title: `Trophy Unlocked! ${trophyEmoji} Product of the Day`,
        body: `"${p.name}" earned ${rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"} place on the daily leaderboard with ${p.upvoteCount} upvotes!`,
        linkUrl: `/products/${p.slug}`,
        relatedProductId: p._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return {
      status: "success",
      period: dateToProcess,
      awardsCount: createdAwards.length,
      winners: createdAwards,
    };
  },
});

/**
 * 3. Calculate Weekly Awards (Product of the Week).
 * Triggered Sunday midnight UTC.
 */
export const calculateWeeklyAwards = internalMutation({
  args: {
    period: v.optional(v.string()), // e.g. "2026-W35"
  },
  handler: async (ctx, args) => {
    const today = new Date();
    const year = today.getUTCFullYear();
    const period = args.period || `${year}-W${Math.ceil(today.getUTCDate() / 7)}`;

    const existingAwards = await ctx.db
      .query("awards")
      .withIndex("by_type_period", (q) =>
        q.eq("type", "product_of_the_week").eq("period", period)
      )
      .collect();

    if (existingAwards.length > 0) {
      return { status: "already_calculated", period, count: existingAwards.length };
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    // Sort by upvotes
    products.sort((a, b) => b.upvoteCount - a.upvoteCount);
    const topThree = products.slice(0, 3);

    for (let i = 0; i < topThree.length; i++) {
      const p = topThree[i];
      const rank = i + 1;

      await ctx.db.insert("awards", {
        productId: p._id,
        type: "product_of_the_week",
        rank,
        period,
        awardedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        recipientId: p.submitterId,
        type: "leaderboard_rank",
        title: `🏆 Product of the Week (Rank #${rank})`,
        body: `"${p.name}" was crowned #${rank} Product of the Week on Launchpad!`,
        linkUrl: `/products/${p.slug}`,
        relatedProductId: p._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { status: "success", period, winnersCount: topThree.length };
  },
});

/**
 * 4. Calculate Monthly Awards (Product of the Month).
 * Triggered 1st of every month at 00:00 UTC.
 */
export const calculateMonthlyAwards = internalMutation({
  args: {
    period: v.optional(v.string()), // e.g. "2026-08"
  },
  handler: async (ctx, args) => {
    const today = new Date();
    const period = args.period || `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}`;

    const existingAwards = await ctx.db
      .query("awards")
      .withIndex("by_type_period", (q) =>
        q.eq("type", "product_of_the_month").eq("period", period)
      )
      .collect();

    if (existingAwards.length > 0) {
      return { status: "already_calculated", period, count: existingAwards.length };
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    products.sort((a, b) => b.upvoteCount - a.upvoteCount);
    const topThree = products.slice(0, 3);

    for (let i = 0; i < topThree.length; i++) {
      const p = topThree[i];
      const rank = i + 1;

      await ctx.db.insert("awards", {
        productId: p._id,
        type: "product_of_the_month",
        rank,
        period,
        awardedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        recipientId: p.submitterId,
        type: "leaderboard_rank",
        title: `🌟 Hall of Fame: Product of the Month (Rank #${rank})`,
        body: `"${p.name}" has officially been entered into the Launchpad Hall of Fame as Product of the Month!`,
        linkUrl: `/products/${p.slug}`,
        relatedProductId: p._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { status: "success", period, winnersCount: topThree.length };
  },
});

/**
 * 5. Audit Pro promotions and verify user active status.
 * Triggered daily by Convex Crons.
 */
export const auditProPromotions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const promotedProducts = await ctx.db
      .query("products")
      .collect();

    let adjustedCount = 0;

    for (const p of promotedProducts) {
      if (p.isPromoted) {
        const submitter = await ctx.db.get(p.submitterId);
        const isUserPro = Boolean(submitter?.isPro || submitter?.plan === "pro");

        if (!isUserPro) {
          // Submitter is no longer Pro; gracefully reset listing boost
          await ctx.db.patch(p._id, {
            isPromoted: false,
            promotedAt: undefined,
            promoBadgeText: undefined,
          });
          adjustedCount++;
        }
      }
    }

    return { status: "audit_complete", adjustedCount };
  },
});

/**
 * 6. Clean up old read notifications (>30 days).
 * Triggered weekly on Sunday 03:00 UTC.
 */
export const cleanupOldNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const notifications = await ctx.db.query("notifications").collect();

    let deletedCount = 0;
    for (const n of notifications) {
      if (n.isRead && n.createdAt < thirtyDaysAgo) {
        await ctx.db.delete(n._id);
        deletedCount++;
      }
    }

    return { status: "cleanup_complete", deletedCount };
  },
});
