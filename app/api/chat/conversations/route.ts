import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitization";

/**
 * GET /api/chat/conversations
 * Admin-only: Fetches student conversation threads.
 * Query parameters:
 * - filter: "recent" (default - only students with messages) | "all" (all registered students)
 * - unreadOnly: "true" | "false"
 * - search: string
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "recent"; // "recent" | "all"
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const search = sanitizeString(rawSearch, 100).toLowerCase();

    // 1. Fetch all distinct student IDs who have messages, ordered by most recent message
    const recentMessageRecords = await prisma.directMessage.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        studentId: true,
        createdAt: true,
      },
    });

    // Deduplicate studentIds while preserving recency order
    const orderedChatStudentIds: string[] = [];
    const seenIds = new Set<string>();
    for (const record of recentMessageRecords) {
      if (!seenIds.has(record.studentId)) {
        seenIds.add(record.studentId);
        orderedChatStudentIds.push(record.studentId);
      }
    }

    let targetStudentUsers: any[] = [];

    if (search) {
      // If admin is searching, search all students matching query
      targetStudentUsers = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { studentId: { contains: search } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          studentId: true,
          status: true,
          createdAt: true,
        },
        take: 50,
      });
    } else if (filter === "recent") {
      // ONLY fetch students who actually have conversations
      if (orderedChatStudentIds.length > 0) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: orderedChatStudentIds },
            role: "STUDENT",
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            studentId: true,
            status: true,
            createdAt: true,
          },
        });

        // Re-sort to match recency order
        const userMap = new Map(users.map((u) => [u.id, u]));
        targetStudentUsers = orderedChatStudentIds
          .map((id) => userMap.get(id))
          .filter(Boolean);
      }
    } else {
      // "all" filter: fetch students, placing those with active chats first, then recent signups
      const allUsers = await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          studentId: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      targetStudentUsers = allUsers;
    }

    // 2. Fetch the latest message and unread count for each target student
    const conversations = await Promise.all(
      targetStudentUsers.map(async (student) => {
        const [lastMessage, unreadCount] = await Promise.all([
          prisma.directMessage.findFirst({
            where: { studentId: student.id },
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: { name: true, role: true },
              },
            },
          }),
          prisma.directMessage.count({
            where: {
              studentId: student.id,
              sender: { role: "STUDENT" },
              isRead: false,
            },
          }),
        ]);

        return {
          student,
          lastMessage,
          unreadCount,
          hasMessages: !!lastMessage,
          lastActivityAt: lastMessage?.createdAt || student.createdAt,
        };
      })
    );

    // 3. Filter by unreadOnly if requested
    let filteredConversations = conversations;
    if (unreadOnly) {
      filteredConversations = conversations.filter((c) => c.unreadCount > 0);
    }

    // 4. Sort: unread first, then by lastActivityAt desc
    const sorted = filteredConversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    const totalActiveChatsCount = orderedChatStudentIds.length;
    const totalUnreadCount = await prisma.directMessage.count({
      where: {
        isRead: false,
        sender: { role: "STUDENT" },
      },
    });

    return NextResponse.json({
      conversations: sorted,
      totalActiveChatsCount,
      totalUnreadCount,
    });
  } catch (error: any) {
    console.error("[chat:get-conversations] Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations." }, { status: 500 });
  }
}
