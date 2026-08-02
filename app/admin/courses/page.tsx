import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminCoursesClient } from "@/components/admin/AdminCoursesClient";

export const metadata = {
  title: "Course Manager — IMHS Admin",
};

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        include: { lessons: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminCoursesClient initialCourses={courses} />;
}
