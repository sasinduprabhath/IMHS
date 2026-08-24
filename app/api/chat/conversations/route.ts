import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitization";

/**
 * GET /api/chat/conversations
 * Admin-only: Fetches all student conversation threads, ordered by latest message activity.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get("search") || "";
    const search = sanitizeString(rawSearch, 100).toLowerCase();

    // 1. Fetch all distinct students who have messages
    const threadStudentIds = await prisma.directMessage.findMany({
      select: { studentId: true },
      distinct: ["studentId"],
    });

    const studentIds = threadStudentIds.map((t) => t.studentId);

    // If there are students who haven't messaged yet, we can also include recent enrolled students
    const allStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { studentId: { contains: search } },
              ],
            }
          : {}),
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
      take: 100,
    });

    // 2. Fetch the latest message and unread count for each student
    const conversations = await Promise.all(
      allStudents.map(async (student) => {
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
              senderId: student.id,
              isRead: false,
            },
          }),
        ]);

        return {
          student,
          lastMessage,
          unreadCount,
          lastActivityAt: lastMessage?.createdAt || student.createdAt,
        };
      })
    );

    // 3. Sort conversations:
    // Threads with unread messages first, then by lastActivityAt desc
    const sorted = conversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    return NextResponse.json({
      conversations: sorted,
    });
  } catch (error: any) {
    console.error("[chat:get-conversations] Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations." }, { status: 500 });
  }
}
