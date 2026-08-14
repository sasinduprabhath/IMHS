import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { medicineName } = await req.json();
    if (!medicineName || typeof medicineName !== "string" || !medicineName.trim()) {
      return NextResponse.json({ error: "Medicine name is required." }, { status: 400 });
    }

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

    const prompt = `Generate a 10-round arcade quiz for the generic medicine "${medicineName.trim()}".
Return a JSON array of exactly 10 objects. Each object represents 1 round and must contain:
- "roundNumber": Integer from 1 to 10.
- "challengeType": Short topic string (e.g. "drug_class", "indication", "moa", "dosage", "side_effects", "contraindications", "counselling", "clinical_decision", "speed_challenge").
- "questionText": Clear, concise clinical question for this round.
- "options": Array of 4 strings where index 0 is ALWAYS the CORRECT answer, and indices 1, 2, 3 are plausible distractors.
- "correctOption": Must match index 0 of "options".

Topics for the 10 rounds:
1. Drug Class
2. Main FDA Indication
3. Mechanism of Action (MOA)
4. Standard Dosage & Formulation
5. Route / Dosage Form
6. Common Side Effect
7. Precaution / Contraindication
8. Patient Counselling Advice
9. Critical Clinical Decision
10. Final Master Speed Round

Output raw JSON array only. Do not include markdown or wrapper text.`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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
          const errText = await res.text();
          fetchError = `Model ${model} failed (${res.status}): ${errText.slice(0, 100)}`;
        }
      } catch (err: any) {
        fetchError = err.message || "Fetch failed";
      }
    }

    if (!jsonResponseText) {
      return NextResponse.json(
        { error: fetchError || "Failed to generate arcade rounds from Gemini API." },
        { status: 502 }
      );
    }

    const cleanJson = jsonResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedRounds = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      rounds: parsedRounds,
    });
  } catch (error: any) {
    console.error("Error generating arcade rounds:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
