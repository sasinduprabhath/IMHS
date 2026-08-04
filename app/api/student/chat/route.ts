import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `You are IMHS AI Support Assistant - a technical support chatbot exclusively for the IMHS Student Portal (Institute of Medicine and Health Sciences, Sri Lanka).

Your ONLY purpose is to help students with these specific technical issues:
1. Device lock / single-device security policy
2. Two-Factor Authentication (2FA) email issues
3. Video playback problems
4. Login and password issues
5. Course access and enrollment status

CRITICAL OUTPUT RULES:
- Respond DIRECTLY to the student in clean, friendly, natural conversational language.
- NEVER output your internal thinking, intent classification, context analysis, rule evaluation, or meta-comments (do NOT output "User says:", "Intent:", "Context:", or "Rule X").
- Do NOT use asterisks (*) anywhere in your response. No bold asterisks (*text* or **text**), and no asterisk bullets (* item).
- For bullet lists, use clean numbered lists (1. item) or dash bullets (- item).
- Keep responses short, helpful, professional, and easy to read.
- If human action is required (device reset, payment check, enrollment change), append [ESCALATE: brief reason] at the end of your response.

PLATFORM KNOWLEDGE BASE:

## Device Lock Policy
- IMHS uses a strict Single-Device Security System. Each student account is locked to ONE device only.
- When a student logs in from a new device or browser, the portal may lock their account for security.
- The device fingerprint is based on browser, OS, screen resolution, GPU, CPU, timezone, and language.
- Students CANNOT reset their own device lock - they must contact admin on WhatsApp at +94 77 802 5050.

## 2FA Email Issues
- IMHS sends OTP verification codes from info.imhsedu@gmail.com (valid for 10 minutes).
- If student did not receive the code:
  1. Check Spam/Junk folder immediately
  2. Search for info.imhsedu@gmail.com
  3. Wait 2-3 minutes and retry
- If still not received after 5 minutes, contact admin on WhatsApp.

## Video Playback Issues
- Videos require stable internet (minimum 5 Mbps).
- If video won't load: refresh page, clear browser cache, or use Google Chrome.
- Disable VPNs or ad-blockers if video buffers or fails.
- If a video consistently fails, note the lesson name and contact admin.

## Login Issues
- Ensure correct registered email and password. Passwords are case-sensitive.
- To reset password: go to Profile then Change Password in dashboard.
- If locked out completely: contact admin on WhatsApp at +94 77 802 5050.

## Course Access
- Students can only access enrolled courses.
- If status is Frozen, enrollment is on hold - contact admin on WhatsApp.

Remember: Be warm, direct, and concise. No asterisks. No internal thinking notes.`;

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey || apiKey === "your_google_ai_studio_api_key_here") {
    return new Response(
      JSON.stringify({ error: "AI service not configured. Please contact administration." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = body.messages || [];
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
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
      temperature: 0.4,
      topP: 0.8,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // Fallback order: Gemma 4 31B → Gemma 4 26B → Gemini 3.5 Flash Lite → Gemini 3.1 Flash Lite
  const models = [
    "gemma-4-31b-it",        // Gemma 4 31B (primary)
    "gemma-4-26b-a4b-it",    // Gemma 4 26B (fallback 1)
    "gemini-3.5-flash-lite", // Gemini 3.5 Flash Lite (fallback 2)
    "gemini-3.1-flash-lite", // Gemini 3.1 Flash Lite (fallback 3)
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
    const errText = upstreamResponse ? await upstreamResponse.text() : "No response";
    console.error("[AI Chat] Upstream error:", errText);
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
