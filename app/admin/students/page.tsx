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
    studentId: s.studentId || `IWPH-${s.id.slice(0, 6)}`,
    name: s.name,
    email: s.email,
    phone: s.phone,
    createdAt: s.createdAt.toISOString(),
    enrollments: s.enrollments,
    progress: s.progress,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-5">
        <span className="font-mono text-[10px] text-[#F16726] uppercase font-bold tracking-widest">
          DIRECTORY MANAGEMENT
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-0.5">
          Enrolled Student Directory
        </h1>
        <p className="text-sm text-ink-muted mt-1 font-sans">
          Manage student accounts, course enrollments, password resets, and WhatsApp links.
        </p>
      </div>

      <StudentDirectoryClient initialStudents={students} />
    </div>
  );
}
