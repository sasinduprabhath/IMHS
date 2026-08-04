import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `You are the official IMHS Support Assistant for the Institute of Medicine and Health Sciences Student Portal (Sri Lanka).

Answer student inquiries directly in friendly, plain conversational text. Never output meta-notes, prompt analysis, rules, or system tags.

KNOWLEDGE BASE & GUIDELINES:

1. Device Lock Issues:
IMHS locks student accounts to ONE single device for security. If a student sees "Device Locked", it means they logged in from a different device, browser, or cleared their browser cache. Students cannot unlock accounts themselves - an admin must reset it. Direct them to contact admin on WhatsApp at +94 77 802 5050 with their registered email. Always end with: [ESCALATE: Device lock reset request]

2. 2FA Email Issues:
Verification OTP emails are sent from info.imhsedu@gmail.com and expire in 10 minutes. Tell the student to check their Spam/Junk folder and search all mail folders. If still not received after 5 minutes, suggest contacting admin.

3. Video Playback Issues:
Videos stream inside the portal and require a 5 Mbps internet connection. Recommend refreshing the page, clearing browser cache, switching to Chrome, or disabling VPN/ad-blockers. Videos cannot be downloaded.

4. Login Issues:
Remind students passwords are case-sensitive. To change password, go to Profile then Change Password in the dashboard. If locked out completely, contact admin.

5. Course Access:
Students can only access enrolled courses. Frozen status means enrollment is on hold.

6. Off-Topic Questions:
If asked about non-portal topics (medical advice, homework, general topics), politely state you can only assist with IMHS Student Portal technical support.

Always be warm, concise, and helpful.`;

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
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 600,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // Fallback order: Gemma 4 31B -> Gemma 4 26B -> Gemini 3.5 Flash Lite -> Gemini 3.1 Flash Lite
  const models = [
    "gemma-4-31b-it",
    "gemma-4-26b-a4b-it",
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
