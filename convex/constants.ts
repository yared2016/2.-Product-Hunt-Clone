/**
 * Convex Backend Constants
 * Single source of truth for platform anchor date and server enums.
 */

export const BASE_DATE = "2026-08-28" as const;

export const DEFAULT_PAGE_LIMIT = 20;

export const AWARD_TYPES = {
  DAILY: "product_of_the_day",
  WEEKLY: "product_of_the_week",
  MONTHLY: "product_of_the_month",
} as const;

export const PROMO_BADGE_DEFAULT = "PRO SPONSORED";
