import React from "react";
import { prisma } from "@/lib/prisma";
import { StudentDirectoryClient } from "@/components/admin/StudentDirectoryClient";

export const metadata = {
  title: "Student Directory - IMHS Admin",
};

export const revalidate = 0;

export default async function AdminStudentsDirectoryPage() {
  const rawStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
      progress: {
        select: { lessonId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const students = rawStudents.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    createdAt: s.createdAt.toISOString(),
    enrollments: s.enrollments,
    progress: s.progress,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-chart-grid pb-4">
        <span className="font-mono text-xs text-chart-red uppercase font-semibold">
          DIRECTORY MANAGEMENT
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Enrolled Student Directory
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Manage student accounts, course enrollments, password resets, and WhatsApp links.
        </p>
      </div>

      <StudentDirectoryClient initialStudents={students} />
    </div>
  );
}
