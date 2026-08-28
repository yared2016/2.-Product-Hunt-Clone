import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateCurrentUser, getCurrentUserOrNull } from "./authHelper";
import { Id } from "./_generated/dataModel";

export const listByDate = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
    filter: v.optional(v.union(v.literal("all"), v.literal("featured"), v.literal("trending"))),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_launchDate", (q) => q.eq("launchDate", args.date))
      .filter((q) => q.eq(q.field("status"), "launched"))
      .collect();

    if (args.filter === "featured") {
      products = products.filter((p) => p.isFeatured);
    }

    // Sort: Promoted (Pro Boosted) products first, then by upvoteCount descending
    products.sort((a, b) => {
      const aProm = a.isPromoted ? 1 : 0;
      const bProm = b.isPromoted ? 1 : 0;
      if (bProm !== aProm) return bProm - aProm;
      return b.upvoteCount - a.upvoteCount;
    });

    // Enrich with logo URL and submitter info
    return await Promise.all(
      products.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        return {
          ...product,
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

export const listTrending = query({
  args: {
    timeframe: v.optional(
      v.union(
        v.literal("today"),
        v.literal("week"),
        v.literal("month"),
        v.literal("year"),
        v.literal("all")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 25;
    const timeframe = args.timeframe ?? "today";

    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    // Base current date anchor: 2026-08-27
    const todayStr = "2026-08-27";
    const sevenDaysAgoStr = "2026-08-20";
    const thirtyDaysAgoStr = "2026-07-28";
    const yearStartStr = "2026-01-01";

    if (timeframe === "today") {
      products = products.filter((p) => p.launchDate >= todayStr);
      // Fallback: if fewer than 5 launched today, include recent launches
      if (products.length < 3) {
        const allLaunched = await ctx.db
          .query("products")
          .withIndex("by_status", (q) => q.eq("status", "launched"))
          .collect();
        products = allLaunched;
      }
    } else if (timeframe === "week") {
      products = products.filter((p) => p.launchDate >= sevenDaysAgoStr);
    } else if (timeframe === "month") {
      products = products.filter((p) => p.launchDate >= thirtyDaysAgoStr);
    } else if (timeframe === "year") {
      products = products.filter((p) => p.launchDate >= yearStartStr);
    }

    // Sort: Promoted (Pro Boosted) first, then by upvoteCount descending
    products.sort((a, b) => {
      const aProm = a.isPromoted ? 1 : 0;
      const bProm = b.isPromoted ? 1 : 0;
      if (bProm !== aProm) return bProm - aProm;
      return b.upvoteCount - a.upvoteCount;
    });
    const topTrending = products.slice(0, limit);

    return await Promise.all(
      topTrending.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        return {
          ...product,
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

export const listFeatured = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .filter((q) => q.eq(q.field("isFeatured"), true))
      .take(limit);

    products.sort((a, b) => b.upvoteCount - a.upvoteCount);

    return await Promise.all(
      products.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        return {
          ...product,
          logoUrl,
        };
      })
    );
  },
});

export const search = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const searchTerm = args.query.toLowerCase().trim();
    if (searchTerm) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.tagline.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.categories.some((c) => c.toLowerCase().includes(searchTerm))
      );
    }

    if (args.category && args.category !== "All") {
      products = products.filter((p) => p.categories.includes(args.category!));
    }

    if (args.pricing) {
      products = products.filter((p) => p.pricing === args.pricing);
    }

    products.sort((a, b) => b.upvoteCount - a.upvoteCount);

    return await Promise.all(
      products.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        return {
          ...product,
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

export const listByCategory = query({
  args: {
    category: v.optional(v.string()),
    categorySlug: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
    sortBy: v.optional(v.union(v.literal("upvotes"), v.literal("newest"))),
  },
  handler: async (ctx, args) => {
    const slug = args.categorySlug || (args.category ? args.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "ai");

    // Look up category in database
    const categoryDoc = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    const categoryName = categoryDoc ? categoryDoc.name : (args.category || slug.toUpperCase());

    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const catNormalized = categoryName.toLowerCase().replace(/-/g, " ");
    const slugNormalized = slug.toLowerCase().replace(/-/g, " ");

    products = products.filter((p) =>
      p.categories.some((c) => {
        const cNorm = c.toLowerCase().replace(/-/g, " ");
        return cNorm === catNormalized || cNorm === slugNormalized || cNorm.includes(slugNormalized);
      })
    );

    if (args.pricing) {
      products = products.filter((p) => p.pricing === args.pricing);
    }

    products.sort((a, b) => {
      const aProm = a.isPromoted ? 1 : 0;
      const bProm = b.isPromoted ? 1 : 0;
      if (bProm !== aProm) return bProm - aProm;
      if (args.sortBy === "newest") {
        return b.createdAt - a.createdAt;
      }
      return b.upvoteCount - a.upvoteCount;
    });

    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        return {
          ...product,
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

    return {
      category: {
        _id: categoryDoc?._id,
        name: categoryDoc?.name || categoryName,
        slug: categoryDoc?.slug || slug,
        description: categoryDoc?.description || `Explore top products and tools built for ${categoryName}.`,
      },
      products: enrichedProducts,
    };
  },
});

export const getLeaderboard = query({
  args: {
    timeframe: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("all_time")
    ),
    period: v.optional(v.string()), // e.g. "2026-08-28" for daily, "2026-08" for monthly
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const requestedPeriod = args.period || (args.timeframe === "monthly" ? "2026-08" : "2026-08-28");

    if (args.timeframe === "daily") {
      products = products.filter((p) => p.launchDate === requestedPeriod);
    } else if (args.timeframe === "monthly") {
      products = products.filter((p) => p.launchDate.startsWith(requestedPeriod));
    } else if (args.timeframe === "weekly") {
      // Weekly timeframe: includes launches within past 7 days of base date
      products = products.filter((p) => p.launchDate >= "2026-08-21" && p.launchDate <= "2026-08-28");
    }
    // all_time uses all launched products

    // Sort: Promoted (Pro Boosted) products first, then by upvotes descending, then comments descending
    products.sort((a, b) => {
      const aProm = a.isPromoted ? 1 : 0;
      const bProm = b.isPromoted ? 1 : 0;
      if (bProm !== aProm) return bProm - aProm;
      if (b.upvoteCount !== a.upvoteCount) {
        return b.upvoteCount - a.upvoteCount;
      }
      return b.commentCount - a.commentCount;
    });

    const totalUpvotes = products.reduce((sum, p) => sum + p.upvoteCount, 0);

    const enriched = await Promise.all(
      products.map(async (product, idx) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        const submitter = await ctx.db.get(product.submitterId);
        const makers = await Promise.all(
          (product.makerIds ?? []).map(async (id) => {
            const u = await ctx.db.get(id);
            return u
              ? {
                  _id: u._id,
                  name: u.name,
                  username: u.username,
                  avatarUrl: u.avatarUrl,
                }
              : null;
          })
        );

        return {
          ...product,
          rank: idx + 1,
          logoUrl,
          submitter: submitter
            ? {
                _id: submitter._id,
                name: submitter.name,
                username: submitter.username,
                avatarUrl: submitter.avatarUrl,
              }
            : null,
          makers: makers.filter((m): m is NonNullable<typeof m> => m !== null),
        };
      })
    );

    return {
      timeframe: args.timeframe,
      period: requestedPeriod,
      totalProducts: products.length,
      totalUpvotes,
      products: enriched,
    };
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!product) {
      return null;
    }

    let logoUrl = null;
    if (product.logoId) {
      logoUrl = await ctx.storage.getUrl(product.logoId);
    }

    let galleryUrls: string[] = [];
    if (product.galleryIds && product.galleryIds.length > 0) {
      const urls = await Promise.all(
        product.galleryIds.map((id) => ctx.storage.getUrl(id))
      );
      galleryUrls = urls.filter((url): url is string => url !== null);
    }

    const submitter = await ctx.db.get(product.submitterId);

    // Fetch maker roles from productMakers join table
    const makerJoinRecords = await ctx.db
      .query("productMakers")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();

    const makerRoleMap = new Map<Id<"users">, string>();
    for (const rec of makerJoinRecords) {
      if (rec.role) {
        makerRoleMap.set(rec.userId, rec.role);
      }
    }

    const uniqueMakerIds = Array.from(
      new Set([
        product.submitterId,
        ...(product.makerIds ?? []),
        ...makerJoinRecords.map((r) => r.userId),
      ])
    );

    const makers = await Promise.all(
      uniqueMakerIds.map(async (id) => {
        const user = await ctx.db.get(id);
        if (!user) return null;
        const role = makerRoleMap.get(id) || (id === product.submitterId ? "Founder" : "Maker");
        return {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          role,
        };
      })
    );

    // Calculate daily rank for the product on its launch date
    const sameDayProducts = await ctx.db
      .query("products")
      .withIndex("by_launchDate", (q) => q.eq("launchDate", product.launchDate))
      .filter((q) => q.eq(q.field("status"), "launched"))
      .collect();

    sameDayProducts.sort((a, b) => b.upvoteCount - a.upvoteCount);
    const rankIndex = sameDayProducts.findIndex((p) => p._id === product._id);
    const dailyRank = product.status === "launched" ? (rankIndex !== -1 ? rankIndex + 1 : 1) : null;

    return {
      ...product,
      dailyRank,
      logoUrl,
      galleryUrls,
      submitter: submitter
        ? {
            _id: submitter._id,
            name: submitter.name,
            username: submitter.username,
            avatarUrl: submitter.avatarUrl,
            bio: submitter.bio,
            role: makerRoleMap.get(submitter._id) || "Founder",
          }
        : null,
      makers: makers.filter((m): m is NonNullable<typeof m> => m !== null),
    };
  },
});

export const getSimilarProducts = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const targetProduct = await ctx.db.get(args.productId);
    if (!targetProduct) {
      return [];
    }

    const limit = args.limit ?? 4;
    const launchedProducts = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "launched"))
      .collect();

    const targetCats = new Set(targetProduct.categories.map((c) => c.toLowerCase()));

    // Filter out the product itself and find products with overlapping categories
    const similar = launchedProducts.filter(
      (p) =>
        p._id !== targetProduct._id &&
        p.categories.some((c) => targetCats.has(c.toLowerCase()))
    );

    // Sort by shared categories count, then by upvotes
    similar.sort((a, b) => {
      const aOverlap = a.categories.filter((c) => targetCats.has(c.toLowerCase())).length;
      const bOverlap = b.categories.filter((c) => targetCats.has(c.toLowerCase())).length;
      if (bOverlap !== aOverlap) {
        return bOverlap - aOverlap;
      }
      return b.upvoteCount - a.upvoteCount;
    });

    const topSimilar = similar.slice(0, limit);

    return await Promise.all(
      topSimilar.map(async (p) => {
        let logoUrl = null;
        if (p.logoId) {
          logoUrl = await ctx.storage.getUrl(p.logoId);
        }
        return {
          _id: p._id,
          name: p.name,
          slug: p.slug,
          tagline: p.tagline,
          pricing: p.pricing,
          categories: p.categories,
          upvoteCount: p.upvoteCount,
          commentCount: p.commentCount,
          logoUrl,
        };
      })
    );
  },
});

