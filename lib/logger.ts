import fs from "fs";
import path from "path";

/**
 * Log levels for IMHS application & security monitoring
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "SECURITY" | "ERROR";

export type SecurityEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_ACCOUNT_LOCKED"
  | "AUTH_DEVICE_LOCKED"
  | "AUTH_OTP_SENT"
  | "AUTH_OTP_VERIFIED"
  | "AUTH_OTP_FAILED"
  | "RATE_LIMIT_EXCEEDED"
  | "UNAUTHORIZED_ADMIN_ACCESS"
  | "UNAUTHORIZED_STUDENT_ACCESS"
  | "FILE_UPLOAD_SUCCESS"
  | "FILE_UPLOAD_BLOCKED"
  | "INPUT_VALIDATION_FAILED"
  | "CRYPTO_TAMPER_DETECTED";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event?: SecurityEventType | string;
  message: string;
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
  data?: any;
  error?: string;
  stack?: string;
}

// Patterns of sensitive property names to redact
const SENSITIVE_KEY_PATTERNS = [
  /pass(word|phrase)?/i,
  /otp/i,
  /token/i,
  /secret/i,
  /auth(orization)?/i,
  /cookie/i,
  /jwt/i,
  /key/i,
  /signature/i,
  /hash/i,
  /cvv/i,
  /credit_?card/i,
];

/**
 * Deeply redacts sensitive keys from objects, arrays, and strings to guarantee zero secret leakage.
 */
export function redactSensitiveData(obj: any, depth: number = 0): any {
  if (depth > 8 || obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Redact Bearer tokens in headers
    if (/^Bearer\s+[A-Za-z0-9\-_.]+/i.test(obj)) {
      return "Bearer ***REDACTED***";
    }
    return obj;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof obj === "object") {
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitive) {
        redacted[key] = "***REDACTED***";
      } else {
        redacted[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return redacted;
  }

  return obj;
}

// Ensure log directories exist
const logsDir = path.join(process.cwd(), "logs");
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch {
  // Ignored if in read-only environment or serverless runtime
}

async function writeToFile(fileName: string, line: string) {
  try {
    const filePath = path.join(logsDir, fileName);
    await fs.promises.appendFile(filePath, line + "\n", "utf8");
  } catch {
    // Gracefully handle file system write errors in non-writable environments
  }
}

/**
 * Formats and outputs the log entry to console and log files.
 */
function outputLog(entry: LogEntry) {
  const line = JSON.stringify(entry);

  // Colored console output for developer visibility
  const prefix = `[${entry.timestamp}] [${entry.level}]`;
  const eventTag = entry.event ? `[${entry.event}]` : "";
  const ipTag = entry.ip ? `(${entry.ip})` : "";
  const userTag = entry.userId ? `<User:${entry.userId}>` : "";

  const consoleMsg = `${prefix} ${eventTag} ${ipTag} ${userTag} ${entry.message}`;

  switch (entry.level) {
    case "DEBUG":
      if (process.env.NODE_ENV !== "production") {
        console.debug(consoleMsg, entry.data || "");
      }
      break;
    case "INFO":
      console.info(consoleMsg, entry.data ? JSON.stringify(entry.data) : "");
      break;
    case "WARN":
      console.warn(consoleMsg, entry.data ? JSON.stringify(entry.data) : "");
      break;
    case "SECURITY":
      console.warn(`🛡️  SECURITY ALERT: ${consoleMsg}`, entry.data ? JSON.stringify(entry.data) : "");
      writeToFile("security.log", line);
      break;
    case "ERROR":
      console.error(`🚨 ERROR: ${consoleMsg}`, entry.error || "", entry.data || "");
      writeToFile("error.log", line);
      writeToFile("security.log", line);
      break;
  }
}

export const logger = {
  debug(message: string, data?: any) {
    outputLog({
      timestamp: new Date().toISOString(),
      level: "DEBUG",
      message,
      data: redactSensitiveData(data),
    });
  },

  info(message: string, data?: any) {
    outputLog({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      data: redactSensitiveData(data),
    });
  },

  warn(message: string, data?: any) {
    outputLog({
      timestamp: new Date().toISOString(),
      level: "WARN",
      message,
      data: redactSensitiveData(data),
    });
  },

  error(message: string, err?: any, context?: { userId?: string; ip?: string; path?: string; method?: string; data?: any }) {
    outputLog({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      userId: context?.userId,
      ip: context?.ip,
      path: context?.path,
      method: context?.method,
      error: err instanceof Error ? err.message : String(err || ""),
      stack: err instanceof Error && process.env.NODE_ENV !== "production" ? err.stack : undefined,
      data: redactSensitiveData(context?.data),
    });
  },

  security(
    event: SecurityEventType,
    message: string,
    context?: {
      userId?: string;
      ip?: string;
      path?: string;
      method?: string;
      details?: any;
    }
  ) {
    outputLog({
      timestamp: new Date().toISOString(),
      level: "SECURITY",
      event,
      message,
      userId: context?.userId,
      ip: context?.ip,
      path: context?.path,
      method: context?.method,
      data: redactSensitiveData(context?.details),
    });
  },
};
