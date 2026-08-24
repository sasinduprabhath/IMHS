import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminChatClient } from "@/components/admin/AdminChatClient";

export const metadata = {
  title: "Student Direct Chat | Admin Desk - IMHS",
  description: "Live student direct chat management desk.",
};

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  const { studentId } = await searchParams;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <AdminChatClient
        adminUser={session.user as any}
        initialStudentId={studentId}
      />
    </div>
  );
}
