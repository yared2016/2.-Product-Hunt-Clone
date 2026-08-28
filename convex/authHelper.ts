import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export async function getCurrentUserOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();
}

export async function getOrCreateCurrentUser(
  ctx: MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("You must be logged in to perform this action");
  }

  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (existingUser) {
    return existingUser;
  }

  const name =
    identity.name ||
    identity.nickname ||
    identity.givenName ||
    "Maker";
  const email = identity.email || "";
  const avatarUrl = identity.pictureUrl || undefined;

  let baseUsername = (
    identity.nickname ||
    identity.givenName ||
    name.split(" ")[0] ||
    "user"
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  let username = baseUsername || "user";
  let counter = 1;
  while (true) {
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!taken) break;
    username = `${baseUsername}${counter++}`;
  }

  const newUserId = await ctx.db.insert("users", {
    clerkId: identity.subject,
    name,
    username,
    email,
    avatarUrl,
    createdAt: Date.now(),
  });

  const newUser = await ctx.db.get(newUserId);
  if (!newUser) {
    throw new Error("Failed to initialize user record");
  }
  return newUser;
}
