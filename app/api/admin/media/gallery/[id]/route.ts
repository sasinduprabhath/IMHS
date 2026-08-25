import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitization";
import { z } from "zod";

const updateSchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"]).optional(),
  title: z.string().min(2).max(200).optional(),
  category: z.string().max(100).optional(),
  mediaUrl: z.string().max(1000).optional(),
  thumbnailUrl: z.string().max(1000).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  tag: z.string().max(100).optional().nullable(),
  date: z.string().max(50).optional().nullable(),
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
    if (parsed.data.type !== undefined) data.type = parsed.data.type;
    if (parsed.data.title !== undefined) data.title = sanitizeString(parsed.data.title, 200);
    if (parsed.data.category !== undefined) data.category = sanitizeString(parsed.data.category, 100);
    if (parsed.data.mediaUrl !== undefined) data.mediaUrl = parsed.data.mediaUrl.trim();
    if (parsed.data.thumbnailUrl !== undefined) data.thumbnailUrl = parsed.data.thumbnailUrl;
    if (parsed.data.description !== undefined) data.description = parsed.data.description ? sanitizeString(parsed.data.description, 2000) : null;
    if (parsed.data.tag !== undefined) data.tag = parsed.data.tag ? sanitizeString(parsed.data.tag, 100) : null;
    if (parsed.data.date !== undefined) data.date = parsed.data.date ? sanitizeString(parsed.data.date, 50) : null;
    if (parsed.data.order !== undefined) data.order = parsed.data.order;
    if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;

    const updated = await prisma.galleryItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("[gallery:put] Error:", error);
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
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
    await prisma.galleryItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[gallery:delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
