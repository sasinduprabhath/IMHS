import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.facultyMemberId) {
      return NextResponse.json({ error: "Faculty member ID is required" }, { status: 400 });
    }

    const instructor = await prisma.courseInstructor.upsert({
      where: {
        courseId_facultyMemberId: {
          courseId: id,
          facultyMemberId: body.facultyMemberId,
        },
      },
      create: {
        courseId: id,
        facultyMemberId: body.facultyMemberId,
      },
      update: {},
      include: {
        facultyMember: true,
      },
    });

    return NextResponse.json({ success: true, instructor });
  } catch (error) {
    console.error("Error assigning instructor:", error);
    return NextResponse.json({ error: "Failed to assign instructor" }, { status: 500 });
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const facultyMemberId = searchParams.get("facultyMemberId");

    if (!facultyMemberId) {
      return NextResponse.json({ error: "Faculty member ID is required" }, { status: 400 });
    }

    await prisma.courseInstructor.delete({
      where: {
        courseId_facultyMemberId: {
          courseId: id,
          facultyMemberId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing instructor:", error);
    return NextResponse.json({ error: "Failed to remove instructor" }, { status: 500 });
  }
}