export const isSlugAvailable = query({
  args: {
    slug: v.string(),
    excludeProductId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const cleanSlug = args.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    if (!cleanSlug) {
      return { available: false, cleanSlug: "", suggestion: null, reason: "Slug cannot be empty" };
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existing && (!args.excludeProductId || existing._id !== args.excludeProductId)) {
      // Find a creative, available alternative slug
      let suggestion = `${cleanSlug}-2`;
      const cand1 = `${cleanSlug}-app`;
      const cand2 = `${cleanSlug}-ai`;
      const cand3 = `${cleanSlug}-launch`;

      const check1 = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", cand1)).first();
      const check2 = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", cand2)).first();
      const check3 = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", cand3)).first();

      if (!check1) suggestion = cand1;
      else if (!check2) suggestion = cand2;
      else if (!check3) suggestion = cand3;
      else {
        const rand = Math.floor(10 + Math.random() * 90);
        suggestion = `${cleanSlug}-${rand}`;
      }

      return {
        available: false,
        cleanSlug,
        suggestion,
        reason: `"/products/${cleanSlug}" is already taken`,
      };
    }

    return {
      available: true,
      cleanSlug,
      suggestion: null,
      reason: null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    logoId: v.optional(v.id("_storage")),
    galleryIds: v.optional(v.array(v.id("_storage"))),
    videoUrl: v.optional(v.string()),
    pricing: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid")
    ),
    categories: v.array(v.string()),
    topics: v.optional(v.array(v.string())),
    makerIds: v.optional(v.array(v.id("users"))),
    makers: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          role: v.optional(v.string()),
        })
      )
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("launched")
    ),
    launchDate: v.string(),
    promoCode: v.optional(v.string()),
    promoDiscount: v.optional(v.string()),
    isPromoted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const cleanSlug = args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug) {
      throw new Error("Invalid product slug");
    }

    const existingSlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
      .first();

    if (existingSlug) {
      throw new Error("A product with this URL slug already exists. Please choose a different slug.");
    }

    // Build unique maker list with roles
    const makerEntries: Array<{ userId: Id<"users">; role?: string }> = [];

    if (args.makers && args.makers.length > 0) {
      for (const m of args.makers) {
        if (!makerEntries.some((e) => e.userId === m.userId)) {
          makerEntries.push({ userId: m.userId, role: m.role });
        }
      }
    } else if (args.makerIds && args.makerIds.length > 0) {
      for (const id of args.makerIds) {
        if (!makerEntries.some((e) => e.userId === id)) {
          makerEntries.push({ userId: id, role: id === user._id ? "Founder" : "Maker" });
        }
      }
    }

    if (!makerEntries.some((e) => e.userId === user._id)) {
      makerEntries.unshift({ userId: user._id, role: "Founder" });
    }

    const finalMakerIds = makerEntries.map((e) => e.userId);
    const shouldPromote = Boolean(args.isPromoted && (user.isPro || user.plan === "pro"));

    const productId = await ctx.db.insert("products", {
      name: args.name.trim(),
      slug: cleanSlug,
      tagline: args.tagline.trim(),
      description: args.description.trim(),
      websiteUrl: args.websiteUrl.trim(),
      logoId: args.logoId,
      galleryIds: args.galleryIds,
      videoUrl: args.videoUrl?.trim() || undefined,
      pricing: args.pricing,
      categories: args.categories,
      topics: args.topics,
      submitterId: user._id,
      makerIds: finalMakerIds,
      status: args.status,
      launchDate: args.launchDate,
      upvoteCount: 0,
      commentCount: 0,
      isFeatured: false,
      isPromoted: shouldPromote,
      promotedAt: shouldPromote ? Date.now() : undefined,
      promoBadgeText: shouldPromote ? "PRO SPONSORED" : undefined,
      promoCode: args.promoCode?.trim() || undefined,
      promoDiscount: args.promoDiscount?.trim() || undefined,
      createdAt: Date.now(),
    });

    for (const entry of makerEntries) {
      await ctx.db.insert("productMakers", {
        productId,
        userId: entry.userId,
        role: entry.role?.trim() || (entry.userId === user._id ? "Founder" : "Maker"),
        createdAt: Date.now(),
      });
    }

    if (args.logoId) {
      await ctx.db.insert("productImages", {
        productId,
        storageId: args.logoId,
        isPrimary: true,
        order: 0,
      });
    }
    if (args.galleryIds) {
      for (let i = 0; i < args.galleryIds.length; i++) {
        await ctx.db.insert("productImages", {
          productId,
          storageId: args.galleryIds[i],
          isPrimary: false,
          order: i + 1,
        });
      }
    }

    return productId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to upload files");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const listBySubmitter = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_submitter", (q) => q.eq("submitterId", user._id))
      .collect();

    products.sort((a, b) => b.createdAt - a.createdAt);

    return await Promise.all(
      products.map(async (product) => {
        let logoUrl = null;
        if (product.logoId) {
          logoUrl = await ctx.storage.getUrl(product.logoId);
        }
        return {
          ...product,
          logoUrl,
        };
      })
    );
  },
});

