import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptField, decryptField } from "@/lib/encryption";
import { sanitizeString, sanitizeUrl, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  meetingLink: z.string().max(500).optional().nullable(),
  adminNotes: z.string().max(2000).optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: rawId } = await params;
    const id = sanitizeIdentifier(rawId, 100);

    const body = await req.json();
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking update data." }, { status: 400 });
    }

    const { status, meetingLink, adminNotes } = parsed.data;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (meetingLink !== undefined) {
      const cleanUrl = meetingLink ? sanitizeUrl(meetingLink) : null;
      updateData.meetingLink = cleanUrl ? encryptField(cleanUrl) : null;
    }
    if (adminNotes !== undefined) {
      const cleanNotes = adminNotes ? sanitizeString(adminNotes, 2000) : null;
      updateData.adminNotes = cleanNotes ? encryptField(cleanNotes) : null;
    }

    const updatedBooking = await (prisma as any).consultationBooking.update({
      where: { id },
      data: updateData,
    });

    const decryptedBooking = {
      ...updatedBooking,
      topicNotes: decryptField(updatedBooking.topicNotes),
      adminNotes: decryptField(updatedBooking.adminNotes),
      meetingLink: decryptField(updatedBooking.meetingLink),
    };

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully!",
      booking: decryptedBooking,
    });
  } catch (error: any) {
    console.error("Error updating consultation booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await (prisma as any).consultationBooking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully!",
    });
  } catch (error: any) {
    console.error("Error deleting consultation booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking." },
      { status: 500 }
    );
  }
}
