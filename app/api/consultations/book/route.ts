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

    // Generate unique booking code e.g. IMHS-BOOK-8921
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `IMHS-BOOK-${randomDigits}`;

    const parsedDate = new Date(bookingDate);

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
