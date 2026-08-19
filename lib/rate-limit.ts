import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
}

// In-memory sliding window rate limit store
const store = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 5 minutes to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const g = globalThis as any;
  if (!g.__rateLimitCleanup) {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        if (now - record.firstAttempt > 30 * 60 * 1000) {
          store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
    g.__rateLimitCleanup = timer;
  }
}

/**
 * Standard Rate Limiting Policy Profiles across IMHS platform
 */
export const RATE_LIMITS = {
  // ── Authentication & Password Protection ───────────────────────
  AUTH_ACCOUNT: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },    // 5 attempts per 15 min
  AUTH_IP: { maxAttempts: 20, windowMs: 15 * 60 * 1000 },         // 20 attempts per 15 min across accounts
  OTP_VERIFY: { maxAttempts: 5, windowMs: 10 * 60 * 1000 },       // 5 attempts per 10 min
  PASSWORD_RESET: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },   // 5 resets per 15 min
  STUDENT_CREATE: { maxAttempts: 15, windowMs: 15 * 60 * 1000 },  // 15 creates per 15 min

  // ── Paid AI Services (Google Gemini API) ──────────────────────
  AI_CHAT: { maxAttempts: 15, windowMs: 5 * 60 * 1000 },          // 15 chat messages per 5 min
  AI_DRUG_INFO: { maxAttempts: 10, windowMs: 60 * 1000 },         // 10 drug lookups per min
  AI_QUIZ_GEN: { maxAttempts: 6, windowMs: 60 * 1000 },           // 6 arcade generations per min
  AI_CASE_GEN: { maxAttempts: 6, windowMs: 60 * 1000 },           // 6 prescription case generations per min

  // ── Email & External Message Dispatch (Gmail SMTP) ────────────
  CONTACT_INQUIRY: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },  // 5 inquiries per 15 min
  CONSULTATION_BOOK: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },// 5 bookings per 15 min
  CONSULTATION_LOOKUP: { maxAttempts: 15, windowMs: 10 * 60 * 1000 }, // 15 lookups per 10 min

  // ── File Uploads & Submissions ────────────────────────────────
  FILE_UPLOAD: { maxAttempts: 10, windowMs: 10 * 60 * 1000 },     // 10 uploads per 10 min
  ASSIGNMENT_SUBMIT: { maxAttempts: 10, windowMs: 15 * 60 * 1000 }, // 10 submits per 15 min
  LEARNING_SCORE: { maxAttempts: 30, windowMs: 5 * 60 * 1000 },   // 30 scores per 5 min
  CSV_IMPORT: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },       // 5 bulk imports per 15 min
};

/**
 * Extracts client IP securely from headers or request connection.
 */
export function getClientIp(req: Request | any): string {
  try {
    if (!req) return "127.0.0.1";

    const headers = req.headers;
    if (!headers) return "127.0.0.1";

    // Check Cloudflare connecting IP
    const cfIp = headers.get ? headers.get("cf-connecting-ip") : headers["cf-connecting-ip"];
    if (cfIp) return String(cfIp).trim();

    // Check standard X-Forwarded-For header (first non-internal IP)
    const forwardedFor = headers.get ? headers.get("x-forwarded-for") : headers["x-forwarded-for"];
    if (forwardedFor) {
      const parts = String(forwardedFor).split(",");
      if (parts.length > 0 && parts[0].trim()) {
        return parts[0].trim();
      }
    }

    // Check X-Real-IP
    const realIp = headers.get ? headers.get("x-real-ip") : headers["x-real-ip"];
    if (realIp) return String(realIp).trim();

    // Check NextRequest ip property
    if (req.ip) return String(req.ip).trim();

    return "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

/**
 * Check rate limit for a specific key (IP, User ID, or combined identifier).
 * @param key Unique identifier key (e.g. `auth:login:user@example.com` or `chat:1.2.3.4`)
 * @param maxAttempts Maximum allowed requests in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { success: boolean; remaining: number; resetTime: number; limit: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, firstAttempt: now });
    return {
      success: true,
      remaining: Math.max(0, maxAttempts - 1),
      resetTime: now + windowMs,
      limit: maxAttempts,
    };
  }

  // If time window has expired, reset counter
  if (now - record.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return {
      success: true,
      remaining: Math.max(0, maxAttempts - 1),
      resetTime: now + windowMs,
      limit: maxAttempts,
    };
  }

  // If limit exceeded
  if (record.count >= maxAttempts) {
    const resetTime = record.firstAttempt + windowMs;
    return { success: false, remaining: 0, resetTime, limit: maxAttempts };
  }

  record.count += 1;
  const resetTime = record.firstAttempt + windowMs;
  return {
    success: true,
    remaining: Math.max(0, maxAttempts - record.count),
    resetTime,
    limit: maxAttempts,
  };
}

/**
 * Generates a clean 429 Too Many Requests response with RFC 6585 and OWASP-recommended HTTP headers.
 */
export function rateLimitResponse(
  resetTime: number,
  limit?: number,
  remaining: number = 0,
  customMessage?: string
) {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  const message =
    customMessage ||
    `Too many requests. Please try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}.`;

  const headers: Record<string, string> = {
    "Retry-After": retryAfterSeconds.toString(),
    "X-RateLimit-Reset": resetTime.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "Cache-Control": "no-store, max-age=0",
  };

  if (limit !== undefined) {
    headers["X-RateLimit-Limit"] = limit.toString();
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers,
    }
  );
}
