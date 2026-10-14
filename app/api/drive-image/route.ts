import { NextRequest, NextResponse } from "next/server";
import { sanitizeIdentifier } from "@/lib/sanitization";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");
    const rawUrl = searchParams.get("url");

    let driveId = rawId ? sanitizeIdentifier(rawId, 100) : "";

    if (!driveId && rawUrl) {
      const match = rawUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        driveId = sanitizeIdentifier(match[1], 100);
      }
    }

    if (!driveId) {
      return NextResponse.json({ error: "Drive file ID or URL required" }, { status: 400 });
    }

    // Try fetching from lh3.googleusercontent.com first
    const googleUrls = [
      `https://lh3.googleusercontent.com/d/${driveId}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`,
    ];

    for (const targetUrl of googleUrls) {
      try {
        const response = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type") || "image/png";
          const buffer = await response.arrayBuffer();

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (fetchErr) {
        console.warn(`Drive image proxy failed for ${targetUrl}:`, fetchErr);
      }
    }

    return NextResponse.json({ error: "Failed to fetch Drive image" }, { status: 502 });
  } catch (error) {
    console.error("Error in drive image proxy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
