import { prisma } from '../lib/prisma';

async function seedFacultyAndInstructors() {
  console.log("=== SEEDING FACULTY MEMBERS & ASSIGNING INSTRUCTORS TO COURSES ===");

  // 1. Ensure faculty members exist
  const existingFaculty = await prisma.facultyMember.findMany();
  let facultyList = existingFaculty;

  if (facultyList.length === 0) {
    const f1 = await prisma.facultyMember.create({
      data: {
        name: "Dr. Isuru Wijesinghe",
        title: "Senior Clinical Pharmacology Lecturer & SLMC Advisor",
        bio: "Specialist in hospital pharmacy practice, clinical therapeutics, and SLMC licensing examination prep.",
        photoUrl: "/lecturer.jpeg",
        order: 1,
      }
    });

    const f2 = await prisma.facultyMember.create({
      data: {
        name: "Pharm. Anura Dissanayake",
        title: "Chief Community Pharmacist & Dispensing Specialist",
        bio: "Expert in retail pharmacy management, prescription validation, and controlled substance protocols.",
        photoUrl: "/lecturer.jpeg",
        order: 2,
      }
    });

    facultyList = [f1, f2];
    console.log("Created 2 default Faculty Members.");
  }

  // 2. Assign faculty to active courses
  const courses = await prisma.course.findMany({ take: 5 });

  for (const c of courses) {
    for (const f of facultyList) {
      await prisma.courseInstructor.upsert({
        where: {
          courseId_facultyMemberId: {
            courseId: c.id,
            facultyMemberId: f.id,
          }
        },
        create: {
          courseId: c.id,
          facultyMemberId: f.id,
        },
        update: {}
      });
    }
  }

  // 3. Create a sample Announcement
  const sampleCourse = courses[0];
  if (sampleCourse) {
    const existingAnn = await prisma.courseAnnouncement.findFirst({
      where: { courseId: sampleCourse.id }
    });

    if (!existingAnn) {
      await prisma.courseAnnouncement.create({
        data: {
          courseId: sampleCourse.id,
          title: "📢 Batch 12 Live Revision & Q&A Session Schedule",
          content: "Dear Students, live online revision and SLMC mock practice review will be held this Saturday at 7:00 PM via the portal player. Download your lab reference sheets beforehand.",
        }
      });
      console.log(`Created sample Announcement for course "${sampleCourse.title}"`);
    }
  }

  console.log("🎉 SEEDING COMPLETE!");
}

seedFacultyAndInstructors()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
