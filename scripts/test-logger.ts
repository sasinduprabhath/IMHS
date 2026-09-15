import { redactSensitiveData, logger } from "../lib/logger";
import fs from "fs";
import path from "path";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING SECURITY LOGGER & ZERO-SECRET-LEAKAGE REDACTOR");
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

  // 1. Password and Hash Redaction
  const userPayload = {
    email: "student@imhsedu.com",
    password: "SuperSecretPassword123!",
    passwordHash: "$2a$12$e8x76df876sdfsdf",
    tempPassword: "TempPass9988!!",
    role: "STUDENT",
  };
  const redactedUser = redactSensitiveData(userPayload);
  assert(redactedUser.password === "***REDACTED***", "Redacts 'password' field");
  assert(redactedUser.passwordHash === "***REDACTED***", "Redacts 'passwordHash' field");
  assert(redactedUser.tempPassword === "***REDACTED***", "Redacts 'tempPassword' field");
  assert(redactedUser.email === "student@imhsedu.com", "Preserves safe fields like 'email'");
  assert(redactedUser.role === "STUDENT", "Preserves safe fields like 'role'");

  // 2. OTP and Verification Token Redaction
  const otpPayload = {
    pendingUserId: "usr_12345",
    otp: "654321",
    otpCode: "$2a$10$hashedOtpCodeHere",
    verifiedToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9",
    deviceSignature: "abc123hexsignature",
  };
  const redactedOtp = redactSensitiveData(otpPayload);
  assert(redactedOtp.otp === "***REDACTED***", "Redacts 'otp' field");
  assert(redactedOtp.otpCode === "***REDACTED***", "Redacts 'otpCode' field");
  assert(redactedOtp.verifiedToken === "***REDACTED***", "Redacts 'verifiedToken' JWT");
  assert(redactedOtp.deviceSignature === "***REDACTED***", "Redacts 'deviceSignature' field");
  assert(redactedOtp.pendingUserId === "usr_12345", "Preserves safe user ID");

  // 3. Authorization Header / Bearer Token Redaction
  const headersPayload = {
    authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token_payload",
    cookie: "next-auth.session-token=secret_cookie_val; imhs_trusted_device=secret_val",
    contentType: "application/json",
  };
  const redactedHeaders = redactSensitiveData(headersPayload);
  assert(redactedHeaders.authorization === "***REDACTED***", "Redacts 'authorization' header");
  assert(redactedHeaders.cookie === "***REDACTED***", "Redacts 'cookie' header");
  assert(redactedHeaders.contentType === "application/json", "Preserves standard headers");

  // 4. Nested Object & Array Deep Redaction
  const nestedPayload = {
    action: "UPDATE_CREDENTIALS",
    user: {
      credentials: {
        currentPassword: "OldPassword1!",
        newPassword: "NewPassword2@",
      },
    },
    meta: [{ secretKey: "sk_live_123456" }],
  };
  const redactedNested = redactSensitiveData(nestedPayload);
  assert(redactedNested.user.credentials.currentPassword === "***REDACTED***", "Redacts deeply nested currentPassword");
  assert(redactedNested.user.credentials.newPassword === "***REDACTED***", "Redacts deeply nested newPassword");
  assert(redactedNested.meta[0].secretKey === "***REDACTED***", "Redacts secretKey in nested array");

  // 5. Test Live Logger Methods
  logger.info("Unit test info log", { testUser: "test@imhsedu.com" });
  logger.warn("Unit test warn log", { warningCode: "WARN_001" });
  logger.security("AUTH_LOGIN_FAILED", "Unit test security alert for failed login", {
    userId: "test-user-id",
    ip: "192.168.1.100",
    details: { attemptedPassword: "WrongPassword!" },
  });
  logger.error("Unit test error log", new Error("Database timeout"), {
    ip: "192.168.1.100",
    data: { apiKey: "secret_api_key" },
  });

  // Give asynchronous file write a moment to flush
  await new Promise((resolve) => setTimeout(resolve, 500));

  const securityLogPath = path.join(process.cwd(), "logs", "security.log");
  const errorLogPath = path.join(process.cwd(), "logs", "error.log");

  assert(fs.existsSync(securityLogPath), "security.log file was created in /logs directory");
  assert(fs.existsSync(errorLogPath), "error.log file was created in /logs directory");

  const securityLogContent = fs.readFileSync(securityLogPath, "utf8");
  assert(securityLogContent.includes("AUTH_LOGIN_FAILED"), "security.log contains recorded security event");
  assert(!securityLogContent.includes("WrongPassword!"), "security.log does NOT contain plaintext password");
  assert(securityLogContent.includes("***REDACTED***"), "security.log contains masked '***REDACTED***' value");

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
