import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with IMHS production data...");

  // Clean existing tables
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});
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
      email: "admin@imhsedu.com",
      phone: "+94766506621",
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
        name: "Dr. Isuru Wijesinghe, Ph.D.",
        title: "Senior Lecturer & Executive Director",
        bio: "Dr. Isuru Wijesinghe is an academic and researcher with a Ph.D. and MSc in Pharmaceutical Sciences and a B.Pharm (Special) degree. He brings extensive experience in pharmacy education, pharmaceutical research, and the pharmaceutical industry, with a strong commitment to academic excellence and professional development.",
        photoUrl: "/isuru.png",
        order: 1,
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
      enrollmentValidity: "Batch Intake Access",
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
      enrollmentValidity: "Batch Intake Access",
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
      enrollmentValidity: "Batch Intake Access",
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

  // Create sample assignment brief
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      title: "Clinical Pharmacology Case Study & Dosage Audit",
      description: "Analyze the provided patient case notes. Calculate loading doses, steady-state plasma concentrations, and recommend dosage adjustments for renal insufficiency.",
      attachmentUrl: "https://drive.google.com/file/d/demo_brief.pdf",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxMarks: 100,
      allowLate: true,
      allowedFileTypes: "PDF,DOCX,ZIP",
    },
  });

  // Create graded submission for student1
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      userId: student1.id,
      fileName: "Kasun_Fernando_Pharmacology_CaseStudy.pdf",
      fileUrl: "https://drive.google.com/file/d/demo_student_submission.pdf",
      fileSize: 2450000,
      status: "GRADED",
      score: 92,
      feedback: "Excellent pharmacokinetic calculations. Clear reasoning provided for renal dosage adjustments. Well presented clinical report.",
      gradedAt: new Date(),
      gradedBy: "Dr. Isuru Wijesinghe",
    },
  });

  // Seed Achievement Highlights
  const achCount = await prisma.achievementHighlight.count();
  if (achCount === 0) {
    await prisma.achievementHighlight.createMany({
      data: [
        {
          youtubeId: "TM1nTXW2Ogs",
          title: "IMHS General Convocation & Batch 09 Ceremony Highlights",
          category: "Convocation",
          duration: "12m 08s",
          views: "1.9K+ views",
          thumbnailUrl: "https://img.youtube.com/vi/TM1nTXW2Ogs/hqdefault.jpg",
          description: "Official ceremony and certificate distribution for Batch 09 graduates.",
          order: 1,
          isPublished: true,
        },
        {
          youtubeId: "rGxAPjR18zY",
          title: "IMHS Modern Pharmacy Course - Day 01 Introduction Session",
          category: "Lecture Series",
          duration: "1h 56m",
          views: "1.5K+ views",
          thumbnailUrl: "https://img.youtube.com/vi/rGxAPjR18zY/hqdefault.jpg",
          description: "Introductory session covering modern pharmacology and SLMC prep syllabus.",
          order: 2,
          isPublished: true,
        },
        {
          youtubeId: "05ne6S6vHJE",
          title: "Fast Track Working Plan - External Pharmacist Examination by Dr. Isuru Wijesinghe",
          category: "Exam Guide",
          duration: "6m 12s",
          views: "3.5K+ views",
          thumbnailUrl: "https://img.youtube.com/vi/05ne6S6vHJE/hqdefault.jpg",
          description: "Strategic study guide and timeline breakdown for the Ceylon Medical College Council external pharmacist exam.",
          order: 3,
          isPublished: true,
        },
        {
          youtubeId: "qoIr3ZneT6Y",
          title: "Modern Pharmacy Education - Hypoglycemic Medications Lecture",
          category: "Pharmacology",
          duration: "1h 58m",
          views: "800+ views",
          thumbnailUrl: "https://img.youtube.com/vi/qoIr3ZneT6Y/hqdefault.jpg",
          description: "Clinical lecture on antidiabetic drug classes, mechanism of action, and dispensing tips.",
          order: 4,
          isPublished: true,
        },
        {
          youtubeId: "zNTB_vH8E2E",
          title: "English for Healthcare Professionals & Pharmacy Practice",
          category: "Special Module",
          duration: "2m 41s",
          views: "1.2K+ views",
          thumbnailUrl: "https://img.youtube.com/vi/zNTB_vH8E2E/hqdefault.jpg",
          description: "Professional medical terminology and patient communication workshop preview.",
          order: 5,
          isPublished: true,
        },
      ],
    });
  }

  // Seed Gallery Items
  const galCount = await prisma.galleryItem.count();
  if (galCount === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          type: "VIDEO",
          title: "Practical and Clinical Training Sessions",
          category: "Practicals",
          mediaUrl: "/gallery/gallery-video-1.mp4",
          thumbnailUrl: "/gallery/pharmaceutical-lab.jpg",
          description: "Watch practical demonstrations of pharmaceutical dispensing and essential clinical techniques.",
          tag: "CLINICAL LABS",
          date: "2024",
          order: 1,
          isPublished: true,
        },
        {
          type: "VIDEO",
          title: "Student Convocation and Award Ceremony",
          category: "Convocation",
          mediaUrl: "/gallery/gallery-video-2.mp4",
          thumbnailUrl: "/gallery/graduation-ceremony.webp",
          description: "Highlights from the IMHS General Convocation and student award presentations.",
          tag: "CONVOCATION",
          date: "2024",
          order: 2,
          isPublished: true,
        },
        {
          type: "VIDEO",
          title: "Academic Lectures and Interactive Workshops",
          category: "Workshops",
          mediaUrl: "/gallery/gallery-video-3.mp4",
          thumbnailUrl: "/gallery/pharmacy-practical.jpg",
          description: "Highlights from academic lectures, examination preparation sessions, interactive workshops, and student activities.",
          tag: "WORKSHOPS",
          date: "2024",
          order: 3,
          isPublished: true,
        },
        {
          type: "VIDEO",
          title: "Ceylon Pharma College - A Journey of Excellence (Batch 18)",
          category: "Convocation",
          mediaUrl: "/gallery/convocation-video.mp4",
          thumbnailUrl: "/gallery/convocation-2024.webp",
          description: "Certificate Course in Pharmacy Practice 1st Day inaugural video & graduation honours.",
          tag: "BATCH 18 CONVOCATION",
          date: "2024",
          order: 4,
          isPublished: true,
        },
        {
          type: "PHOTO",
          title: "Annual Convocation Stage & Distinction Honours",
          category: "Convocation",
          mediaUrl: "/gallery/convocation-2024.webp",
          thumbnailUrl: "/gallery/convocation-2024.webp",
          description: "Graduates receiving their higher diplomas and pharmaceutical certifications on stage.",
          tag: "GRADUATION 2024",
          date: "2024",
          order: 5,
          isPublished: true,
        },
        {
          type: "PHOTO",
          title: "Advanced Pharmaceutical Lab & Cleanroom Simulation",
          category: "Labs",
          mediaUrl: "/gallery/pharmaceutical-lab.jpg",
          thumbnailUrl: "/gallery/pharmaceutical-lab.jpg",
          description: "Modern pharmaceutical formulation equipment, sterile preparation stations, and dispensing bays.",
          tag: "SIMULATION LAB",
          date: "2024",
          order: 6,
          isPublished: true,
        },
        {
          type: "PHOTO",
          title: "Clinical Consultation & Interactive Seminar",
          category: "Workshops",
          mediaUrl: "/gallery/faculty-consultation.jpg",
          thumbnailUrl: "/gallery/faculty-consultation.jpg",
          description: "Interactive clinical seminar guided by Dr. Isuru Wijesinghe and senior pharmacology advisors.",
          tag: "SEMINAR",
          date: "2024",
          order: 7,
          isPublished: true,
        },
        {
          type: "PHOTO",
          title: "Pharmacy Practical Dispensing Counter",
          category: "Practicals",
          mediaUrl: "/gallery/pharmacy-practical.jpg",
          thumbnailUrl: "/gallery/pharmacy-practical.jpg",
          description: "Hands-on prescription screening, dosage calculation, and patient counselling training.",
          tag: "PRACTICAL DISPENSING",
          date: "2024",
          order: 8,
          isPublished: true,
        },
      ],
    });
  }

  console.log("Database seeded successfully!");
  console.log("Admin login: admin@imhsedu.com / admin123");
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
