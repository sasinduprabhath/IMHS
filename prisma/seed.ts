import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with IMHS production data...");

  // Clean existing tables
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.facultyMember.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.user.deleteMany({});

  // Password hash for seed users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      name: "IMHS System Administrator",
      email: "admin@imhs.edu.lk",
      phone: "+94778025050",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Student Users
  const student1 = await prisma.user.create({
    data: {
      name: "Dr. Kasun Fernando",
      email: "kasun.fernando@example.com",
      phone: "+94771234567",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Nimali Perera",
      email: "nimali.perera@example.com",
      phone: "+94779876543",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });

  // Faculty Members
  await prisma.facultyMember.createMany({
    data: [
      {
        name: "Dr. Isuru Wijesinghe",
        title: "Senior Lecturer & Executive Director",
        bio: "Ph.D. in Pharmaceutical Sciences, MSc, B.Pharm. Over 15 years of academic lecturing and clinical pharmacy research leadership in Sri Lanka.",
        photoUrl: "/isuru.png",
        order: 1,
      },
      {
        name: "Prof. Chaminda Silva",
        title: "Consultant Clinical Pathologist",
        bio: "MBBS, MD (Pathology). Senior consultant at Teaching Hospital Colombo with expertise in diagnostic hematology and clinical biochemistry.",
        photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
        order: 2,
      },
      {
        name: "Dr. Anusha De Silva",
        title: "Senior Pharmaceutical Manufacturing Director",
        bio: "B.Pharm, M.Phil, Specialist in Good Manufacturing Practice (GMP), Cleanroom Validation, and Industrial Quality Assurance.",
        photoUrl: "https://images.unsplash.com/photo-1594824813566-88855ce78907?w=400&auto=format&fit=crop&q=80",
        order: 3,
      },
    ],
  });

  // Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        studentName: "Amila Wickramasinghe",
        courseTaken: "Modern Pharmacy Course (SLMC Prep)",
        quote: "The SLMC exam preparation module at IMHS was instrumental in helping me pass on my first attempt. The video lectures and revision guide PDFs were invaluable.",
        featured: true,
      },
      {
        studentName: "Dilini Jayawardena",
        courseTaken: "Advanced Certificate in Pharmaceutical Manufacturing",
        quote: "Direct insights into industrial GMP and quality control protocols from active plant managers. Highly recommended for pharmacy graduates.",
        featured: true,
      },
      {
        studentName: "Sahan Jayasooriya",
        courseTaken: "Diploma in Healthcare & MLT",
        quote: "The practical laboratory workflow lessons prepared me for senior technician roles at leading private hospital networks.",
        featured: true,
      },
    ],
  });

  // Create Real Courses (from imhsedu.com catalog)
  const course1 = await prisma.course.create({
    data: {
      title: "Modern Pharmacy Course (SLMC Registration Prep)",
      slug: "med-101-modern-pharmacy",
      description: "Comprehensive professional preparation for SLMC Registration in Modern Pharmacy, pharmaceutical chemistry, drug dispensing, and community healthcare practice.",
      price: 45000.0,
      originalPrice: 65000.0,
      type: "Course",
      category: "Modern Pharmacy Course",
      level: "Intermediate",
      enrollmentValidity: "Lifetime Access",
      totalEnrolled: 1250,
      published: true,
      coverImage: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80",
      chapters: {
        create: [
          {
            title: "Chapter 1: Pharmaceutical Chemistry & Drug Classification",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1.1 Fundamentals of Pharmacology & Drug Actions",
                  order: 1,
                  type: "VIDEO",
                  vimeoVideoId: "76979871",
                  driveFileId: "11A_Pharmacy_Basics_Guide.pdf",
                  content: "Detailed breakdown of therapeutic drug classes, pharmacokinetics, pharmacodynamics, and prescription verification protocols.",
                },
                {
                  title: "1.2 SLMC Examination Preparation & Ethics (PDF / Presentation)",
                  order: 2,
                  type: "DOCUMENT",
                  vimeoVideoId: null,
                  driveFileId: "11B_SLMC_Pharmacy_Code.pdf",
                  content: "Review of Sri Lanka Medical Council (SLMC) guidelines, legal responsibilities of registered pharmacists, and poisons regulations.",
                },
              ],
            },
          },
          {
            title: "Chapter 2: Community Pharmacy Practice & Dispensing",
            order: 2,
            lessons: {
              create: [
                {
                  title: "2.1 Prescription Storage & Controlled Substances (Presentation Deck)",
                  order: 1,
                  type: "DOCUMENT",
                  vimeoVideoId: null,
                  driveFileId: "12A_Controlled_Drug_Log.pdf",
                  content: "Managing inventory for Schedule III and IV pharmaceuticals, temperature monitoring, and patient counseling protocols.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Advanced Certificate Course in Pharmaceutical Manufacturing",
      slug: "med-102-pharmaceutical-manufacturing",
      description: "Specialized training in industrial pharmaceutical manufacturing, quality assurance (QA/QC), Good Manufacturing Practice (GMP), and formulation technology.",
      price: 52000.0,
      originalPrice: 75000.0,
      type: "Course",
      category: "Pharmaceutical Manufacturing",
      level: "Expert",
      enrollmentValidity: "Lifetime Access",
      totalEnrolled: 820,
      published: true,
      coverImage: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=80",
      chapters: {
        create: [
          {
            title: "Chapter 1: Industrial GMP & Quality Control",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1.1 Good Manufacturing Practice (GMP) Standards",
                  order: 1,
                  vimeoVideoId: "824804225",
                  driveFileId: "21A_GMP_Industrial_Checklist.pdf",
                  content: "Cleanroom classification, sterile processing, environmental monitoring, and batch processing documentation.",
                },
                {
                  title: "1.2 Tablet Compression & Liquid Formulations",
                  order: 2,
                  vimeoVideoId: "824804225",
                  driveFileId: "21B_Formulation_Tech_Manual.pdf",
                  content: "Granulation methods, tablet coating techniques, dissolution testing, and stability testing guidelines.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Foundation Course on Pharmaceutical Science & Healthcare",
      slug: "med-103-pharmaceutical-science",
      description: "Foundational entry-level program covering essential biology, physiology, basic pharmacology, and healthcare administration for students starting health science careers.",
      price: 38000.0,
      originalPrice: 50000.0,
      type: "Course",
      category: "Foundation & Science",
      level: "Beginner",
      enrollmentValidity: "1 Year Access",
      totalEnrolled: 640,
      published: true,
      coverImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
      chapters: {
        create: [
          {
            title: "Chapter 1: Human Anatomy & Health Fundamentals",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1.1 Basic Physiology & Pathophysiology Overview",
                  order: 1,
                  vimeoVideoId: "76979871",
                  driveFileId: "31A_Anatomy_Basics.pdf",
                  content: "Introduction to major organ systems, circulatory mechanics, and baseline metabolic indicators.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: "Diploma in Healthcare & Medical Laboratory Technology",
      slug: "med-104-diploma-healthcare",
      description: "Advanced diploma covering diagnostic hematology, clinical biochemistry, microbiology laboratory skills, and healthcare facility management.",
      price: 60000.0,
      originalPrice: 85000.0,
      type: "Bundle",
      category: "Healthcare & MLT Diploma",
      level: "All Levels",
      enrollmentValidity: "Lifetime Access",
      totalEnrolled: 790,
      published: true,
      coverImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
      chapters: {
        create: [
          {
            title: "Chapter 1: Diagnostic Hematology & Biochemistry",
            order: 1,
            lessons: {
              create: [
                {
                  title: "1.1 Laboratory Diagnostic Workflows",
                  order: 1,
                  vimeoVideoId: "76979871",
                  driveFileId: "41A_Lab_Diagnostics_Guide.pdf",
                  content: "Clinical laboratory specimen handling, blood chemistry analysis, and automated analyzer calibration.",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Enroll student in Course 1 and Course 2
  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course1.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      userId: student1.id,
      courseId: course2.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin login: admin@imhs.edu.lk / admin123");
  console.log("Student login: kasun.fernando@example.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
