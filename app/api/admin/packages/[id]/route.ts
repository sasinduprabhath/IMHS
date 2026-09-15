import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, getMentorshipPackageModel } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePackageSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  number: z.number().int().min(1).optional(),
  duration: z.string().min(2).max(50).optional(),
  durationMins: z.number().int().positive().max(480).optional(),
  priceLkr: z.number().int().nonnegative().optional(),
  category: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(2000).optional(),
  icon: z.string().optional(),
  colorTheme: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updatePackageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const model = getMentorshipPackageModel();

    if (model) {
      const updated = await model.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.number !== undefined && { number: data.number }),
          ...(data.duration !== undefined && { duration: data.duration }),
          ...(data.durationMins !== undefined && { durationMins: data.durationMins }),
          ...(data.priceLkr !== undefined && { priceLkr: data.priceLkr }),
          ...(data.category !== undefined && { category: data.category, tag: data.category }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.icon !== undefined && { icon: data.icon }),
          ...(data.colorTheme !== undefined && { colorTheme: data.colorTheme }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.order !== undefined && { order: data.order }),
        },
      });
      return NextResponse.json({ success: true, package: updated });
    }

    // Raw SQL update fallback
    await prisma.$executeRaw`
      UPDATE MentorshipPackage
      SET 
        title = COALESCE(${data.title ?? null}, title),
        number = COALESCE(${data.number ?? null}, number),
        duration = COALESCE(${data.duration ?? null}, duration),
        durationMins = COALESCE(${data.durationMins ?? null}, durationMins),
        priceLkr = COALESCE(${data.priceLkr ?? null}, priceLkr),
        category = COALESCE(${data.category ?? null}, category),
        tag = COALESCE(${data.category ?? null}, tag),
        description = COALESCE(${data.description ?? null}, description),
        icon = COALESCE(${data.icon ?? null}, icon),
        colorTheme = COALESCE(${data.colorTheme ?? null}, colorTheme),
        isActive = COALESCE(${data.isActive !== undefined ? (data.isActive ? 1 : 0) : null}, isActive),
        \`order\` = COALESCE(${data.order ?? null}, \`order\`),
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, package: { id, ...data } });
  } catch (error: any) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const model = getMentorshipPackageModel();

    if (model) {
      await model.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    await prisma.$executeRaw`
      DELETE FROM MentorshipPackage WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
