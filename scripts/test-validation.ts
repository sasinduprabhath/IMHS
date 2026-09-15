import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeIdentifier,
} from "../lib/sanitization";
import { z } from "zod";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING INPUT SANITIZATION & SERVER VALIDATION");
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

  // 1. String Sanitization & XSS Stripping
  const xssInput = "<script>alert('XSS')</script>Hello <b>World</b><iframe src='bad.site'></iframe>";
  const cleanedText = sanitizeString(xssInput);
  assert(!cleanedText.includes("<script>") && !cleanedText.includes("<iframe") && cleanedText.includes("Hello World"), "Strips script tags, iframe tags, and HTML elements from text");

  // 2. Control Character Stripping
  const maliciousControl = "Admin\0User\x08Payload\x1aTest";
  const cleanedControl = sanitizeString(maliciousControl);
  assert(!cleanedControl.includes("\0") && !cleanedControl.includes("\x08") && !cleanedControl.includes("\x1a"), "Strips null bytes and dangerous control characters");

  // 3. Email Sanitization
  const rawEmail = "  Doctor.John+Test@IMHSEDU.COM  ";
  const cleanEmail = sanitizeEmail(rawEmail);
  assert(cleanEmail === "doctor.john+test@imhsedu.com", "Normalizes, trims, and lowercases email address");

  // 4. Phone Sanitization
  const rawPhone = " +94 (77) 123-4567 ext: 999 <script> ";
  const cleanPhone = sanitizePhone(rawPhone);
  assert(cleanPhone === "+94 (77) 123-4567 999", "Strips non-phone characters and keeps valid telephone formatting");

  // 5. URL Sanitization & Protocol Injection Prevention
  const javascriptUrl = "javascript:alert(document.cookie)";
  const dataUrl = "data:text/html,<script>alert(1)</script>";
  const validHttpsUrl = "https://imhsedu.com/assets/brief.pdf";
  const validRelativeUrl = "/uploads/submissions/assignment-1.pdf";

  assert(sanitizeUrl(javascriptUrl) === null, "Rejects 'javascript:' URL injection");
  assert(sanitizeUrl(dataUrl) === null, "Rejects 'data:' URL injection");
  assert(sanitizeUrl(validHttpsUrl) === "https://imhsedu.com/assets/brief.pdf", "Accepts safe HTTPS URLs");
  assert(sanitizeUrl(validRelativeUrl) === "/uploads/submissions/assignment-1.pdf", "Accepts safe root-relative URLs");

  // 6. Identifier & Slug Sanitization
  const dirtyId = "clx12345' OR '1'='1; -- ";
  const cleanId = sanitizeIdentifier(dirtyId);
  assert(cleanId === "clx12345OR11--", "Strips SQL injection quotes and semicolons from identifiers");

  // 7. Zod Schema Verification: OTP Regex
  const otpSchema = z.string().regex(/^\d{6}$/);
  assert(otpSchema.safeParse("123456").success === true, "Valid 6-digit OTP is accepted");
  assert(otpSchema.safeParse("12345").success === false, "5-digit OTP is rejected");
  assert(otpSchema.safeParse("12345a").success === false, "Alphanumeric OTP is rejected");

  // 8. Zod Schema Verification: Consultation Booking
  const consultationBookingSchema = z.object({
    studentName: z.string().min(1).max(100),
    studentEmail: z.string().email(),
    studentPhone: z.string().min(7).max(30),
    sessionType: z.enum(["MENTORSHIP", "CLINICAL_CONSULTATION", "MOCK_INTERVIEW"]),
  });

  assert(
    consultationBookingSchema.safeParse({
      studentName: "Kasun Perera",
      studentEmail: "kasun@gmail.com",
      studentPhone: "+94771234567",
      sessionType: "CLINICAL_CONSULTATION",
    }).success === true,
    "Valid consultation booking payload is accepted"
  );

  assert(
    consultationBookingSchema.safeParse({
      studentName: "Kasun Perera",
      studentEmail: "invalid-email-format",
      studentPhone: "+94771234567",
      sessionType: "INVALID_SESSION_TYPE",
    }).success === false,
    "Invalid email and illegal session type enum are rejected"
  );

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
