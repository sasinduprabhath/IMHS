import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: {
        resolved: body.resolved,
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
