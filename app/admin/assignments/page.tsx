import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminAssignmentsClient } from "@/components/admin/AdminAssignmentsClient";

export const metadata = {
  title: "Assignments & Grading - IMHS Admin Console",
};

export default async function AdminAssignmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });

  return <AdminAssignmentsClient courses={courses} />;
}
