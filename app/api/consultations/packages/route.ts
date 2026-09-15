import { NextResponse } from "next/server";
import { prisma, getMentorshipPackageModel } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const model = getMentorshipPackageModel();
    if (model) {
      const packages = await model.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      });
      return NextResponse.json({ packages });
    }

    // Direct fallback to raw SQL
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM MentorshipPackage WHERE isActive = 1 ORDER BY \`order\` ASC
    `;
    const packages = rows.map((r: any) => ({
      ...r,
      isActive: Boolean(r.isActive),
    }));

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("Error fetching consultation packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation packages", packages: [] },
      { status: 500 }
    );
  }
}
