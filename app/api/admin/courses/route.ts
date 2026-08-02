import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const courseSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(5, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  originalPrice: z.number().optional().nullable(),
  type: z.string().default("Course"),
  category: z.string().default("Modern Pharmacy"),
  level: z.string().default("All Levels"),
  enrollmentValidity: z.string().default("Lifetime Access"),
  totalEnrolled: z.number().default(450),
  published: z.boolean().default(false),
  coverImage: z.string().optional().or(z.literal("")),
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
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = courseSchema.parse(body);

    const existing = await prisma.course.findUnique({
      where: { slug: data.slug.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A course with this slug already exists." },
        { status: 400 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title: data.title.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description.trim(),
        price: data.price,
        originalPrice: data.originalPrice || null,
        type: data.type || "Course",
        category: data.category || "Modern Pharmacy",
        level: data.level || "All Levels",
        enrollmentValidity: data.enrollmentValidity || "Lifetime Access",
        totalEnrolled: data.totalEnrolled || 450,
        published: data.published,
        coverImage: data.coverImage || null,
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
