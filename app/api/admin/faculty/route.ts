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

    const faculty = await prisma.facultyMember.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ faculty });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}
