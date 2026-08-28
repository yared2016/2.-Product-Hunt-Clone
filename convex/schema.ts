import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── 1. Awards ───────────────────────────────────────────
  awards: defineTable({
    productId: v.id("products"),
    type: v.union(
      v.literal("product_of_the_day"),
      v.literal("product_of_the_week"),
      v.literal("product_of_the_month"),
    ),
    rank: v.number(),             // 1st, 2nd, 3rd
    period: v.string(),           // "YYYY-MM-DD", "YYYY-Www", "YYYY-MM"
    awardedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_type_period", ["type", "period"]),

  // ─── 2. Categories ───────────────────────────────────────
  categories: defineTable({
    name: v.string(),             // "AI", "Developer Tools", etc.
    slug: v.string(),             // "ai", "developer-tools"
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  // ─── 3. Comments ─────────────────────────────────────────
  comments: defineTable({
    productId: v.id("products"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),  // null = top-level
    body: v.string(),
    upvoteCount: v.number(),
    isPinned: v.optional(v.boolean()),       // pinned by maker/founder
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_parent", ["parentId"]),

  // ─── 4. Comment Upvotes ──────────────────────────────────
  commentUpvotes: defineTable({
    userId: v.id("users"),
    commentId: v.id("comments"),
    createdAt: v.number(),
  })
    .index("by_user_comment", ["userId", "commentId"])
    .index("by_comment", ["commentId"]),

  // ─── 5. Product Images ───────────────────────────────────
  productImages: defineTable({
    productId: v.id("products"),
    storageId: v.id("_storage"),
    isPrimary: v.boolean(),       // true for logo/main thumbnail
    order: v.number(),            // display order
  })
    .index("by_product", ["productId"])
    .index("by_product_primary", ["productId", "isPrimary"]),

  // ─── 6. Product Makers (Join Table) ──────────────────────
  productMakers: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    role: v.optional(v.string()), // "maker", "founder", etc.
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_product_user", ["productId", "userId"]),

  // ─── 7. Products ─────────────────────────────────────────
  products: defineTable({
    name: v.string(),
    slug: v.string(),             // URL-friendly, unique
    tagline: v.string(),          // one-liner (60 chars max)
    description: v.string(),      // markdown description
    websiteUrl: v.string(),
    logoId: v.optional(v.id("_storage")),
    galleryIds: v.optional(v.array(v.id("_storage"))),
    videoUrl: v.optional(v.string()),
    pricing: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
    ),
    categories: v.array(v.string()),         // e.g. ["AI", "SaaS"]
    topics: v.optional(v.array(v.string())),
    submitterId: v.id("users"),              // user ref
    makerIds: v.optional(v.array(v.id("users"))),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("launched"),
    ),
    launchDate: v.string(),                  // "YYYY-MM-DD"
    upvoteCount: v.number(),                 // denormalized for fast sort
    commentCount: v.number(),                // denormalized
    isFeatured: v.boolean(),                 // staff pick / featured
    promoCode: v.optional(v.string()),       // optional launch discount code
    promoDiscount: v.optional(v.string()),   // e.g. "30% OFF", "FREE FOR 3 MONTHS"
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_launchDate", ["launchDate"])
    .index("by_launchDate_upvotes", ["launchDate", "upvoteCount"])
    .index("by_category", ["categories"])
    .index("by_submitter", ["submitterId"])
    .index("by_status", ["status"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["categories", "pricing", "launchDate"],
    }),

  // ─── 8. Product Upvotes ──────────────────────────────────
  productUpvotes: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user_product", ["userId", "productId"])
    .index("by_product", ["productId"]),

  // ─── 9. Users ────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),          // Clerk user ID
    name: v.string(),
    username: v.string(),         // unique handle
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    createdAt: v.number(),        // epoch ms
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  // ─── 10. Notifications ───────────────────────────────────
  notifications: defineTable({
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
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_unread", ["recipientId", "isRead"]),

  // ─── 11. Launch Subscriptions ("Notify Me") ──────────────
  launchSubscriptions: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    createdAt: v.number(),
  })
    .index("by_user_product", ["userId", "productId"])
    .index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  // ─── 12. Collections ─────────────────────────────────────
  collections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  // ─── 13. Bookmarks ───────────────────────────────────────
  bookmarks: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    collectionId: v.optional(v.id("collections")),
    createdAt: v.number(),
  })
    .index("by_user_product", ["userId", "productId"])
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_collection", ["collectionId"]),

  // ─── 14. Product Updates / Changelogs ────────────────────
  productUpdates: defineTable({
    productId: v.id("products"),
    authorId: v.id("users"),
    version: v.string(), // "v1.1", "v2.0", "Major Update"
    title: v.string(),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_author", ["authorId"]),
});
