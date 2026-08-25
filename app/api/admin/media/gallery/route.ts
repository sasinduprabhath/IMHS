import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitization";
import { z } from "zod";

const gallerySchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"]).default("PHOTO"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  category: z.string().max(100).default("Campus Life"),
  mediaUrl: z.string().min(1, "Media file or URL is required").max(1000),
  thumbnailUrl: z.string().max(1000).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  tag: z.string().max(100).optional().nullable(),
  date: z.string().max(50).optional().nullable(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

/**
 * GET /api/admin/media/gallery
 * Returns all gallery items ordered by order ASC.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.galleryItem.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("[gallery:get] Error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
  }
}

/**
 * POST /api/admin/media/gallery
 * Creates a new gallery photo or video.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid gallery data" },
        { status: 400 }
      );
    }

    const { type, title, category, mediaUrl, thumbnailUrl, description, tag, date, order, isPublished } = parsed.data;

    const newItem = await prisma.galleryItem.create({
      data: {
        type,
        title: sanitizeString(title, 200),
        category: sanitizeString(category, 100),
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || (type === "PHOTO" ? mediaUrl.trim() : null),
        description: description ? sanitizeString(description, 2000) : null,
        tag: tag ? sanitizeString(tag, 100) : null,
        date: date ? sanitizeString(date, 50) : null,
        order,
        isPublished,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("[gallery:post] Error:", error);
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
