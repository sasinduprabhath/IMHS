import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentEmail,
      studentPhone,
      sessionType,
      durationMins,
      bookingDate,
      timeSlot,
      topicNotes,
    } = body;

    if (!studentName || !studentEmail || !studentPhone || !sessionType || !bookingDate || !timeSlot) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(bookingDate);

    // Double Booking Check: Check if slot is already taken for this date
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSlot = await (prisma as any).consultationBooking.findFirst({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timeSlot: timeSlot,
        status: {
          not: "CANCELLED",
        },
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: `The ${timeSlot} slot on ${parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} is already booked. Please choose another date or time slot.` },
        { status: 400 }
      );
    }

    // Generate unique booking code e.g. IMHS-BOOK-8921
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `IMHS-BOOK-${randomDigits}`;

    const booking = await (prisma as any).consultationBooking.create({
      data: {
        bookingCode,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone.trim(),
        sessionType,
        durationMins: Number(durationMins) || 30,
        bookingDate: parsedDate,
        timeSlot,
        topicNotes: topicNotes ? topicNotes.trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking submitted successfully!",
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          studentName: booking.studentName,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          sessionType: booking.sessionType,
          status: booking.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating consultation booking:", error);
    return NextResponse.json(
      { error: "Failed to create consultation booking. Please try again." },
      { status: 500 }
    );
  }
}
