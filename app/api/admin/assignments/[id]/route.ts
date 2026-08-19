import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString, sanitizeUrl, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const updateAssignmentSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title too long").optional(),
  description: z.string().min(1, "Description cannot be empty").max(5000, "Description too long").optional(),
  attachmentUrl: z.string().max(500).optional().nullable(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Valid due date required" }).optional(),
  maxMarks: z.number().int().min(1).max(1000).optional(),
  allowLate: z.boolean().optional(),
  allowedFileTypes: z.string().max(100).optional(),
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);
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
    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const body = await req.json();
    const parsed = updateAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid update data." }, { status: 400 });
    }

    const data = parsed.data;

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(data.title && { title: sanitizeString(data.title, 200) }),
        ...(data.description && { description: sanitizeString(data.description, 5000) }),
        ...(data.attachmentUrl !== undefined && { attachmentUrl: data.attachmentUrl ? sanitizeUrl(data.attachmentUrl) : null }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.maxMarks !== undefined && { maxMarks: data.maxMarks }),
        ...(data.allowLate !== undefined && { allowLate: data.allowLate }),
        ...(data.allowedFileTypes && { allowedFileTypes: sanitizeString(data.allowedFileTypes, 100) }),
      },
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}
