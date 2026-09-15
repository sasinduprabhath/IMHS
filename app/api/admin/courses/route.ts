import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  type: z.string().default("VIDEO"),
  vimeoVideoId: z.string().optional().nullable(),
  driveFileId: z.string().optional().nullable(),
});

const chapterSchema = z.object({
  title: z.string().min(1, "Chapter title is required"),
  lessons: z.array(lessonSchema).optional().default([]),
});

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  originalPrice: z.coerce.number().optional().nullable(),
  type: z.string().default("Course"),
  category: z.string().default("Modern Pharmacy"),
  level: z.string().default("All Levels"),
  enrollmentValidity: z.string().optional().default(""),
  totalEnrolled: z.coerce.number().default(450),
  published: z.boolean().default(false),
  coverImage: z.string().optional().nullable(),
  chapters: z.array(chapterSchema).optional().default([]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, courses });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const data = courseSchema.parse(body);

    const cleanSlug = data.slug.toLowerCase().trim();

    const existing = await prisma.course.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `A course with slug "${cleanSlug}" already exists. Please modify the title or slug.`,
        },
        { status: 400 }
      );
    }

    // Build nested chapters & lessons if provided
    const chaptersCreate = data.chapters && data.chapters.length > 0
      ? {
          create: data.chapters.map((ch, cIdx) => ({
            title: ch.title.trim(),
            order: cIdx + 1,
            lessons: {
              create: (ch.lessons || []).map((l, lIdx) => ({
                title: l.title.trim(),
                order: lIdx + 1,
                type: l.type || "VIDEO",
                vimeoVideoId: l.vimeoVideoId || null,
                driveFileId: l.driveFileId || null,
              })),
            },
          })),
        }
      : undefined;

    const newCourse = await prisma.course.create({
      data: {
        title: data.title.trim(),
        slug: cleanSlug,
        description: data.description.trim(),
        price: data.price,
        originalPrice: data.originalPrice || null,
        type: data.type || "Course",
        category: data.category || "Modern Pharmacy",
        level: data.level || "All Levels",
        enrollmentValidity: data.enrollmentValidity || "",
        totalEnrolled: data.totalEnrolled || 450,
        published: data.published,
        coverImage: data.coverImage || null,
        chapters: chaptersCreate,
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return NextResponse.json(
        { success: false, message: `Validation Error: ${fieldErrors}`, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create course." },
      { status: 500 }
    );
  }
}
