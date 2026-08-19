import { encryptField, decryptField, isEncrypted, hashBlindIndex } from "../lib/encryption";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING AES-256-GCM FIELD-LEVEL ENCRYPTION AT REST");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Basic Encryption & Decryption
  const originalSecret = "Patient notes: Severe allergy to penicillin, requires alternative cephalosporin.";
  const encrypted = encryptField(originalSecret);
  assert(encrypted !== null && isEncrypted(encrypted), "Encrypts string and applies 'enc:v1:' prefix");
  assert(encrypted !== originalSecret, "Ciphertext is not equal to plaintext");

  const decrypted = decryptField(encrypted);
  assert(decrypted === originalSecret, "Decrypted text exactly matches original plaintext");

  // 2. Handling null, undefined, and empty values
  assert(encryptField(null) === null, "encryptField(null) returns null");
  assert(encryptField(undefined) === null, "encryptField(undefined) returns null");
  assert(encryptField("") === "", "encryptField('') returns empty string");
  assert(decryptField(null) === null, "decryptField(null) returns null");
  assert(decryptField(undefined) === null, "decryptField(undefined) returns null");

  // 3. Double Encryption Prevention
  const doubleEncrypted = encryptField(encrypted);
  assert(doubleEncrypted === encrypted, "Prevent double encryption on already encrypted text");

  // 4. Backwards compatibility with Legacy Plaintext Data
  const legacyPlaintext = "Legacy patient notes created before encryption was enabled";
  const decryptedLegacy = decryptField(legacyPlaintext);
  assert(decryptedLegacy === legacyPlaintext, "Legacy plaintext records pass through decryptField without error");

  // 5. Tamper Resistance / Authenticated Tag Verification
  if (encrypted) {
    const parts = encrypted.split(":");
    // Tamper with ciphertext by altering last byte
    const tamperedParts = [...parts];
    const originalHex = tamperedParts[3];
    const tamperedHex = originalHex.slice(0, -2) + (originalHex.slice(-2) === "00" ? "ff" : "00");
    tamperedParts[3] = tamperedHex;
    const tamperedCiphertext = tamperedParts.join(":");

    const tamperedDecryption = decryptField(tamperedCiphertext);
    assert(
      tamperedDecryption === "[Encrypted Content - Decryption Failed]",
      "Tampered ciphertext is rejected by GCM authentication tag"
    );
  }

  // 6. Blind Indexing for searchability
  const phoneA = "+94 77 123 4567";
  const phoneB = "+94 77 123 4567";
  const phoneC = "+94 71 999 8888";
  const hashA = hashBlindIndex(phoneA);
  const hashB = hashBlindIndex(phoneB);
  const hashC = hashBlindIndex(phoneC);
  assert(hashA === hashB, "Identical sensitive values yield identical blind index hashes");
  assert(hashA !== hashC, "Distinct sensitive values yield distinct blind index hashes");

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
