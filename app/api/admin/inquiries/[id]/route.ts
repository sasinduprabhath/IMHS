import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const updateInquirySchema = z.object({
  resolved: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const body = await request.json();
    const parsed = updateInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resolved boolean state." }, { status: 400 });
    }

    const updated = await prisma.contactInquiry.update({
      where: { id },
      data: {
        resolved: parsed.data.resolved,
      },
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
