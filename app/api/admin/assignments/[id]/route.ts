import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, attachmentUrl, dueDate, maxMarks, allowLate, allowedFileTypes } = body;

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxMarks !== undefined && { maxMarks: Number(maxMarks) }),
        ...(allowLate !== undefined && { allowLate: Boolean(allowLate) }),
        ...(allowedFileTypes && { allowedFileTypes }),
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}
