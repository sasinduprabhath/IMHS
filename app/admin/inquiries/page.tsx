import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminInquiriesClient } from "@/components/admin/AdminInquiriesClient";

export const metadata = {
  title: "Contact Form Submissions & Inquiries — IMHS Admin",
};

export const revalidate = 0;

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminInquiriesClient initialInquiries={inquiries} />
    </div>
  );
}
