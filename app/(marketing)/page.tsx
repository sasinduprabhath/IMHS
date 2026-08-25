import React from "react";
import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/marketing/HomePageClient";

export const revalidate = 60;

export const metadata = {
  title: "IMHS - Institute of Medicine and Health Sciences",
  description:
    "IMHS (Institute of Medicine & Health Sciences) - est. 2019. Professional pharmaceutical and clinical healthcare education for SLMC candidates, pharmacy graduates, and healthcare professionals in Sri Lanka.",
};

export default async function Homepage() {
  let courses: any[] = [];
  let faculty: any[] = [];
  let testimonials: any[] = [];
  let achievements: any[] = [];
  let galleryItems: any[] = [];

  try {
    const [cList, fList, tList, aList, gList] = await Promise.all([
      prisma.course.findMany({
        where: { published: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.facultyMember.findMany({
        where: { name: { contains: "Isuru" } },
        take: 3,
        orderBy: { order: "asc" },
      }),
      prisma.testimonial.findMany({
        where: { featured: true },
        take: 3,
      }),
      prisma.achievementHighlight.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.galleryItem.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 8,
      }),
    ]);
    courses = cList;
    faculty = fList;
    testimonials = tList;
    achievements = aList;
    galleryItems = gList;
  } catch (error) {
    console.error("Homepage DB connection error (MySQL):", error);
  }

  return (
    <HomePageClient
      courses={courses}
      faculty={faculty}
      testimonials={testimonials}
      achievements={achievements}
      galleryItems={galleryItems}
    />
  );
}
