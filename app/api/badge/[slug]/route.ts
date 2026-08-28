import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const theme = searchParams.get("theme") === "light" ? "light" : "dark";

  let productName = "Launchpad";
  let upvoteCount = 0;
  let rankText = "";

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl);
      const product = await client.query(api.products.getBySlug, { slug });
      if (product) {
        productName = product.name;
        upvoteCount = product.upvoteCount;
        if (product.dailyRank && product.dailyRank <= 5) {
          rankText = `#${product.dailyRank} Product of the Day`;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch product for badge:", err);
  }

  // Visual Theme Variables
  const isDark = theme === "dark";
  const bgColor = isDark ? "#121214" : "#FFFFFF";
  const borderColor = isDark ? "#27272A" : "#E4E4E7";
  const titleColor = isDark ? "#A1A1AA" : "#71717A";
  const brandColor = isDark ? "#FFFFFF" : "#09090B";
  const countBg = isDark ? "#27272A" : "#F4F4F5";
  const countText = isDark ? "#FFFFFF" : "#18181B";

  const subtitle = rankText || productName;

  // Generate crisp SVG
  const svg = `
<svg width="250" height="54" viewBox="0 0 250 54" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="249" height="53" rx="12" fill="${bgColor}" stroke="${borderColor}"/>
  
  <!-- Logo Icon Container -->
  <rect x="10" y="9.5" width="35" height="35" rx="8" fill="url(#brandGrad)"/>
  <g transform="translate(18, 17.5) scale(0.8)">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="white"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="white"/>
    <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 4-2 4-2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2-4 2-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Text Details -->
  <text fill="${titleColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="600" letter-spacing="0.08em" x="54" y="22">
    FEATURED ON
  </text>
  <text fill="${brandColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="-0.02em" x="54" y="38">
    ${subtitle.length > 17 ? subtitle.slice(0, 16) + "…" : subtitle}
  </text>

  <!-- Upvotes Counter Pill -->
  <rect x="180" y="11" width="58" height="32" rx="8" fill="${countBg}" stroke="${borderColor}"/>
  <path d="M193 28L197 23L201 28" stroke="#FF6154" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text fill="${countText}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle" x="216" y="31">
    ${upvoteCount}
  </text>

  <defs>
    <linearGradient id="brandGrad" x1="10" y1="9.5" x2="45" y2="44.5" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EA580C"/>
      <stop offset="0.5" stop-color="#FF6154"/>
      <stop offset="1" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
</svg>
`.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
