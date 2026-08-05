import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { dueDate: "asc" },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
        chapter: {
          select: { id: true, title: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, chapterId, title, description, attachmentUrl, dueDate, maxMarks, allowLate, allowedFileTypes } = body;

    if (!courseId || !title || !description || !dueDate) {
      return NextResponse.json(
        { error: "Course, Title, Description, and Due Date are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        chapterId: chapterId || null,
        title,
        description,
        attachmentUrl: attachmentUrl || null,
        dueDate: new Date(dueDate),
        maxMarks: Number(maxMarks) || 100,
        allowLate: Boolean(allowLate),
        allowedFileTypes: allowedFileTypes || "PDF,DOCX,ZIP",
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
