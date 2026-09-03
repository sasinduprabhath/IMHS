import { prisma } from "../lib/prisma";

const DEFAULT_ACHIEVEMENTS = [
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
];

const DEFAULT_GALLERY = [
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
];

async function seed() {
  console.log("=== SEEDING MEDIA CMS (ACHIEVEMENTS & GALLERY) ===");

  const achievementCount = await prisma.achievementHighlight.count();
  if (achievementCount === 0) {
    for (const item of DEFAULT_ACHIEVEMENTS) {
      await prisma.achievementHighlight.create({ data: item });
    }
    console.log(`✅ Seeded ${DEFAULT_ACHIEVEMENTS.length} Achievement Highlights.`);
  } else {
    console.log(`ℹ️ Achievement Highlights already exist (${achievementCount} records).`);
  }

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    for (const item of DEFAULT_GALLERY) {
      await prisma.galleryItem.create({ data: item });
    }
    console.log(`✅ Seeded ${DEFAULT_GALLERY.length} Gallery Items.`);
  } else {
    console.log(`ℹ️ Gallery Items already exist (${galleryCount} records).`);
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
