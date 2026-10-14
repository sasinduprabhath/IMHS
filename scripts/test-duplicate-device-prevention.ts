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
  console.log(" 🧪 TESTING DUPLICATE DEVICE PREVENTION & RESOLUTION");
  console.log("==========================================================");

  const testEmail = "test_dup_device_" + Date.now() + "@imhsedu.com";
  const password = "TestPassword123!";
  const passwordHash = await bcrypt.hash(password, 10);
  const physicalDeviceInfo = "Windows PC · Chrome (1080×1920)";
  const hardwareHash = "hardware_hash_stable_" + Date.now();
  const uuid1 = "dev_uuid_1_" + Date.now();
  const uuid2 = "dev_uuid_2_" + Date.now(); // Simulated lost cookie / new UUID on same machine

  // 1. Create student
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Test Duplicate Device Student",
      passwordHash: passwordHash,
      role: "STUDENT",
      phone: "0771122334",
      studentId: "IMHS-DUP-001",
    },
  });

  try {
    // 2. First login attempt with uuid1
    const req1 = new NextRequest("http://localhost:3000/api/auth/pre-login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password,
        deviceUuid: uuid1,
        deviceSignature: hardwareHash,
        deviceInfo: physicalDeviceInfo,
      }),
    });
    const res1 = await preLoginHandler(req1);
    const data1 = await res1.json();
    assert(data1.status === "OTP_SENT", "First login generates OTP_SENT");

    // Approve the device
    const pendingDev1 = await prisma.studentDevice.findFirst({
      where: { userId: user.id },
    });
    assert(!!pendingDev1, "Pending device 1 created");
    await prisma.studentDevice.update({
      where: { id: pendingDev1!.id },
      data: { status: "PRIMARY" },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { deviceSignature: uuid1 },
    });

    // 3. Simulate cookie cleared or host switch: incoming has new uuid2, but identical physicalDeviceInfo and hardwareHash
    const req2 = new NextRequest("http://localhost:3000/api/auth/pre-login", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password,
        deviceUuid: uuid2,
        deviceSignature: hardwareHash,
        deviceInfo: physicalDeviceInfo,
      }),
    });
    const res2 = await preLoginHandler(req2);
    const data2 = await res2.json();
    
    // Crucial: It must NOT be DEVICE_LOCKED!
    assert(data2.status !== "DEVICE_LOCKED", "Same physical device is NOT blocked by 2-device limit");
    console.log(`Pre-login response with new UUID for same machine: ${data2.status}`);

    // Check devices count in DB
    const allDevs = await prisma.studentDevice.findMany({
      where: { userId: user.id },
    });
    console.log(`Student devices count in DB: ${allDevs.length}`);

    // 4. Now simulate verifying OTP with uuid2 on the same physical machine
    // Fetch active OTP from user record
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    const code = updatedUser?.twoFactorCode;

    if (code) {
      const verifyReq = new NextRequest("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          code,
          deviceUuid: uuid2,
          deviceSignature: hardwareHash,
          deviceInfo: physicalDeviceInfo,
          trustDevice: true,
        }),
      });
      const verifyRes = await verifyOtpHandler(verifyReq);
      const verifyData = await verifyRes.json();
      assert(verifyData.status === "SUCCESS", "OTP verify succeeded");

      // Verify that after OTP, we STILL only have ONE approved device record for this physical machine!
      const approvedDevs = await prisma.studentDevice.findMany({
        where: { userId: user.id, status: { in: ["PRIMARY", "ALLOWED"] } },
      });
      console.log(`Approved devices count after OTP: ${approvedDevs.length}`);
      assert(approvedDevs.length === 1, "Exactly 1 approved device entity exists (no duplicate created!)");
      assert(approvedDevs[0].deviceSignature === uuid2, "Existing device record was re-bound to current UUID");
    }

    console.log("==========================================================");
    console.log(" 🏁 DUPLICATE DEVICE PREVENTION TEST PASSED SUCCESSFULLY!");
    console.log("==========================================================");
  } finally {
    // Cleanup test student
    await prisma.studentDevice.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

run()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