export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),
    galleryIds: v.optional(v.array(v.id("_storage"))),
    videoUrl: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
    categories: v.optional(v.array(v.string())),
    topics: v.optional(v.array(v.string())),
    makerIds: v.optional(v.array(v.id("users"))),
    makers: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          role: v.optional(v.string()),
        })
      )
    ),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("scheduled"), v.literal("launched"))
    ),
    launchDate: v.optional(v.string()),
    promoCode: v.optional(v.string()),
    promoDiscount: v.optional(v.string()),
    isPromoted: v.optional(v.boolean()),
    promotedAt: v.optional(v.number()),
    promoBadgeText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Only submitter or makers can update
    const isSubmitter = product.submitterId === user._id;
    const isMaker = (product.makerIds ?? []).includes(user._id);
    if (!isSubmitter && !isMaker) {
      throw new Error("You do not have permission to edit this product");
    }

    // If changing slug, check uniqueness
    if (args.slug && args.slug !== product.slug) {
      const cleanSlug = args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const existingSlug = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", cleanSlug))
        .first();
      if (existingSlug && existingSlug._id !== product._id) {
        throw new Error("Slug is already taken by another product");
      }
      args.slug = cleanSlug;
    }

    const { productId, makers, ...patchFields } = args;

    if (patchFields.isPromoted !== undefined) {
      if (patchFields.isPromoted && !user.isPro && user.plan !== "pro") {
        throw new Error("Promoting a launch requires an active Pro Superuser plan ($99/mo). Please upgrade on the pricing page.");
      }
      patchFields.promotedAt = patchFields.isPromoted ? Date.now() : undefined;
      patchFields.promoBadgeText = patchFields.isPromoted ? "PRO SPONSORED" : undefined;
    }

    if (makers !== undefined) {
      const existingMakers = await ctx.db
        .query("productMakers")
        .withIndex("by_product", (q) => q.eq("productId", product._id))
        .collect();
      for (const rec of existingMakers) {
        await ctx.db.delete(rec._id);
      }
      for (const m of makers) {
        await ctx.db.insert("productMakers", {
          productId: product._id,
          userId: m.userId,
          role: m.role?.trim() || (m.userId === product.submitterId ? "Founder" : "Maker"),
          createdAt: Date.now(),
        });
      }
      patchFields.makerIds = makers.map((m) => m.userId);
    }

    await ctx.db.patch(productId, patchFields);
    return productId;
  },
});

