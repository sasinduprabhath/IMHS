import { encode, decode } from "next-auth/jwt";

export const TRUSTED_DEVICE_COOKIE_NAME = "imhs_trusted_device";
export const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

/**
 * Creates an encrypted 30-day trusted device token for a student browser.
 */
export async function createTrustedDeviceToken(userId: string, deviceSignature: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET || "imhs_default_secret_32_characters_long";
  const expiresAt = Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS;

  return await encode({
    token: {
      id: userId,
      userId,
      role: "STUDENT",
      deviceSignature,
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
  deviceSignature: string
): Promise<boolean> {
  try {
    if (!tokenString) return false;
    const secret = process.env.NEXTAUTH_SECRET || "imhs_default_secret_32_characters_long";
    const decoded = await decode({ token: tokenString, secret });

    if (!decoded || !decoded.userId || !decoded.trustedUntil) return false;
    if (decoded.userId !== userId) return false;

    // Optional device signature match (if provided)
    if (decoded.deviceSignature && deviceSignature && decoded.deviceSignature !== deviceSignature) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return Number(decoded.trustedUntil) > now;
  } catch {
    return false;
  }
}
