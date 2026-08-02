import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentDetailClient } from "@/components/admin/StudentDetailClient";

export const metadata = {
  title: "Student Profile Detail - IMHS Admin",
};

export const revalidate = 0;

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student, availableCourses] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                chapters: {
                  include: { lessons: true },
                },
              },
            },
          },
        },
        progress: true,
      },
    }),
    prisma.course.findMany({
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  if (!student || student.role !== "STUDENT") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <StudentDetailClient student={student} availableCourses={availableCourses} />
    </div>
  );
}
