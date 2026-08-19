import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeUrl, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const createAssignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required").max(100),
  chapterId: z.string().max(100).optional().nullable(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().min(1, "Description is required").max(5000, "Description too long"),
  attachmentUrl: z.string().max(500).optional().nullable(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Valid due date required" }),
  maxMarks: z.number().int().min(1).max(1000).optional().default(100),
  allowLate: z.boolean().optional().default(true),
  allowedFileTypes: z.string().max(100).optional().default("PDF,DOCX,ZIP"),
});

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
    const parsed = createAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid assignment data." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanTitle = sanitizeString(data.title, 200);
    const cleanDescription = sanitizeString(data.description, 5000);
    const cleanAttachmentUrl = data.attachmentUrl ? sanitizeUrl(data.attachmentUrl) : null;
    const cleanCourseId = sanitizeIdentifier(data.courseId, 100);
    const cleanChapterId = data.chapterId ? sanitizeIdentifier(data.chapterId, 100) : null;
    const parsedDueDate = new Date(data.dueDate);

    const assignment = await prisma.assignment.create({
      data: {
        courseId: cleanCourseId,
        chapterId: cleanChapterId,
        title: cleanTitle,
        description: cleanDescription,
        attachmentUrl: cleanAttachmentUrl,
        dueDate: parsedDueDate,
        maxMarks: data.maxMarks,
        allowLate: data.allowLate,
        allowedFileTypes: sanitizeString(data.allowedFileTypes, 100),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    // Auto-create an official batch announcement for the newly published assignment
    try {
      const formattedDate = parsedDueDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await prisma.courseAnnouncement.create({
        data: {
          courseId: cleanCourseId,
          title: `📢 New Coursework Brief: ${cleanTitle}`,
          content: `A new assignment "${cleanTitle}" has been published for your course.\n\n📅 Deadline: ${formattedDate}\n💯 Maximum Marks: ${data.maxMarks} Points\n\nPlease open the "Assignments & Worksheets Hub" in your portal to view full instructions and submit your file.`,
        },
      });
    } catch (announcementErr) {
      console.error("Error auto-creating assignment announcement:", announcementErr);
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}
