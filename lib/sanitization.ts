/**
 * Input sanitization helpers to prevent Cross-Site Scripting (XSS) and injection attacks.
 */

/**
 * Strips HTML tags, script blocks, and dangerous control characters from user text inputs.
 */
export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
      switch (char) {
        case "\0": return "";
        case "\x08": return "";
        case "\x09": return " ";
        case "\x1a": return "";
        case "\n": return "\n";
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
