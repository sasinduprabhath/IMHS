import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
}

// In-memory sliding window rate limit store
const store = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 10 minutes to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const g = globalThis as any;
  if (!g.__rateLimitCleanup) {
    g.__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        if (now - record.firstAttempt > 15 * 60 * 1000) {
          store.delete(key);
        }
      }
    }, 10 * 60 * 1000);
  }
}

/**
 * Check rate limit for a specific IP or User ID key.
 * @param key Unique key (e.g. `login:192.168.1.1` or `contact:ip`)
 * @param maxAttempts Maximum allowed requests in window (default: 5)
 * @param windowMs Time window in milliseconds (default: 15 minutes = 900,000ms)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, firstAttempt: now });
    return { success: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }

  // If time window has expired, reset counter
  if (now - record.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { success: true, remaining: maxAttempts - 1, resetTime: now + windowMs };
  }

  // If limit exceeded
  if (record.count >= maxAttempts) {
    const resetTime = record.firstAttempt + windowMs;
    return { success: false, remaining: 0, resetTime };
  }

  record.count += 1;
  return { success: true, remaining: maxAttempts - record.count, resetTime: record.firstAttempt + windowMs };
}

/**
 * Generates a clean 429 Too Many Requests response with OWASP-recommended HTTP headers.
 */
export function rateLimitResponse(resetTime: number) {
  const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    {
      success: false,
      message: `Too many attempts. Please try again in ${Math.max(1, retryAfterSeconds)} seconds.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.max(1, retryAfterSeconds).toString(),
        "X-RateLimit-Reset": resetTime.toString(),
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
