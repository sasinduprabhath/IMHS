import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseBuilderClient } from "@/components/admin/CourseBuilderClient";

export const metadata = {
  title: "Syllabus & Course Builder - IMHS Admin",
};

export const revalidate = 0;

export default async function AdminCourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CourseBuilderClient course={course} />
    </div>
  );
}
