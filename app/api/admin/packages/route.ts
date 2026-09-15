import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const packageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  number: z.number().int().min(1).default(1),
  duration: z.string().min(2, "Duration is required").max(50),
  durationMins: z.number().int().positive().max(480).default(30),
  priceLkr: z.number().int().nonnegative().default(3500),
  category: z.string().min(2, "Category is required").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
  icon: z.string().default("GraduationCap"),
  colorTheme: z.string().default("teal"),
  isActive: z.boolean().default(true),
  order: z.number().int().default(1),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packages = await (prisma as any).mentorshipPackage.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("Error fetching admin packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = packageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const packageKey =
      data.title
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .slice(0, 40) + "_" + Date.now().toString().slice(-4);

    const created = await (prisma as any).mentorshipPackage.create({
      data: {
        packageKey,
        number: data.number,
        title: data.title,
        duration: data.duration,
        durationMins: data.durationMins,
        priceLkr: data.priceLkr,
        category: data.category,
        tag: data.category,
        description: data.description,
        icon: data.icon,
        colorTheme: data.colorTheme,
        isActive: data.isActive,
        order: data.order,
      },
    });

    return NextResponse.json({ success: true, package: created });
  } catch (error: any) {
    console.error("Error creating mentorship package:", error);
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
  }
}
