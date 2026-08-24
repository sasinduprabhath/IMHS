import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const sendMessageSchema = z.object({
  studentId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty").max(4000, "Message is too long"),
  attachmentUrl: z.string().max(1000).optional().nullable(),
  attachmentName: z.string().max(255).optional().nullable(),
});

/**
 * GET /api/chat/messages?studentId=...
 * Fetch message thread.
 * - If called by Student: returns messages for their own thread with Admin desk.
 * - If called by Admin: returns messages for the specified studentId.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    const { searchParams } = new URL(req.url);

    let threadStudentId: string;

    if (currentUserRole === "ADMIN") {
      const queryStudentId = searchParams.get("studentId");
      if (!queryStudentId) {
        return NextResponse.json({ error: "Student ID required for admin chat lookup." }, { status: 400 });
      }
      threadStudentId = sanitizeIdentifier(queryStudentId, 100);
    } else {
      // Student is looking at their own thread
      threadStudentId = currentUserId;
    }

    // Fetch messages for this student thread
    const messages = await prisma.directMessage.findMany({
      where: { studentId: threadStudentId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentId: true,
          },
        },
      },
    });

    // Mark any unread messages sent by the other party as read
    const unreadFromOther = messages
      .filter((m) => !m.isRead && m.senderId !== currentUserId)
      .map((m) => m.id);

    if (unreadFromOther.length > 0) {
      await prisma.directMessage.updateMany({
        where: { id: { in: unreadFromOther } },
        data: { isRead: true },
      });
    }

    return NextResponse.json({
      messages,
      studentId: threadStudentId,
    });
  } catch (error: any) {
    console.error("[chat:get-messages] Error:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}

/**
 * POST /api/chat/messages
 * Send a message in a conversation thread.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid message format." },
        { status: 400 }
      );
    }

    const { content, attachmentUrl, attachmentName } = parsed.data;
    const cleanContent = sanitizeString(content, 4000);
    const cleanAttachmentUrl = attachmentUrl ? sanitizeString(attachmentUrl, 1000) : null;
    const cleanAttachmentName = attachmentName ? sanitizeString(attachmentName, 255) : null;

    let targetStudentId: string;
    let receiverId: string;

    if (currentUserRole === "ADMIN") {
      if (!parsed.data.studentId) {
        return NextResponse.json({ error: "Target student ID required for admin." }, { status: 400 });
      }
      targetStudentId = sanitizeIdentifier(parsed.data.studentId, 100);
      receiverId = targetStudentId;

      // Verify target student exists
      const studentUser = await prisma.user.findUnique({
        where: { id: targetStudentId },
        select: { id: true, role: true },
      });

      if (!studentUser) {
        return NextResponse.json({ error: "Target student not found." }, { status: 404 });
      }
    } else {
      // Student sending to Admin Desk
      targetStudentId = currentUserId;

      // Find an admin user to receive the message
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (!adminUser) {
        return NextResponse.json({ error: "Support admin desk is currently unavailable." }, { status: 500 });
      }

      receiverId = adminUser.id;
    }

    // Create the message
    const newMessage = await prisma.directMessage.create({
      data: {
        senderId: currentUserId,
        receiverId,
        studentId: targetStudentId,
        content: cleanContent,
        attachmentUrl: cleanAttachmentUrl,
        attachmentName: cleanAttachmentName,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error("[chat:send-message] Error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
