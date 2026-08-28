import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * 1. Auto-publish scheduled launches every 5 minutes.
 * Checks for products with status "scheduled" where launchDate <= today,
 * transitions them to "launched", and notifies all subscribers.
 */
crons.interval(
  "auto-publish-scheduled-products",
  { minutes: 5 },
  internal.cronTasks.publishScheduledProducts,
  {}
);

/**
 * 2. Daily "Product of the Day" Awards Engine.
 * Runs daily at midnight (00:00 UTC) to freeze daily upvotes,
 * determine the #1, #2, and #3 winners, record awards, and notify makers.
 */
crons.cron(
  "daily-awards-calculation",
  "0 0 * * *",
  internal.cronTasks.calculateDailyAwards,
  {}
);

/**
 * 3. Weekly "Product of the Week" Awards Engine.
 * Runs every Sunday at midnight (00:00 UTC) to aggregate weekly champions.
 */
crons.cron(
  "weekly-awards-calculation",
  "0 0 * * 0",
  internal.cronTasks.calculateWeeklyAwards,
  {}
);

/**
 * 4. Monthly "Product of the Month" Hall of Fame Engine.
 * Runs on the 1st of every month at 00:00 UTC.
 */
crons.cron(
  "monthly-awards-calculation",
  "0 0 1 * *",
  internal.cronTasks.calculateMonthlyAwards,
  {}
);

/**
 * 5. Pro Superuser Promotion & Subscription Audit.
 * Runs daily at 04:00 UTC to ensure active listing boosts match active Pro plans.
 */
crons.cron(
  "audit-pro-promotions",
  "0 4 * * *",
  internal.cronTasks.auditProPromotions,
  {}
);

/**
 * 6. Database Hygiene & Old Notification Cleanup.
 * Runs weekly on Sunday at 03:00 UTC to delete read notifications older than 30 days.
 */
crons.cron(
  "cleanup-old-notifications",
  "0 3 * * 0",
  internal.cronTasks.cleanupOldNotifications,
  {}
);

export default crons;
