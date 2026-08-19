/**
 * lib/sanitization.ts
 * Universal server-side input sanitization helpers to prevent XSS, query injection, and control code exploits.
 */

/**
 * Strips HTML tags, script blocks, and dangerous control characters from user text inputs.
 */
export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\0\x08\x09\x1a\r"'\\%]/g, (char) => {
      switch (char) {
        case "\0": return "";
        case "\x08": return "";
        case "\x09": return " ";
        case "\x1a": return "";
        case "\r": return "";
        case "\"": return "&quot;";
        case "'": return "&#x27;";
        case "\\": return "\\\\";
        default: return char;
      }
    });

  return cleaned.trim().slice(0, maxLength);
}

/**
 * Normalizes and sanitizes user email addresses.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  return sanitizeString(email, 254).toLowerCase().trim();
}

/**
 * Strips non-standard characters from phone numbers, keeping only digits, spaces, hyphens, and leading '+'.
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  return phone
    .replace(/[^\d+\-\s()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

/**
 * Validates and sanitizes URLs to prevent 'javascript:', 'data:', or 'vbscript:' XSS vectors.
 * Allows valid http/https URLs or root-relative paths ('/uploads/...').
 */
export function sanitizeUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Root-relative path (e.g. /uploads/briefs/sample.pdf)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.slice(0, 500);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString().slice(0, 500);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sanitizes generic identifiers (CUIDs, UUIDs, Slugs, Booking Codes).
 */
export function sanitizeIdentifier(id: unknown, maxLength: number = 100): string {
  if (typeof id !== "string") return "";
  return id.replace(/[^a-zA-Z0-9_\-\.]/g, "").trim().slice(0, maxLength);
}
