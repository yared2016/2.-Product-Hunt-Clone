/**
 * Application Constants
 * Single source of truth for base dates, categories, roles, pricing, routes, and plans.
 */

export const BASE_DATE = "2026-08-28" as const;

export const APP_CONFIG = {
  NAME: "Launchpad",
  TAGLINE: "The next generation product discovery & launch platform",
  URL: "https://launchpad.dev",
  SUPPORT_EMAIL: "support@launchpad.dev",
  BASE_DATE: "2026-08-28",
} as const;

export const ROUTES = {
  HOME: "/",
  SUBMIT: "/submit",
  LEADERBOARD: "/leaderboard",
  AWARDS: "/awards",
  BOOKMARKS: "/bookmarks",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SEARCH: "/search",
  UPGRADE: "/upgrade",
  PRICING: "/pricing",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  CATEGORIES: (slug?: string) => (slug ? `/categories/${slug}` : "/categories"),
  PRODUCT: (slug: string) => `/products/${slug}`,
  PRODUCT_EDIT: (slug: string) => `/products/${slug}/edit`,
} as const;

export const PRODUCT_CATEGORIES = [
  {
    name: "AI",
    slug: "ai",
    description: "Artificial intelligence, machine learning models, and LLM applications.",
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description: "IDEs, APIs, SDKs, CI/CD pipelines, and infrastructure tools for builders.",
  },
  {
    name: "SaaS",
    slug: "saas",
    description: "Software-as-a-Service platforms, cloud software, and B2B solutions.",
  },
  {
    name: "Design Tools",
    slug: "design-tools",
    description: "UI/UX design kits, vector graphics, prototyping, and asset generators.",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Task managers, note-taking apps, calendar tools, and workflow automation.",
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "SEO tools, analytics dashboards, email automation, and growth platforms.",
  },
  {
    name: "Crypto",
    slug: "crypto",
    description: "Web3 tools, decentralized apps, wallets, smart contracts, and DeFi.",
  },
  {
    name: "Open Source",
    slug: "open-source",
    description: "Public repositories, open libraries, and community-maintained software.",
  },
] as const;

export const CATEGORY_NAMES = PRODUCT_CATEGORIES.map((c) => c.name);

export const STANDARD_MAKER_ROLES = [
  "CEO",
  "Founder",
  "Co-Founder",
  "CTO",
  "Lead Developer",
  "Product Designer",
  "Head of Product",
  "Marketing & Growth",
  "Maker",
] as const;

export const PRICING_MODELS = [
  {
    id: "free" as const,
    label: "Free",
    description: "100% free to use for all users with no hidden costs.",
  },
  {
    id: "freemium" as const,
    label: "Freemium",
    description: "Free core features with paid premium tiers or upgrades.",
  },
  {
    id: "paid" as const,
    label: "Paid",
    description: "Requires a one-time purchase or paid subscription to access.",
  },
] as const;

export type PricingType = (typeof PRICING_MODELS)[number]["id"];

export const PLANS = {
  FREE: {
    id: "free" as const,
    name: "Free Community",
    price: 0,
    priceLabel: "$0",
    interval: "month",
    description: "For indie makers and community members getting started.",
    features: [
      "Unlimited product submissions",
      "Public maker profile & portfolio",
      "Community comments & upvotes",
      "Standard algorithmic leaderboard feed",
    ],
  },
  PRO: {
    id: "pro" as const,
    name: "Pro Superuser",
    price: 99,
    priceLabel: "$99",
    interval: "month",
    badgeText: "PRO SPONSORED",
    description: "For serious creators seeking maximum launch visibility.",
    features: [
      "Top of Feed Boost: Push listings to #1 on daily rankings",
      "Radiant PRO SPONSORED Gold Badging",
      "Pro Maker Crown badge across comments & profile",
      "Real-time Upvote Velocity & traffic analytics",
      "Priority Search Indexing",
      "Maker Dashboard Launch Boost Manager",
    ],
  },
} as const;

export const FAQ_ITEMS = [
  {
    q: "What is the Pro Superuser plan?",
    a: "The Pro Superuser plan ($99/month) is designed for serious makers, indie hackers, and startup founders who want maximum visibility for their products. Pro users can boost their launched products directly to the top of daily feeds and rankings with exclusive PRO SPONSORED badging.",
  },
  {
    q: "How does the Top of Feed (Sponsored Boost) work?",
    a: "When you boost a product, our ranking algorithm places your listing at the top slot of the daily leaderboard, homepage discovery feed, and category filters with a vibrant Pro aura, giving your launch 5-10x more visibility and community upvotes.",
  },
  {
    q: "Can I launch products on the Free plan?",
    a: "Yes! Every user on Launchpad starts on the Free tier ($0) and can create unlimited product launches, join community discussions, and earn badges. Pro is for creators seeking an algorithmic visibility superpower.",
  },
  {
    q: "How does billing work?",
    a: "Subscriptions are billed monthly at $99/month via Clerk's secure billing engine. You can upgrade, change payment methods, or cancel anytime with one click.",
  },
] as const;

export const AWARD_TYPES = {
  DAILY: "product_of_the_day" as const,
  WEEKLY: "product_of_the_week" as const,
  MONTHLY: "product_of_the_month" as const,
} as const;

export const TIMEFRAMES = {
  TODAY: "today" as const,
  YESTERDAY: "yesterday" as const,
  WEEK: "week" as const,
  MONTH: "month" as const,
  YEAR: "year" as const,
  ALL_TIME: "all_time" as const,
} as const;
