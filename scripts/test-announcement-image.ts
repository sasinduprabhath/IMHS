import { prisma } from "@/lib/prisma";

async function testAnnouncementImage() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING ANNOUNCEMENTS WITH IMAGE SUPPORT");
  console.log("==========================================================");

  // Find any existing course to test with
  let course = await prisma.course.findFirst();
  let createdCourse = false;

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Test Course for Announcements",
        slug: "test-course-" + Date.now(),
        description: "Test description",
      },
    });
    createdCourse = true;
  }

  try {
    const testImageUrl = "/uploads/announcements/test_timetable_banner.png";
    const testTitle = "📢 Batch 12 Examination Timetable Release";
    const testContent = "Dear students, please find attached the official timetable schedule.";

    // 1. Create announcement with image
    const announcement = await prisma.courseAnnouncement.create({
      data: {
        courseId: course.id,
        title: testTitle,
        content: testContent,
        imageUrl: testImageUrl,
      },
    });

    console.log(`Created announcement: id=${announcement.id}`);
    console.log(`Image URL stored: ${announcement.imageUrl}`);

    if (announcement.imageUrl !== testImageUrl) {
      throw new Error(`Expected imageUrl to be ${testImageUrl}, got ${announcement.imageUrl}`);
    }
    console.log("✅ PASS: Announcement created with image URL successfully!");

    // 2. Fetch course with announcements
    const fetchedCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        announcements: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const found = fetchedCourse?.announcements.find((a) => a.id === announcement.id);
    if (!found || found.imageUrl !== testImageUrl) {
      throw new Error("Failed to retrieve announcement with image from course query");
    }
    console.log("✅ PASS: Course query includes announcements with imageUrl!");

    // 3. Delete announcement
    await prisma.courseAnnouncement.delete({
      where: { id: announcement.id },
    });
    console.log("✅ PASS: Announcement deleted cleanly!");

    console.log("==========================================================");
    console.log(" 🏁 ANNOUNCEMENT IMAGE SUPPORT TEST PASSED!");
    console.log("==========================================================");
  } finally {
    if (createdCourse && course) {
      await prisma.course.delete({ where: { id: course.id } });
    }
  }
}

testAnnouncementImage()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
