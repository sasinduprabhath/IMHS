import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Booking reference code is required." }, { status: 400 });
    }

    const booking = await (prisma as any).consultationBooking.findUnique({
      where: { bookingCode: code.trim().toUpperCase() },
      select: {
        bookingCode: true,
        studentName: true,
        sessionType: true,
        durationMins: true,
        bookingDate: true,
        timeSlot: true,
        status: true,
        meetingLink: true,
        createdAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "No booking found matching this code." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error("Error fetching booking status:", error);
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}
