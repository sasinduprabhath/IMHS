import fs from "fs";
import path from "path";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING HTTPS ENFORCEMENT & STANDARD SECURITY HEADERS");
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

  // Read next.config.mjs content
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");

  // Read middleware.ts content
  const middlewarePath = path.join(process.cwd(), "middleware.ts");
  const middlewareContent = fs.readFileSync(middlewarePath, "utf8");

  // 1. Strict-Transport-Security (HSTS)
  assert(
    nextConfigContent.includes("Strict-Transport-Security") &&
      nextConfigContent.includes("max-age=63072000; includeSubDomains; preload"),
    "HSTS header configured with 2-year max-age, includeSubDomains, and preload"
  );

  // 2. Content-Security-Policy (CSP)
  assert(
    nextConfigContent.includes("Content-Security-Policy") &&
      nextConfigContent.includes("default-src 'self'"),
    "Content-Security-Policy configured with default-src 'self'"
  );

  // 3. upgrade-insecure-requests in CSP
  assert(
    nextConfigContent.includes("upgrade-insecure-requests"),
    "CSP includes 'upgrade-insecure-requests' to auto-upgrade any insecure assets"
  );

  // 4. X-Frame-Options
  assert(
    nextConfigContent.includes("X-Frame-Options") &&
      nextConfigContent.includes("SAMEORIGIN"),
    "X-Frame-Options configured as SAMEORIGIN (prevents Clickjacking)"
  );

  // 5. X-Content-Type-Options
  assert(
    nextConfigContent.includes("X-Content-Type-Options") &&
      nextConfigContent.includes("nosniff"),
    "X-Content-Type-Options configured as nosniff (prevents MIME confusion)"
  );

  // 6. Referrer-Policy
  assert(
    nextConfigContent.includes("Referrer-Policy") &&
      nextConfigContent.includes("strict-origin-when-cross-origin"),
    "Referrer-Policy configured as strict-origin-when-cross-origin"
  );

  // 7. Permissions-Policy
  assert(
    nextConfigContent.includes("Permissions-Policy") &&
      nextConfigContent.includes("camera=(), microphone=(), geolocation=(), interest-cohort=()"),
    "Permissions-Policy configured restricting unused hardware/APIs"
  );

  // 8. X-XSS-Protection
  assert(
    nextConfigContent.includes("X-XSS-Protection") &&
      nextConfigContent.includes("1; mode=block"),
    "X-XSS-Protection configured as '1; mode=block'"
  );

  // 9. Uploads Sandbox CSP
  assert(
    nextConfigContent.includes("/uploads/:path*") &&
      nextConfigContent.includes("default-src 'none'; sandbox"),
    "Uploads route (/uploads/:path*) has sandbox CSP preventing script execution"
  );

  // 10. Zero insecure http:// image domains in next.config.mjs
  const hasHttpImageDomain = /protocol:\s*["']http["']/i.test(nextConfigContent);
  assert(!hasHttpImageDomain, "All image remotePatterns enforce HTTPS only (zero http: protocols)");

  // 11. Middleware HTTP to HTTPS Redirection
  assert(
    middlewareContent.includes("x-forwarded-proto") &&
      middlewareContent.includes("https://") &&
      middlewareContent.includes("301"),
    "Middleware enforces 301 Permanent Redirect from HTTP to HTTPS based on x-forwarded-proto"
  );

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
