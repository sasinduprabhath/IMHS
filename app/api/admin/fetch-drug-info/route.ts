import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitization";
import { z } from "zod";

export const runtime = "nodejs";

const fetchDrugInfoSchema = z.object({
  genericName: z.string().min(1, "Generic medicine name is required").max(150, "Medicine name too long"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `ai:drug_info:${session.user.id || clientIp}`,
      RATE_LIMITS.AI_DRUG_INFO.maxAttempts,
      RATE_LIMITS.AI_DRUG_INFO.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "AI drug lookup rate limit exceeded. Please wait a moment.");
    }

    const body = await req.json();
    const parsed = fetchDrugInfoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Generic medicine name is required." }, { status: 400 });
    }

    const genericName = sanitizeString(parsed.data.genericName, 150);

    const apiKey =
      process.env.GOOGLE_AI_STUDIO_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_AI_STUDIO_API_KEY is not configured in server environment." },
        { status: 500 }
      );
    }

    const prompt = `Return pharmacological details for the generic medicine "${genericName.trim()}" as JSON with these keys:
- "drugClass": Main therapeutic/pharmacological class (e.g., "HMG-CoA Reductase Inhibitor").
- "mechanismOfAction": Concise, accurate mechanism of action (1-2 sentences).
- "sideEffects": Array of 3-5 common side effects.
- "drugInteractions": Array of 3-5 clinically relevant drug interactions.
- "antidote": Specific reversal agent/antidote if available, otherwise "Symptomatic support".

Output raw JSON only. Do not include markdown code blocks or explanatory wrapper text.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 600,
      },
    };

    // Try Gemini Flash models with fallbacks
    const models = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
    ];

    let jsonResponseText = "";
    let fetchError = "";

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const resData = await res.json();
          const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            jsonResponseText = candidateText;
            break;
          }
        } else {
          const errData = await res.text();
          fetchError = `Model ${model} failed (${res.status}): ${errData.slice(0, 100)}`;
        }
      } catch (err: any) {
        fetchError = err.message || "Fetch failed";
      }
    }

    if (!jsonResponseText) {
      return NextResponse.json(
        { error: fetchError || "Failed to retrieve drug information from Gemini API." },
        { status: 502 }
      );
    }

    // Clean potential markdown quotes if model wrapped output
    const cleanJson = jsonResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: {
        drugClass: parsedData.drugClass || "General Medicine",
        mechanismOfAction: parsedData.mechanismOfAction || "",
        sideEffects: Array.isArray(parsedData.sideEffects)
          ? parsedData.sideEffects
          : typeof parsedData.sideEffects === "string"
          ? [parsedData.sideEffects]
          : [],
        drugInteractions: Array.isArray(parsedData.drugInteractions)
          ? parsedData.drugInteractions
          : Array.isArray(parsedData.interactions)
          ? parsedData.interactions
          : typeof parsedData.drugInteractions === "string"
          ? [parsedData.drugInteractions]
          : [],
        antidote: parsedData.antidote || "Symptomatic support",
      },
    });
  } catch (error: any) {
    console.error("Error in fetch-drug-info API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