export const togglePromoteProduct = mutation({
  args: {
    productId: v.id("products"),
    isPromoted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const isSubmitter = product.submitterId === user._id;
    const isMaker = (product.makerIds ?? []).includes(user._id);
    if (!isSubmitter && !isMaker) {
      throw new Error("You do not have permission to promote this product");
    }

    if (args.isPromoted && !user.isPro && user.plan !== "pro") {
      throw new Error("Promoting a product requires an active Pro Superuser plan ($99/mo). Please upgrade on the pricing page.");
    }

    await ctx.db.patch(product._id, {
      isPromoted: args.isPromoted,
      promotedAt: args.isPromoted ? Date.now() : undefined,
      promoBadgeText: args.isPromoted ? "PRO SPONSORED" : undefined,
    });

    return { success: true, isPromoted: args.isPromoted };
  },
});

export const publishNow = mutation({
  args: {
    productId: v.id("products"),
    launchDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const isSubmitter = product.submitterId === user._id;
    const isMaker = (product.makerIds ?? []).includes(user._id);
    if (!isSubmitter && !isMaker) {
      throw new Error("You do not have permission to launch this product");
    }

    const todayStr = args.launchDate || "2026-08-28";
    await ctx.db.patch(product._id, {
      status: "launched",
      launchDate: todayStr,
    });

    // Notify all launch subscribers
    const subscribers = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();

    for (const sub of subscribers) {
      await ctx.db.insert("notifications", {
        recipientId: sub.userId,
        type: "launch_live",
        title: "Product is now LIVE! 🚀",
        body: `"${product.name}" has officially launched on Launchpad! Check it out and join the discussion.`,
        linkUrl: `/products/${product.slug}`,
        relatedProductId: product._id,
        actorId: user._id,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return product._id;
  },
});

export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.submitterId !== user._id) {
      throw new Error("Only the original submitter can delete this product");
    }

    // 1. Delete associated upvotes
    const upvotes = await ctx.db
      .query("productUpvotes")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const u of upvotes) {
      await ctx.db.delete(u._id);
    }

    // 2. Delete associated comments and comment upvotes
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const c of comments) {
      const cUpvotes = await ctx.db
        .query("commentUpvotes")
        .withIndex("by_comment", (q) => q.eq("commentId", c._id))
        .collect();
      for (const cu of cUpvotes) {
        await ctx.db.delete(cu._id);
      }
      await ctx.db.delete(c._id);
    }

    // 3. Delete productMakers
    const makers = await ctx.db
      .query("productMakers")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const m of makers) {
      await ctx.db.delete(m._id);
    }

    // 4. Delete productImages
    const images = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const img of images) {
      await ctx.db.delete(img._id);
    }

    // 5. Delete awards
    const awards = await ctx.db
      .query("awards")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const a of awards) {
      await ctx.db.delete(a._id);
    }

    // 6. Delete bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const b of bookmarks) {
      await ctx.db.delete(b._id);
    }

    // 7. Delete launch subscriptions
    const subs = await ctx.db
      .query("launchSubscriptions")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    for (const s of subs) {
      await ctx.db.delete(s._id);
    }

    // 8. Delete product
    await ctx.db.delete(product._id);

    return { success: true };
  },
});