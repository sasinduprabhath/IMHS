import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/chat/unread-count
 * Fast endpoint for polling sidebar and chat button badge counters.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;

    let unreadCount = 0;

    if (currentUserRole === "ADMIN") {
      // Total unread messages sent by students to admin
      unreadCount = await prisma.directMessage.count({
        where: {
          isRead: false,
          sender: {
            role: "STUDENT",
          },
        },
      });
    } else {
      // Total unread messages sent by admin to this student
      unreadCount = await prisma.directMessage.count({
        where: {
          studentId: currentUserId,
          receiverId: currentUserId,
          isRead: false,
        },
      });
    }

    return NextResponse.json({ unreadCount });
  } catch (error) {
    return NextResponse.json({ unreadCount: 0 });
  }
}
