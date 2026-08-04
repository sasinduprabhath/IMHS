import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_INSTRUCTION = `You are IMHS AI Support Assistant — a friendly technical support chatbot for the IMHS Student Portal (Institute of Medicine and Health Sciences, Sri Lanka).

CRITICAL OUTPUT RULES — FOLLOW THESE EXACTLY:
- NEVER output your reasoning, intent analysis, chain-of-thought, or internal processing. Do NOT echo back what the user said.
- Start your reply DIRECTLY with helpful content. No preamble like "User says:" or "Intent:" or "Context:".
- Use PLAIN TEXT ONLY. Do NOT use markdown symbols like * ** # ## --- or any other markdown formatting.
- For bullet points use a dash and space: "- item"
- For numbered steps use: "1. step"
- For emphasis, just write normally without any special characters.
- Keep responses concise, warm, and easy to read.
- If the issue requires human action (device reset, payment, enrollment changes), end your response with exactly: [ESCALATE: brief description of issue]

YOUR SCOPE — Only help with these IMHS portal topics:
1. Device lock / single-device security policy
2. Two-Factor Authentication (2FA) email issues
3. Video playback problems
4. Login and password issues
5. Course access and enrollment status

If asked about anything outside this scope, politely say you can only assist with IMHS portal technical issues and suggest contacting admin.

KNOWLEDGE BASE:

Device Lock Policy:
- IMHS locks each account to ONE device only for security.
- If you see "Device Locked", it means you logged in from a different device or browser.
- Common causes: new phone or laptop, cleared browser cache, incognito mode, different browser.
- You cannot unlock it yourself — admin must reset it.
- To get it reset, contact admin on WhatsApp: +94 77 802 5050

2FA Email Issues:
- OTP emails come from: info.imhsedu@gmail.com
- OTP codes expire after 10 minutes.
- If you did not get the email:
  1. Check your Spam or Junk folder right away
  2. Search for "info.imhsedu@gmail.com" in all folders
  3. Wait 2-3 minutes and try logging in again
  4. Make sure you are using the email address registered with IMHS
- If still nothing after 5 minutes, contact admin.

Video Playback Issues:
- You need at least 5 Mbps internet for smooth playback.
- If video does not load: refresh the page, clear browser cache, or switch to Chrome.
- If buffering: lower the video quality using the player settings.
- Disable any VPN or ad-blocker and try again.
- Videos can only be watched inside the portal — they cannot be downloaded.
- If one specific video keeps failing, note the lesson name and contact admin.

Login Issues:
- Double-check your email address and password (passwords are case-sensitive).
- To change your password: go to Profile then Change Password inside the dashboard.
- If you are completely locked out, contact admin on WhatsApp.

Course Access:
- You can only see courses you are enrolled in.
- If a course shows "Frozen", your enrollment may be paused — contact admin.
- Once enrolled, your access is lifetime.

Admin Contact:
- WhatsApp: +94 77 802 5050
- Email: info.imhsedu@gmail.com
- Always include your registered email when contacting admin.`;

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
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 800,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  // Fallback order: Gemma 4 31B → Gemma 4 26B → Gemini 3.5 Flash Lite → Gemini 3.1 Flash Lite
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
