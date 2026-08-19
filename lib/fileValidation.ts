import crypto from "crypto";
import path from "path";

/**
 * Known file signatures (magic numbers) for supported file types.
 */
const MAGIC_SIGNATURES: Record<string, { bytes: number[]; offset?: number }[]> = {
  // PDF: %PDF- (0x25 0x50 0x44 0x46)
  ".pdf": [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }],

  // PNG: \x89PNG\r\n\x1a\n (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
  ".png": [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 }],

  // JPEG / JPG: \xFF\xD8\xFF
  ".jpg": [{ bytes: [0xff, 0xd8, 0xff], offset: 0 }],
  ".jpeg": [{ bytes: [0xff, 0xd8, 0xff], offset: 0 }],

  // WebP: RIFF....WEBP (0x52 0x49 0x46 0x46 .... 0x57 0x45 0x42 0x50)
  ".webp": [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }],

  // ZIP / DOCX / OpenXML: PK\x03\x04 or PK\x05\x06 or PK\x07\x08
  ".zip": [
    { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },
    { bytes: [0x50, 0x4b, 0x05, 0x06], offset: 0 },
    { bytes: [0x50, 0x4b, 0x07, 0x08], offset: 0 },
  ],
  ".docx": [
    { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },
  ],

  // DOC (legacy Microsoft Word Compound Binary Format / OLE CFBF): \xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1
  ".doc": [{ bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], offset: 0 }],
};

// Dangerous signatures to immediately reject regardless of extension
const DANGEROUS_SIGNATURES: { name: string; bytes: number[] }[] = [
  { name: "Windows Executable / DLL (MZ)", bytes: [0x4d, 0x5a] },
  { name: "Linux ELF Executable", bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { name: "Java Class / Mach-O Binary", bytes: [0xca, 0xfe, 0xba, 0xbe] },
];

/**
 * Validates the file buffer against magic byte signatures.
 * Returns { valid: true } if matching or { valid: false, error: string } if invalid.
 */
export function validateFileSignature(
  buffer: Buffer,
  extension: string
): { valid: boolean; detectedType?: string; error?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: "Empty or corrupted file buffer." };
  }

  const ext = extension.toLowerCase().trim();

  // 1. Check for known dangerous binary signatures
  for (const dangerous of DANGEROUS_SIGNATURES) {
    let match = true;
    for (let i = 0; i < dangerous.bytes.length; i++) {
      if (buffer[i] !== dangerous.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return {
        valid: false,
        error: `Security violation: File contains executable binary header (${dangerous.name}). Executable uploads are strictly forbidden.`,
      };
    }
  }

  // 2. Check for script injection in initial bytes (e.g. <?php, #!/bin, <script)
  const headerText = buffer.slice(0, 100).toString("utf-8").toLowerCase();
  if (
    headerText.includes("<?php") ||
    headerText.includes("<?=") ||
    headerText.includes("<script") ||
    headerText.includes("#!/bin") ||
    headerText.includes("#!/usr/bin")
  ) {
    return {
      valid: false,
      error: "Security violation: Embedded server-side script or HTML script detected in file header.",
    };
  }

  // 3. Match against declared extension signature whitelist
  const expectedSignatures = MAGIC_SIGNATURES[ext];
  if (!expectedSignatures) {
    return {
      valid: false,
      error: `File extension '${ext}' is not permitted.`,
    };
  }

  const matchesExpected = expectedSignatures.some((sig) => {
    const offset = sig.offset || 0;
    if (buffer.length < offset + sig.bytes.length) return false;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (buffer[offset + i] !== sig.bytes[i]) {
        return false;
      }
    }
    return true;
  });

  if (!matchesExpected) {
    return {
      valid: false,
      error: `File content magic bytes do not match declared extension '${ext}'. Potential file disguise attempt detected.`,
    };
  }

  return { valid: true };
}

/**
 * Generates a safe, non-executable, cryptographically random file name.
 * Strips directory traversal (../), null bytes, and secondary extensions (e.g., shell.php.pdf -> <hash>.pdf).
 */
export function generateSafeFileName(
  originalFileName: string,
  allowedExtension: string
): { safeFileName: string; sanitizedOriginalName: string } {
  const cleanExt = allowedExtension.toLowerCase().replace(/[^a-z0-9.]/g, "");
  
  // Extract basename without any directory components or null bytes
  const baseName = path.basename(originalFileName).replace(/[\0\x08\x09\x1a\r\n\\/:*?"<>|]/g, "");
  const sanitizedOriginalName = baseName.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 150);

  // Generate cryptographically secure unique storage name
  const randomHash = crypto.randomBytes(16).toString("hex");
  const safeFileName = `upload_${Date.now()}_${randomHash}${cleanExt}`;

  return { safeFileName, sanitizedOriginalName };
}
