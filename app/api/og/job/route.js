// app/api/og/job/route.js
import { ImageResponse } from "next/og";

export const runtime = "nodejs"; // safe on Render
export const alt = "FanGigs — Job";
export const contentType = "image/png";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Job on FanGigs").slice(0, 90);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 120);

  // If you want to fetch by ID instead, you can:
  // const id = searchParams.get("id");
  // if (id) { /* fetch from Supabase and set title/subtitle */ }

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
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12 }}>
            {subtitle}
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
