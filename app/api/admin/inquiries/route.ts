import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleteResult = await prisma.contactInquiry.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `Deleted all ${deleteResult.count} inquiries.`,
      deletedCount: deleteResult.count,
    });
  } catch (error: any) {
    console.error("Error deleting inquiries:", error);
    return NextResponse.json({ error: "Failed to delete inquiries." }, { status: 500 });
  }
}
