import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserJSON {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
}

interface ClerkWebhookEvent {
  data: ClerkUserJSON;
  object: string;
  type: string;
}

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CLERK_WEBHOOK_SECRET is not set in Convex environment. Webhook cannot be verified.");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Error verifying Clerk webhook signature:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const user = evt.data;
      const firstName = user.first_name ?? "";
      const lastName = user.last_name ?? "";
      const name = `${firstName} ${lastName}`.trim() || user.username || "Anonymous Maker";

      let primaryEmail = "";
      if (user.email_addresses && user.email_addresses.length > 0) {
        if (user.primary_email_address_id) {
          const primary = user.email_addresses.find(
            (e) => e.id === user.primary_email_address_id
          );
          primaryEmail = primary ? primary.email_address : user.email_addresses[0].email_address;
        } else {
          primaryEmail = user.email_addresses[0].email_address;
        }
      }

      const rawUsername = user.username || name.split(" ")[0] || "user";

      await ctx.runMutation(internal.users.upsertFromClerk, {
        clerkId: user.id,
        name,
        username: rawUsername,
        email: primaryEmail,
        avatarUrl: user.image_url || undefined,
      });
    } else if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: id,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
