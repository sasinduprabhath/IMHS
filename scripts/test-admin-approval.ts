import { NextRequest } from "next/server";
import { POST as preLoginHandler } from "@/app/api/auth/pre-login/route";
import { POST as verifyOtpHandler } from "@/app/api/auth/verify-otp/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

async function run() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING INSTANT ADMIN APPROVAL & OTP BYPASS");
  console.log("==========================================================");

  const testEmail = "test_device_approval_" + Date.now() + "@imhsedu.com";
  const password = "TestPassword123!";
  const passwordHash = await bcrypt.hash(password, 10);
  const testDevUuid = "dev_test_" + Date.now();
  const testDevHash = "hash_" + Date.now();

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Test Approval Student",
      passwordHash: passwordHash,
      role: "STUDENT",
      phone: "0771234567",
      studentId: "IMHS-TEST-001",
    },
  });

  try {
    // 1. Initial pre-login from new device -> should return OTP_SENT and create PENDING device
    const preLoginReq1 = new NextRequest("http://localhost:3000/api/auth/pre-login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password,
        deviceUuid: testDevUuid,
        deviceSignature: testDevHash,
        deviceInfo: "Test Device",
      }),
    });

    const preLoginRes1 = await preLoginHandler(preLoginReq1);
    const preLoginData1 = await preLoginRes1.json();
    assert(preLoginData1.status === "OTP_SENT", "First pre-login returns OTP_SENT");

    // Check device record in DB
    const devRecord = await prisma.studentDevice.findFirst({
      where: { userId: user.id },
    });
    assert(!!devRecord, "Device record created in DB");
    assert(devRecord?.status === "PENDING", "Device record is in PENDING status");

    // 2. Poll verify-otp while still PENDING -> should return PENDING_APPROVAL
    const verifyPollReq1 = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        pendingUserId: user.id,
        checkAdminApproval: true,
        deviceUuid: testDevUuid,
        deviceSignature: testDevHash,
      }),
    });

    const verifyPollRes1 = await verifyOtpHandler(verifyPollReq1);
    const verifyPollData1 = await verifyPollRes1.json();
    assert(verifyPollData1.status === "PENDING_APPROVAL", "verify-otp returns PENDING_APPROVAL when device is pending");

    // 3. Admin clicks "Approve" -> simulates PATCH /api/admin/students/[id]/devices
    await prisma.studentDevice.update({
      where: { id: devRecord!.id },
      data: { status: "ALLOWED" },
    });

    // 4. Poll verify-otp after Admin Approval -> should return SUCCESS with verifiedToken immediately!
    const verifyPollReq2 = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        pendingUserId: user.id,
        checkAdminApproval: true,
        deviceUuid: testDevUuid,
        deviceSignature: testDevHash,
      }),
    });

    const verifyPollRes2 = await verifyOtpHandler(verifyPollReq2);
    const verifyPollData2 = await verifyPollRes2.json();
    assert(verifyPollData2.status === "SUCCESS", "verify-otp returns SUCCESS after admin approves device");
    assert(verifyPollData2.adminApproved === true, "adminApproved flag is true");
    assert(!!verifyPollData2.verifiedToken, "verifiedToken is returned for NextAuth login");

    // Check cookies were set on response
    const cookiesHeader = verifyPollRes2.headers.get("set-cookie") || "";
    assert(cookiesHeader.includes("imhs_trusted_device"), "Sets 30-day trusted device cookie on response");

    // 5. Subsequent pre-login with password -> should return TRUSTED_DEVICE_BYPASS directly without OTP!
    const preLoginReq2 = new NextRequest("http://localhost:3000/api/auth/pre-login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password,
        deviceUuid: testDevUuid,
        deviceSignature: testDevHash,
        deviceInfo: "Test Device",
      }),
    });

    const preLoginRes2 = await preLoginHandler(preLoginReq2);
    const preLoginData2 = await preLoginRes2.json();
    assert(preLoginData2.status === "TRUSTED_DEVICE_BYPASS", "pre-login returns TRUSTED_DEVICE_BYPASS for approved device");
    assert(!!preLoginData2.verifiedToken, "verifiedToken provided for direct bypass login");

    console.log("==========================================================");
    console.log(" 🏁 ALL ADMIN APPROVAL & BYPASS TESTS PASSED!");
    console.log("==========================================================");

  } finally {
    // Cleanup test data
    await prisma.studentDevice.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
