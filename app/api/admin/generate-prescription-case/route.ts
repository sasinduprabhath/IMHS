import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitization";
import { z } from "zod";

export const runtime = "nodejs";

const generateCaseSchema = z.object({
  scenario: z.string().max(200).optional().default("General Hospital Inpatient"),
  errorType: z.string().max(200).optional().default("Wrong Dose"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(
      `ai:case_gen:${session.user.id || clientIp}`,
      RATE_LIMITS.AI_CASE_GEN.maxAttempts,
      RATE_LIMITS.AI_CASE_GEN.windowMs
    );
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "AI case generation rate limit exceeded. Please wait a minute.");
    }

    const body = await req.json();
    const parsed = generateCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid case generator parameters." }, { status: 400 });
    }

    const scenario = sanitizeString(parsed.data.scenario, 200);
    const errorType = sanitizeString(parsed.data.errorType, 200);

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

    const prompt = `You are a Senior Clinical Pharmacist and Medical Educator designing realistic prescription review exam cases for pharmacy and medical students.

Generate a comprehensive clinical prescription case based on this scenario: "${scenario || "Random realistic outpatient clinical prescription case"}".
Desired error category: "${errorType || "any realistic clinical problem or clean prescription"}".

Return a valid JSON object matching this exact schema:
{
  "title": "Clear case title, e.g., 'Hypertension Review: Excessive Amlodipine Dosing'",
  "patientDetails": {
    "name": "Realistic Sri Lankan / South Asian or general patient name, e.g., 'Kumari Perera' or 'Nimal Jayawardena'",
    "age": 58,
    "sex": "Female or Male",
    "date": "2024-03-15",
    "diagnosis": "Clinical diagnosis, e.g., 'Essential Hypertension & Type 2 Diabetes'"
  },
  "medicineDetails": [
    {
      "name": "Medicine Generic or Brand Name, e.g., 'Amlodipine'",
      "strength": "Strength, e.g., '10 mg'",
      "dose": "Dose, e.g., '1 tablet'",
      "frequency": "Frequency, e.g., 'Twice daily'",
      "duration": "Duration, e.g., '30 days'"
    },
    {
      "name": "Second Medicine Name, e.g., 'Metformin'",
      "strength": "500 mg",
      "dose": "1 tablet",
      "frequency": "Twice daily",
      "duration": "30 days"
    }
  ],
  "hasProblem": true, // Boolean: true if prescription contains an error/contraindication/interaction, false if valid to dispense
  "problemOptions": [
    "Wrong/excessive dose",
    "Severe drug-drug interaction",
    "Contraindication with patient condition",
    "Incomplete prescription details",
    "Illegible handwriting / ambiguous frequency"
  ],
  "correctProblem": "Wrong/excessive dose", // Must be one of the problemOptions if hasProblem is true, otherwise empty string ""
  "shouldDispense": false, // Boolean: false if prescription should be withheld/clarified with prescriber, true if safe
  "dispenseReason": "Detailed clinical rationale explaining why the prescription should or should not be dispensed (2-3 sentences with dosing limits or pharmacology mechanisms).",
  "counsellingPoints": [
    "Clear practical counselling point 1 for the patient",
    "Clear practical counselling point 2 for the patient",
    "Clear practical counselling point 3 for the patient"
  ]
}

Ensure all pharmacology, dosing limits, and clinical guidelines (BNF / WHO / SLMC standards) are 100% accurate. Output raw JSON only with no markdown formatting.`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    };

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
        { error: fetchError || "Failed to generate prescription case from Gemini API." },
        { status: 502 }
      );
    }

    const cleanJson = jsonResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      caseData: parsedData,
    });
  } catch (error: any) {
    console.error("Error in generate-prescription-case API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
