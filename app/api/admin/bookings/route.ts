import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await (prisma as any).consultationBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Error fetching consultation bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    );
  }
}
