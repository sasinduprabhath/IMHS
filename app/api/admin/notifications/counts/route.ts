import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unresolved Inquiries count
    const unresolvedInquiriesCount = await prisma.contactInquiry.count({
      where: { resolved: false },
    });

    // Pending Consultation Bookings count
    const pendingBookingsCount = await (prisma as any).consultationBooking.count({
      where: { status: "PENDING" },
    });

    // Pending / Ungraded Assignment Submissions count
    const pendingAssignmentsCount = await prisma.assignmentSubmission.count({
      where: {
        status: { in: ["SUBMITTED", "LATE"] },
      },
    });

    return NextResponse.json({
      unresolvedInquiriesCount,
      pendingBookingsCount,
      pendingAssignmentsCount,
    });
  } catch (error: any) {
    console.error("Error fetching notification counts:", error);
    return NextResponse.json(
      { unresolvedInquiriesCount: 0, pendingBookingsCount: 0, pendingAssignmentsCount: 0 },
      { status: 500 }
    );
  }
}
