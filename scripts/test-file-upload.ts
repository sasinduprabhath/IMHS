// scripts/test-file-upload.ts
// Test suite for file upload security, magic byte validation, and size constraints

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (mimeType === "application/pdf") {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  // JPEG signature: 0xFF 0xD8 0xFF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG signature: 0x89 0x50 0x4E 0x47
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WebP signature: RIFF....WEBP
  if (mimeType === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

function runUploadSecurityTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING FILE UPLOAD SECURITY & MAGIC BYTE VALIDATION");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(` ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Test 1: Valid PDF Magic Bytes
  const validPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
  assert(validateMagicBytes(validPdf, "application/pdf"), "Valid PDF header (%PDF) is accepted");

  // Test 2: Valid JPEG Magic Bytes
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert(validateMagicBytes(validJpeg, "image/jpeg"), "Valid JPEG header (0xFFD8FF) is accepted");

  // Test 3: Valid PNG Magic Bytes
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert(validateMagicBytes(validPng, "image/png"), "Valid PNG header (0x89PNG) is accepted");

  // Test 4: Executable pretending to be PDF (Magic Byte spoofing attack)
  const fakePdf = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // Windows PE/EXE header "MZ"
  assert(!validateMagicBytes(fakePdf, "application/pdf"), "Executable file renamed to .pdf is rejected by magic bytes");

  // Test 5: PHP Script pretending to be JPEG
  const fakeJpeg = Buffer.from("<?php echo 'malicious'; ?>", "utf8");
  assert(!validateMagicBytes(fakeJpeg, "image/jpeg"), "PHP script renamed to .jpg is rejected by magic bytes");

  // Test 6: HTML / SVG XSS payload pretending to be PNG
  const fakePng = Buffer.from("<svg onload=alert(1)>", "utf8");
  assert(!validateMagicBytes(fakePng, "image/png"), "SVG XSS file renamed to .png is rejected");

  // Test 7: MIME type whitelist check
  assert(ALLOWED_MIME_TYPES.has("application/pdf"), "PDF is in allowed MIME types");
  assert(ALLOWED_MIME_TYPES.has("image/jpeg"), "JPEG is in allowed MIME types");
  assert(ALLOWED_MIME_TYPES.has("image/png"), "PNG is in allowed MIME types");
  assert(ALLOWED_MIME_TYPES.has("image/webp"), "WebP is in allowed MIME types");
  assert(!ALLOWED_MIME_TYPES.has("application/x-msdownload"), "EXE is rejected by MIME whitelist");
  assert(!ALLOWED_MIME_TYPES.has("application/x-sh"), "Shell script is rejected by MIME whitelist");
  assert(!ALLOWED_MIME_TYPES.has("text/html"), "HTML is rejected by MIME whitelist");

  // Test 8: File size enforcement
  const validSize = 5 * 1024 * 1024; // 5 MB
  const oversized = 15 * 1024 * 1024; // 15 MB
  assert(validSize <= MAX_FILE_SIZE_BYTES, "5 MB file is within 10 MB limit");
  assert(oversized > MAX_FILE_SIZE_BYTES, "15 MB file exceeds 10 MB limit");

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) process.exit(1);
}

runUploadSecurityTests();
