import { spawnSync } from "child_process";

const testSuites = [
  { name: "SEO & Local Asset Routing", script: "scripts/test-seo.ts" },
  { name: "HTTPS Enforcement & Security Headers", script: "scripts/test-security-headers.ts" },
  { name: "File Upload & Magic Byte Validation", script: "scripts/test-file-upload.ts" },
  { name: "Security Logger & Secret Redaction", script: "scripts/test-logger.ts" },
  { name: "Input Validation & Sanitization", script: "scripts/test-validation.ts" },
  { name: "Server-Side Rate Limiting", script: "scripts/test-rate-limit.ts" },
  { name: "AES-256-GCM Field Encryption", script: "scripts/test-encryption.ts" },
];

console.log("================================================================================");
console.log(" 🚀 RUNNING COMPLETE IMHS SECURITY & ARCHITECTURE TEST SUITE");
console.log("================================================================================\n");

let allPassed = true;
let totalPassed = 0;
let totalFailed = 0;

for (const suite of testSuites) {
  console.log(`▶ Running Suite: ${suite.name} (${suite.script})`);
  const result = spawnSync("npx", ["tsx", suite.script], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status === 0) {
    console.log(`✅ Suite Passed: ${suite.name}\n`);
    totalPassed++;
  } else {
    console.error(`❌ Suite Failed: ${suite.name}\n`);
    totalFailed++;
    allPassed = false;
  }
}

console.log("================================================================================");
console.log(` 🏁 FINAL SUMMARY: ${totalPassed} suites passed, ${totalFailed} suites failed`);
console.log("================================================================================");

if (!allPassed) {
  process.exit(1);
}
