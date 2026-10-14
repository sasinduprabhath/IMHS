import { prisma } from "@/lib/prisma";

async function cleanupDuplicateDevices() {
  console.log("==========================================================");
  console.log(" 🧹 CLEANING UP DUPLICATE STUDENT DEVICE RECORDS");
  console.log("==========================================================");

  const usersWithDevices = await prisma.user.findMany({
    where: {
      devices: {
        some: {},
      },
    },
    include: {
      devices: {
        orderBy: { lastAttemptAt: "desc" },
      },
    },
  });

  console.log(`Found ${usersWithDevices.length} users with device records.`);

  let totalDeleted = 0;
  let studentsCleaned = 0;

  for (const user of usersWithDevices) {
    const devices = user.devices;
    if (devices.length <= 1) continue;

    // Group devices by normalized physical profile:
    // e.g. "windows pc · chrome (1080×1920)" or normalized deviceInfo
    const profileMap = new Map<string, typeof devices>();

    for (const dev of devices) {
      const key = (dev.deviceInfo || "").trim().toLowerCase();
      if (!key) continue;

      if (!profileMap.has(key)) {
        profileMap.set(key, []);
      }
      profileMap.get(key)!.push(dev);
    }

    let userHadDuplicates = false;

    for (const [profileKey, devList] of profileMap.entries()) {
      if (devList.length > 1) {
        userHadDuplicates = true;
        console.log(`\nUser: ${user.email} (${user.studentId || user.id})`);
        console.log(`  Duplicate physical profile found: "${profileKey}" (${devList.length} records)`);

        // Determine which device to keep:
        // Priority 1: PRIMARY device
        // Priority 2: ALLOWED device with most recent lastAttemptAt
        // Priority 3: First device (most recent)
        let keepDevice = devList.find((d) => d.status === "PRIMARY");
        if (!keepDevice) {
          keepDevice = devList.find((d) => d.status === "ALLOWED") || devList[0];
        }

        console.log(`  -> KEEPING: id=${keepDevice.id}, sig=${keepDevice.deviceSignature}, status=${keepDevice.status}`);

        // Delete all other duplicates in this profile
        const duplicatesToDelete = devList.filter((d) => d.id !== keepDevice!.id);
        for (const dup of duplicatesToDelete) {
          console.log(`  -> DELETING DUPLICATE: id=${dup.id}, sig=${dup.deviceSignature}, status=${dup.status}`);
          await prisma.studentDevice.delete({
            where: { id: dup.id },
          });
          totalDeleted++;
        }

        // If user's deviceSignature was pointing to a deleted record, update to kept device
        if (user.deviceSignature && duplicatesToDelete.some((d) => d.deviceSignature === user.deviceSignature)) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              deviceSignature: keepDevice.deviceSignature,
            },
          });
          console.log(`  -> Updated user.deviceSignature to ${keepDevice.deviceSignature}`);
        }
      }
    }

    if (userHadDuplicates) {
      studentsCleaned++;
    }
  }

  console.log("\n==========================================================");
  console.log(`✅ CLEANUP COMPLETE: Deleted ${totalDeleted} duplicate device records across ${studentsCleaned} students.`);
  console.log("==========================================================");
}

cleanupDuplicateDevices()
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
