import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString, sanitizeIdentifier } from "@/lib/sanitization";
import { z } from "zod";

const submitScoreSchema = z.object({
  activityType: z.string().max(50).default("GENERAL"),
  referenceId: z.string().max(100).optional().nullable(),
  score: z.number().int().min(0).max(10000).default(0),
  maxScore: z.number().int().min(1).max(10000).default(100),
  timeTakenSec: z.number().int().min(0).max(86400).optional().default(0),
  medicineName: z.string().max(100).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Active session required." }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `score_sub:${session.user.id}:${clientIp}`,
      RATE_LIMITS.LEARNING_SCORE.maxAttempts,
      RATE_LIMITS.LEARNING_SCORE.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Score submission rate limit reached. Please wait a moment.");
    }

    const body = await req.json();
    const parsed = submitScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid score submission." }, { status: 400 });
    }

    const { activityType, referenceId, score, maxScore, timeTakenSec, medicineName } = parsed.data;

    const userId = session.user.id;

    // 1. Create activity log entry
    const activityLog = await prisma.studentActivityLog.create({
      data: {
        studentId: userId,
        activityType: sanitizeIdentifier(activityType, 50) || "GENERAL",
        referenceId: referenceId ? sanitizeIdentifier(referenceId, 100) : null,
        score,
        maxScore,
      },
    });

    // 2. If Pharmacy Rush, create leaderboard entry
    let leaderboardEntry = null;
    if (activityType === "PHARMACY_RUSH" && medicineName) {
      leaderboardEntry = await prisma.pharmacyRushLeaderboard.create({
        data: {
          studentId: userId,
          medicineName: sanitizeString(medicineName, 100),
          score,
          timeTakenSec,
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
