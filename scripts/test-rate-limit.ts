import { checkRateLimit, rateLimitResponse, getClientIp, RATE_LIMITS } from "../lib/rate-limit";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING SERVER-SIDE RATE LIMITING SYSTEM");
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

  // 1. Throughput within limits
  const testKeyA = `test:userA:${Date.now()}`;
  const maxAttempts = 3;
  const windowMs = 5000;

  const res1 = checkRateLimit(testKeyA, maxAttempts, windowMs);
  assert(res1.success === true && res1.remaining === 2, "First request succeeds with remaining=2");

  const res2 = checkRateLimit(testKeyA, maxAttempts, windowMs);
  assert(res2.success === true && res2.remaining === 1, "Second request succeeds with remaining=1");

  const res3 = checkRateLimit(testKeyA, maxAttempts, windowMs);
  assert(res3.success === true && res3.remaining === 0, "Third request reaches limit boundary (remaining=0)");

  // 2. Exceeding limit triggers block
  const res4 = checkRateLimit(testKeyA, maxAttempts, windowMs);
  assert(res4.success === false && res4.remaining === 0, "Fourth request is blocked (success=false)");

  // 3. Isolated key for different user
  const testKeyB = `test:userB:${Date.now()}`;
  const resB = checkRateLimit(testKeyB, maxAttempts, windowMs);
  assert(resB.success === true && resB.remaining === 2, "Independent user key is not affected by other user's rate limit");

  // 4. Test rateLimitResponse HTTP response formatting
  const httpResponse = rateLimitResponse(res4.resetTime, maxAttempts, 0);
  assert(httpResponse.status === 429, "Rate limit response returns HTTP status 429");
  assert(httpResponse.headers.has("Retry-After"), "Response includes 'Retry-After' header");
  assert(httpResponse.headers.has("X-RateLimit-Reset"), "Response includes 'X-RateLimit-Reset' header");
  assert(httpResponse.headers.get("X-RateLimit-Limit") === maxAttempts.toString(), "Response includes 'X-RateLimit-Limit' header");

  // 5. Test getClientIp extraction
  const mockReqWithCf = {
    headers: new Headers({
      "cf-connecting-ip": "203.0.113.195",
      "x-forwarded-for": "198.51.100.1, 10.0.0.1",
    }),
  };
  assert(getClientIp(mockReqWithCf) === "203.0.113.195", "Extracts Cloudflare CF-Connecting-IP with priority");

  const mockReqWithForwarded = {
    headers: new Headers({
      "x-forwarded-for": "198.51.100.42, 10.0.0.1",
    }),
  };
  assert(getClientIp(mockReqWithForwarded) === "198.51.100.42", "Extracts client IP correctly from X-Forwarded-For list");

  const mockReqEmpty = { headers: new Headers() };
  assert(getClientIp(mockReqEmpty) === "127.0.0.1", "Falls back safely to 127.0.0.1 on missing headers");

  // 6. Test Policy Presets
  assert(RATE_LIMITS.AUTH_ACCOUNT.maxAttempts === 5, "AUTH_ACCOUNT preset configured to 5 attempts");
  assert(RATE_LIMITS.AI_CHAT.maxAttempts === 15, "AI_CHAT preset configured to 15 messages");
  assert(RATE_LIMITS.AI_DRUG_INFO.maxAttempts === 10, "AI_DRUG_INFO preset configured to 10 lookups");
  assert(RATE_LIMITS.FILE_UPLOAD.maxAttempts === 10, "FILE_UPLOAD preset configured to 10 uploads");

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
