import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptField } from "@/lib/encryption";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await (prisma as any).consultationBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    const decryptedBookings = bookings.map((b: any) => ({
      ...b,
      topicNotes: decryptField(b.topicNotes),
      adminNotes: decryptField(b.adminNotes),
      meetingLink: decryptField(b.meetingLink),
    }));

    return NextResponse.json({ bookings: decryptedBookings });
  } catch (error: any) {
    console.error("Error fetching consultation bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}
