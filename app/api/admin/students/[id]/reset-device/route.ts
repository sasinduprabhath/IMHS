// app/api/admin/students/[id]/reset-device/route.ts
// Admin-only: clears a student's device signature so their next login registers a new device

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: {
      deviceSignature: null,
      deviceLockedAt:  null,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Device lock cleared for ${user.name}. Their next login will register their new device.`,
  });
}
