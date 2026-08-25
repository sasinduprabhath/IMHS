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

const updateSchema = z.object({
  youtubeUrlOrId: z.string().optional(),
  title: z.string().min(2).max(200).optional(),
  category: z.string().max(100).optional(),
  duration: z.string().max(50).optional().nullable(),
  views: z.string().max(50).optional().nullable(),
  thumbnailUrl: z.string().max(1000).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (parsed.data.youtubeUrlOrId) {
      data.youtubeId = extractYouTubeId(parsed.data.youtubeUrlOrId);
      if (!parsed.data.thumbnailUrl) {
        data.thumbnailUrl = `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`;
      }
    }
    if (parsed.data.title !== undefined) data.title = sanitizeString(parsed.data.title, 200);
    if (parsed.data.category !== undefined) data.category = sanitizeString(parsed.data.category, 100);
    if (parsed.data.duration !== undefined) data.duration = parsed.data.duration ? sanitizeString(parsed.data.duration, 50) : null;
    if (parsed.data.views !== undefined) data.views = parsed.data.views ? sanitizeString(parsed.data.views, 50) : null;
    if (parsed.data.thumbnailUrl !== undefined) data.thumbnailUrl = parsed.data.thumbnailUrl;
    if (parsed.data.description !== undefined) data.description = parsed.data.description ? sanitizeString(parsed.data.description, 2000) : null;
    if (parsed.data.order !== undefined) data.order = parsed.data.order;
    if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;

    const updated = await prisma.achievementHighlight.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("[achievements:put] Error:", error);
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.achievementHighlight.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[achievements:delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
}
