import { encode, decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const DEVICE_UUID_COOKIE_NAME = "imhs_device_uuid";
export const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

export const TRUSTED_DEVICE_COOKIE_NAME = "imhs_trusted_device";
export const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET is not defined.");
  }
  return secret;
}

/**
 * Generates a cryptographically random, collision-resistant device UUID.
 * Example: dev_8f9c2e4a1b7d4c8e9f0a1b2c3d4e5f6a
 */
export function generateDeviceUuid(): string {
  return "dev_" + crypto.randomBytes(16).toString("hex");
}

/**
 * Creates an encrypted 30-day trusted device token for a student browser.
 */
export async function createTrustedDeviceToken(userId: string, deviceIdentifier: string): Promise<string> {
  const secret = getJwtSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS;

  return await encode({
    token: {
      id: userId,
      userId,
      role: "STUDENT",
      deviceIdentifier,
      trustedUntil: expiresAt,
    },
    secret,
  });
}

/**
 * Verifies if the incoming trusted device cookie is valid for the given student and device.
 */
export async function verifyTrustedDeviceToken(
  tokenString: string,
  userId: string,
  candidateIdentifiers?: string | string[]
): Promise<boolean> {
  try {
    if (!tokenString) return false;
    const secret = getJwtSecret();
    const decoded = await decode({ token: tokenString, secret });

    if (!decoded || !decoded.userId || !decoded.trustedUntil) return false;
    if (decoded.userId !== userId) return false;

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (Number(decoded.trustedUntil) <= now) return false;

    // If candidate identifiers provided and token has a device identifier bound, check match
    const tokenDev = (decoded.deviceIdentifier || decoded.deviceSignature) as string | undefined;
    if (tokenDev && candidateIdentifiers) {
      const candidates = (Array.isArray(candidateIdentifiers) ? candidateIdentifiers : [candidateIdentifiers])
        .filter((c): c is string => typeof c === "string" && c.length > 0);
      if (candidates.length > 0 && !candidates.includes(tokenDev)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sets persistent device cookies on outgoing HTTP responses:
 * - 1-year HttpOnly device UUID cookie
 * - (Optional) 30-day trusted device bypass cookie
 */
export async function setDeviceCookies(
  res: NextResponse,
  userId: string,
  deviceUuid: string,
  trustDevice: boolean = true
): Promise<void> {
  const isProd = process.env.NODE_ENV === "production";

  // 1. Long-term persistent device UUID cookie (1 Year)
  res.cookies.set({
    name: DEVICE_UUID_COOKIE_NAME,
    value: deviceUuid,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
  });

  // 2. 30-Day trusted device bypass cookie (avoids repeated OTP on this browser)
  if (trustDevice) {
    const trustedToken = await createTrustedDeviceToken(userId, deviceUuid);
    res.cookies.set({
      name: TRUSTED_DEVICE_COOKIE_NAME,
      value: trustedToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS_IN_SECONDS,
    });
  }
}
