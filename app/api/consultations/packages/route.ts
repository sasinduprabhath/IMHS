import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packages = await (prisma as any).mentorshipPackage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("Error fetching consultation packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation packages", packages: [] },
      { status: 500 }
    );
  }
}
