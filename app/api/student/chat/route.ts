import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      content: z.string().min(1, "Message content cannot be empty").max(4000, "Message is too long"),
    })
  ).min(1, "At least one message is required").max(50, "Chat history too long"),
});

const SYSTEM_INSTRUCTION = `You are the official IMHS AI Assistant for the Institute of Medicine and Health Sciences (Sri Lanka).

Assist visitors, prospective students, and enrolled medical professionals with friendly, clear, conversational plain text. Never output meta-notes, prompt analysis, rules, or system tags.

KNOWLEDGE BASE & GUIDELINES:

1. About IMHS:
IMHS (Institute of Medicine and Health Sciences) is Sri Lanka's leading institute for clinical pathology, ECG masterclasses, and post-graduate medical education, founded by Dr. Isuru Wijesinghe.

2. Courses & Enrollment:
- Featured programs: Clinical Pathology, ECG Masterclass, Emergency Medicine, and Advanced Clinical Diagnostics.
- To enroll: Select a course on the website or contact IMHS admin on WhatsApp at +94 77 802 5050. Payment verification is completed by administration, who will provision your portal account credentials.

3. Consultations with Dr. Isuru Wijesinghe:
- Visitors can book clinical consultations directly via the /consultation page on the website.

4. Device Lock Policy:
- IMHS locks student accounts to ONE single device for security.
- If a student sees "Device Locked", it means they logged in from a different device, browser, or cleared browser cache.
- Students cannot unlock accounts themselves - an admin must reset it. Direct them to contact admin on WhatsApp at +94 77 802 5050 with their registered email. Always end with: [ESCALATE: Device lock reset request]

5. 2FA Email Issues:
- Verification OTP emails come from info.imhsedu@gmail.com and expire in 10 minutes.
- Check Spam/Junk folder and search all mail folders. If still not received after 5 minutes, contact admin.

6. Video Playback & Login Help:
- Videos stream inside the portal (minimum 5 Mbps internet). Videos are not downloadable.
- Passwords are case-sensitive. To change password, go to Profile -> Change Password in the portal dashboard.

7. Admin Contact:
- WhatsApp: +94 77 802 5050
- Email: info.imhsedu@gmail.com

Always be warm, professional, concise, and helpful.`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(req: NextRequest) {
  // Rate limiting on paid AI API: Max 15 messages per 5 minutes per client IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(
    `ai:chat:${clientIp}`,
    RATE_LIMITS.AI_CHAT.maxAttempts,
    RATE_LIMITS.AI_CHAT.windowMs
  );
  if (!rateLimit.success) {
    return rateLimitResponse(
      rateLimit.resetTime,
      rateLimit.limit,
      rateLimit.remaining,
      "Too many AI chat requests. Please wait a few minutes before chatting again."
    );
  }

  // Session check is optional so visitors/guests can chat without logging in
  const session = await getServerSession(authOptions).catch(() => null);

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_google_ai_studio_api_key_here") {
    return new Response(
      JSON.stringify({ error: "AI service not configured. Please contact administration." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues[0]?.message || "Invalid message format." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    messages = parsed.data.messages;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 600,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // Fallback order: Gemini 3.5 Flash Lite -> Gemini 3.1 Flash Lite
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ];
  let upstreamResponse: Response | null = null;
  let usedModel = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        upstreamResponse = res;
        usedModel = model;
        break;
      }
    } catch {
      // try next model
    }
  }

  if (!upstreamResponse || !upstreamResponse.ok || !upstreamResponse.body) {
    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable. Please try again shortly." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch {
              // skip malformed line
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-AI-Model": usedModel,
      "Cache-Control": "no-cache",
    },
  });
}
