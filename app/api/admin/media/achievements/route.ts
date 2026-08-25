import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitization";
import { z } from "zod";

function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : trimmed;
}

const achievementSchema = z.object({
  youtubeUrlOrId: z.string().min(1, "YouTube video link or ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  category: z.string().max(100).default("Convocation"),
  duration: z.string().max(50).optional().nullable(),
  views: z.string().max(50).optional().nullable(),
  thumbnailUrl: z.string().max(1000).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

/**
 * GET /api/admin/media/achievements
 * Returns all achievement highlights ordered by order ASC.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.achievementHighlight.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[achievements:get] Error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

/**
 * POST /api/admin/media/achievements
 * Creates a new achievement highlight video.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = achievementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { youtubeUrlOrId, title, category, duration, views, thumbnailUrl, description, order, isPublished } = parsed.data;
    const cleanYoutubeId = extractYouTubeId(youtubeUrlOrId);

    if (!cleanYoutubeId) {
      return NextResponse.json({ error: "Invalid YouTube URL or Video ID" }, { status: 400 });
    }

    const finalThumbnail = thumbnailUrl?.trim() || `https://img.youtube.com/vi/${cleanYoutubeId}/hqdefault.jpg`;

    const newItem = await prisma.achievementHighlight.create({
      data: {
        youtubeId: cleanYoutubeId,
        title: sanitizeString(title, 200),
        category: sanitizeString(category, 100),
        duration: duration ? sanitizeString(duration, 50) : null,
        views: views ? sanitizeString(views, 50) : null,
        thumbnailUrl: finalThumbnail,
        description: description ? sanitizeString(description, 2000) : null,
        order,
        isPublished,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("[achievements:post] Error:", error);
    return NextResponse.json({ error: "Failed to create achievement highlight" }, { status: 500 });
  }
}
