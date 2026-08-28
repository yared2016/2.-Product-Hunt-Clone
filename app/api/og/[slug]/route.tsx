import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

interface RouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name") || slug.replace(/-/g, " ");
    const tagline = searchParams.get("tagline") || "Discover & share next-gen products";
    const upvotes = searchParams.get("upvotes") || "0";
    const pricing = searchParams.get("pricing") || "freemium";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0d0f12",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #1a1d24 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1d24 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "60px 70px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Brand Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #FF6154 0%, #FF884D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              🚀
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#FFFFFF",
                letterSpacing: "-0.5px",
              }}
            >
              Launchpad
            </span>
            <div
              style={{
                background: "rgba(255, 97, 84, 0.15)",
                border: "1px solid rgba(255, 97, 84, 0.3)",
                color: "#FF6154",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                marginLeft: "8px",
              }}
            >
              Featured Launch
            </div>
          </div>

          {/* Product Center Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "950px",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                textTransform: "capitalize",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: "26px",
                color: "#94a3b8",
                lineHeight: 1.4,
                fontWeight: "400",
              }}
            >
              {tagline}
            </div>
          </div>

          {/* Footer Metrics */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(255, 97, 84, 0.15)",
                  border: "1px solid rgba(255, 97, 84, 0.4)",
                  padding: "10px 22px",
                  borderRadius: "14px",
                  color: "#FF6154",
                  fontSize: "22px",
                  fontWeight: "bold",
                }}
              >
                <span>▲</span>
                <span>{upvotes} Upvotes</span>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "10px 20px",
                  borderRadius: "14px",
                  color: "#e2e8f0",
                  fontSize: "18px",
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {pricing}
              </div>
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              launchpad.dev/products/{slug}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    console.error("Failed to generate OG image:", err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
