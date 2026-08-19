import crypto from "crypto";

/**
 * lib/encryption.ts
 * Authenticated AES-256-GCM Encryption at Rest for Sensitive Fields
 * 
 * Provides authenticated encryption for sensitive PII and confidential records
 * (e.g. clinical topic notes, admin notes, meeting credentials).
 * 
 * Format: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const PREFIX = "enc:v1:";

/**
 * Derives a 32-byte (256-bit) encryption key from the environment secret.
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "fallback_imhs_secure_encryption_key_2024";

  // SHA-256 ensures a predictable 32-byte key regardless of input secret length
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Checks if a string is already encrypted with our format.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  return value.startsWith(PREFIX);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * If the input is empty or already encrypted, returns it directly.
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null;
  if (typeof plaintext !== "string" || plaintext.trim() === "") return plaintext;
  if (isEncrypted(plaintext)) return plaintext; // Prevent double encryption

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext}`;
  } catch (error) {
    console.error("[lib/encryption] Encryption failed:", error);
    // In case of unexpected crypto failure, throw to avoid writing unencrypted sensitive data silently
    throw new Error("Failed to encrypt sensitive field at rest.");
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * If the input is plaintext (e.g. legacy data before encryption was enabled), returns the plaintext safely.
 */
export function decryptField(encryptedOrPlaintext: string | null | undefined): string | null {
  if (encryptedOrPlaintext === null || encryptedOrPlaintext === undefined) return null;
  if (typeof encryptedOrPlaintext !== "string" || encryptedOrPlaintext.trim() === "") {
    return encryptedOrPlaintext;
  }

  // Gracefully return plaintext if not encrypted (supports legacy database entries)
  if (!isEncrypted(encryptedOrPlaintext)) {
    return encryptedOrPlaintext;
  }

  try {
    const payload = encryptedOrPlaintext.slice(PREFIX.length);
    const parts = payload.split(":");

    if (parts.length !== 3) {
      console.warn("[lib/encryption] Malformed encrypted payload structure.");
      return encryptedOrPlaintext;
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[lib/encryption] Decryption / authentication tag verification failed:", error);
    return "[Encrypted Content - Decryption Failed]";
  }
}

/**
 * Creates a deterministic HMAC-SHA256 blind index for searchable encrypted fields (e.g. phone/email search)
 */
export function hashBlindIndex(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = getEncryptionKey();
  return crypto.createHmac("sha256", key).update(value.trim().toLowerCase()).digest("hex");
}
