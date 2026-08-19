"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";

export async function getActivePharmacyRushConfig() {
  try {
    if (!prisma.pharmacyRushConfig) return null;
    const config = await prisma.pharmacyRushConfig.findFirst({
      where: { isActive: true },
      include: {
        rounds: {
          orderBy: { roundNumber: "asc" },
        },
      },
    });
    return config;
  } catch (error) {
    console.error("Error fetching active pharmacy rush config:", error);
    return null;
  }
}

export async function getAllPharmacyRushConfigs() {
  try {
    if (!prisma.pharmacyRushConfig) return [];
    return (await prisma.pharmacyRushConfig.findMany({
      include: { rounds: true },
      orderBy: { createdAt: "desc" },
    })) ?? [];
  } catch (error) {
    console.error("Error fetching pharmacy rush configs:", error);
    return [];
  }
}

export async function createPharmacyRushConfig(data: {
  medicineName: string;
  timePerRoundSec?: number;
  isActive?: boolean;
  rounds: {
    roundNumber: number;
    challengeType: string;
    questionText: string;
    options: string[];
    correctOption: string;
    pointsValue?: number;
  }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    const cleanMedicineName = sanitizeString(data.medicineName, 150);

    if (data.isActive) {
      // Deactivate all others first
      await prisma.pharmacyRushConfig.updateMany({
        data: { isActive: false },
      });
    }

    const created = await prisma.pharmacyRushConfig.create({
      data: {
        medicineName: cleanMedicineName,
        timePerRoundSec: Math.min(120, Math.max(5, Number(data.timePerRoundSec) || 15)),
        isActive: data.isActive ?? true,
        rounds: {
          create: (data.rounds || []).map((r) => ({
            roundNumber: Number(r.roundNumber) || 1,
            challengeType: sanitizeString(r.challengeType, 50),
            questionText: sanitizeString(r.questionText, 500),
            options: (r.options || []).map((o) => sanitizeString(o, 200)),
            correctOption: sanitizeString(r.correctOption, 200),
            pointsValue: Math.min(100, Math.max(1, Number(r.pointsValue) || 10)),
          })),
        },
      },
      include: { rounds: true },
    });

    revalidatePath("/admin/learning-hub/pharmacy-rush");
    revalidatePath("/dashboard/learning-hub/pharmacy-rush");
    return { success: true, config: created };
  } catch (error: any) {
    console.error("Error creating pharmacy rush config:", error);
    return { success: false, error: error.message || "Failed to create arcade config" };
  }
}

export async function setActivePharmacyRushConfig(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required." };
    }

    const cleanId = sanitizeIdentifier(id, 100);

    await prisma.pharmacyRushConfig.updateMany({
      data: { isActive: false },
    });
    const updated = await prisma.pharmacyRushConfig.update({
      where: { id: cleanId },
      data: { isActive: true },
    });
    revalidatePath("/admin/learning-hub/pharmacy-rush");
    revalidatePath("/dashboard/learning-hub/pharmacy-rush");
    return { success: true, config: updated };
  } catch (error: any) {
    console.error("Error setting active rush config:", error);
    return { success: false, error: error.message || "Failed to activate config" };
  }
}

export async function submitPharmacyRushScore(data: {
  medicineName: string;
  score: number;
  timeTakenSec: number;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Active session required." };
    }

    const studentId = session.user.id;
    const cleanMedicineName = sanitizeString(data.medicineName, 150);
    const score = Math.min(10000, Math.max(0, Number(data.score) || 0));
    const timeTakenSec = Math.min(86400, Math.max(0, Number(data.timeTakenSec) || 0));

    const log = await prisma.pharmacyRushLeaderboard.create({
      data: {
        studentId,
        medicineName: cleanMedicineName,
        score,
        timeTakenSec,
      },
    });

    // Also write to StudentActivityLog
    await prisma.studentActivityLog.create({
      data: {
        studentId,
        activityType: "PHARMACY_RUSH",
        referenceId: cleanMedicineName,
        score,
        maxScore: 100,
      },
    });

    revalidatePath("/dashboard/learning-hub/pharmacy-rush");
    revalidatePath("/admin/learning-hub/analytics");
    return { success: true, entry: log };
  } catch (error: any) {
    console.error("Error submitting pharmacy rush score:", error);
    return { success: false, error: error.message || "Failed to submit score" };
  }
}

export async function getPharmacyRushLeaderboard(medicineName?: string) {
  try {
    if (!prisma.pharmacyRushLeaderboard) return [];
    return (await prisma.pharmacyRushLeaderboard.findMany({
      where: medicineName ? { medicineName } : undefined,
      include: {
        student: {
          select: { name: true, email: true, studentId: true },
        },
      },
      orderBy: [{ score: "desc" }, { timeTakenSec: "asc" }],
      take: 20,
    })) ?? [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function getStudentAnalyticsLogs() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return [];
    }

    if (!prisma.studentActivityLog) return [];
    return (await prisma.studentActivityLog.findMany({
      include: {
        student: {
          select: { name: true, email: true, studentId: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 200,
    })) ?? [];
  } catch (error) {
    console.error("Error fetching student analytics logs:", error);
    return [];
  }
}
