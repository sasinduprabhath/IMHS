import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, meetingLink, adminNotes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink ? meetingLink.trim() : null;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes ? adminNotes.trim() : null;

    const updatedBooking = await (prisma as any).consultationBooking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully!",
      booking: updatedBooking,
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
