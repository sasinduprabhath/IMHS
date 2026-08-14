"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    if (data.isActive) {
      // Deactivate all others first
      await prisma.pharmacyRushConfig.updateMany({
        data: { isActive: false },
      });
    }

    const created = await prisma.pharmacyRushConfig.create({
      data: {
        medicineName: data.medicineName,
        timePerRoundSec: data.timePerRoundSec ?? 15,
        isActive: data.isActive ?? true,
        rounds: {
          create: data.rounds.map((r) => ({
            roundNumber: r.roundNumber,
            challengeType: r.challengeType,
            questionText: r.questionText,
            options: r.options,
            correctOption: r.correctOption,
            pointsValue: r.pointsValue ?? 10,
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
    await prisma.pharmacyRushConfig.updateMany({
      data: { isActive: false },
    });
    const updated = await prisma.pharmacyRushConfig.update({
      where: { id },
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
  studentId: string;
  medicineName: string;
  score: number;
  timeTakenSec: number;
}) {
  try {
    const log = await prisma.pharmacyRushLeaderboard.create({
      data: {
        studentId: data.studentId,
        medicineName: data.medicineName,
        score: data.score,
        timeTakenSec: data.timeTakenSec,
      },
    });

    // Also write to StudentActivityLog
    await prisma.studentActivityLog.create({
      data: {
        studentId: data.studentId,
        activityType: "PHARMACY_RUSH",
        referenceId: data.medicineName,
        score: data.score,
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
