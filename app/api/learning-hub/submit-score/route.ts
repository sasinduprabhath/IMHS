import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { activityType, referenceId, score, maxScore, timeTakenSec, medicineName } = body;

    const userId = session?.user?.id || body.studentId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized or missing student ID" }, { status: 401 });
    }

    // 1. Create activity log entry
    const activityLog = await prisma.studentActivityLog.create({
      data: {
        studentId: userId,
        activityType: activityType || "GENERAL",
        referenceId: referenceId || null,
        score: Number(score) || 0,
        maxScore: Number(maxScore) || 100,
      },
    });

    // 2. If Pharmacy Rush, create leaderboard entry
    let leaderboardEntry = null;
    if (activityType === "PHARMACY_RUSH" && medicineName) {
      leaderboardEntry = await prisma.pharmacyRushLeaderboard.create({
        data: {
          studentId: userId,
          medicineName,
          score: Number(score) || 0,
          timeTakenSec: Number(timeTakenSec) || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      log: activityLog,
      leaderboard: leaderboardEntry,
    });
  } catch (error: any) {
    console.error("API /api/learning-hub/submit-score error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit score" }, { status: 500 });
  }
}
