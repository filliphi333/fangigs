// app/api/og/profile/route.js
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FanGigs — Profile";
export const contentType = "image/png";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle = (searchParams.get("handle") || "Creator Profile").slice(0, 60);
  const tagline = (searchParams.get("tagline") || "").slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800 }}>@{handle}</div>
        {tagline && (
          <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12 }}>
            {tagline}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            marginTop: 24,
          }}
        >
          <div style={{ fontWeight: 700 }}>FanGigs</div>
          <div style={{ opacity: 0.7 }}>fangigs.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
