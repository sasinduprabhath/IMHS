import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(5000, "Content too long"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const courseId = sanitizeIdentifier(rawId, 100);

    const body = await request.json();
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid announcement data." }, { status: 400 });
    }

    const { title, content } = parsed.data;

    const announcement = await prisma.courseAnnouncement.create({
      data: {
        courseId,
        title: sanitizeString(title, 200),
        content: sanitizeString(content, 5000),
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawAnnouncementId = searchParams.get("announcementId");

    if (!rawAnnouncementId) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    const announcementId = sanitizeIdentifier(rawAnnouncementId, 100);

    await prisma.courseAnnouncement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
