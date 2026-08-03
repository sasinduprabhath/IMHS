// app/api/admin/students/[id]/devices/route.ts
// Admin API to list, approve, or block registered/attempted student devices

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const devices = await prisma.studentDevice.findMany({
    where: { userId: id },
    orderBy: { lastAttemptAt: "desc" },
  });

  return NextResponse.json({ devices });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { deviceId, action } = body as { deviceId?: string; action?: "APPROVE" | "MAKE_PRIMARY" | "BLOCK" };

  if (!deviceId || !action) {
    return NextResponse.json({ error: "Missing deviceId or action" }, { status: 400 });
  }

  const device = await prisma.studentDevice.findUnique({ where: { id: deviceId } });
  if (!device || device.userId !== id) {
    return NextResponse.json({ error: "Device not found for this student" }, { status: 404 });
  }

  if (action === "MAKE_PRIMARY" || action === "APPROVE") {
    const newStatus = action === "MAKE_PRIMARY" ? "PRIMARY" : "ALLOWED";
    
    // If making primary, set user's primary deviceSignature
    if (action === "MAKE_PRIMARY") {
      // Set all other devices to ALLOWED if they were PRIMARY
      await prisma.studentDevice.updateMany({
        where: { userId: id, status: "PRIMARY" },
        data: { status: "ALLOWED" },
      });

      await prisma.user.update({
        where: { id },
        data: {
          deviceSignature: device.deviceSignature,
          deviceLockedAt: new Date(),
        },
      });
    }

    await prisma.studentDevice.update({
      where: { id: deviceId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Device successfully ${action === "MAKE_PRIMARY" ? "set as primary" : "approved"}. Student can now log in from this device.`,
    });
  }

  if (action === "BLOCK") {
    await prisma.studentDevice.update({
      where: { id: deviceId },
      data: { status: "BLOCKED" },
    });

    // If this was the user's primary deviceSignature, clear user.deviceSignature
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.deviceSignature === device.deviceSignature) {
      await prisma.user.update({
        where: { id },
        data: { deviceSignature: null, deviceLockedAt: null },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Device blocked successfully.",
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
