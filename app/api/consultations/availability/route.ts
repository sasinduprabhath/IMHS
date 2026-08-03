import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter is required." }, { status: 400 });
    }

    const selectedDate = new Date(dateStr);
    // Find all bookings for this date that are not CANCELLED
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await (prisma as any).consultationBooking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = existingBookings.map((b: any) => b.timeSlot);

    return NextResponse.json({
      date: dateStr,
      bookedSlots,
    });
  } catch (error: any) {
    console.error("Error fetching slot availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability." }, { status: 500 });
  }
}
