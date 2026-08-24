import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

function extractDriveId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  const fileDMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  if (!trimmed.startsWith("http") && !trimmed.startsWith("/") && /^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url") || searchParams.get("id");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const driveId = extractDriveId(targetUrl);

  if (driveId) {
    // Generate candidate IDs in case of character ambiguity (e.g. l vs I)
    const candidateIds = [driveId];
    if (driveId.includes("l")) {
      candidateIds.push(driveId.replace(/l/g, "I"));
      candidateIds.push(driveId.replace(/l/g, "1"));
    }
    if (driveId.includes("I")) {
      candidateIds.push(driveId.replace(/I/g, "l"));
      candidateIds.push(driveId.replace(/I/g, "1"));
    }

    for (const id of candidateIds) {
      const endpoints = [
        `https://lh3.googleusercontent.com/d/${id}=w1200`,
        `https://lh3.googleusercontent.com/d/${id}`,
        `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
        `https://drive.google.com/uc?export=view&id=${id}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (res.ok) {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.startsWith("image/")) {
              const buffer = await res.arrayBuffer();
              return new NextResponse(buffer, {
                status: 200,
                headers: {
                  "Content-Type": contentType,
                  "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
                },
              });
            }
          }
        } catch {
          // try next endpoint
        }
      }

      // If public endpoints failed, try Google Drive API with OAuth/Service Account if available
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      if (clientId && clientSecret && refreshToken) {
        try {
          const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
          oauth2Client.setCredentials({ refresh_token: refreshToken });
          const drive = google.drive({ version: "v3", auth: oauth2Client });

          const driveRes = await drive.files.get(
            { fileId: id, alt: "media" },
            { responseType: "arraybuffer" }
          );

          if (driveRes.data) {
            return new NextResponse(Buffer.from(driveRes.data as ArrayBuffer), {
              status: 200,
              headers: {
                "Content-Type": (driveRes.headers["content-type"] as string) || "image/jpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
              },
            });
          }
        } catch {
          // fall through
        }
      }
    }

    return new NextResponse("Google Drive image not accessible. Ensure sharing is set to 'Anyone with the link'.", { status: 404 });
  }

  // Direct external image URL
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  } catch (err: any) {
    return new NextResponse(err.message || "Failed to fetch image", { status: 500 });
  }

  return new NextResponse("Image not found", { status: 404 });
}
