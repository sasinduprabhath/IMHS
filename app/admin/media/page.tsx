import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MediaCMSClient } from "@/components/admin/MediaCMSClient";

export const metadata = {
  title: "Media & Gallery CMS | Admin - IMHS",
  description: "Manage homepage video highlights, YouTube links, campus photos, and gallery videos.",
};

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <MediaCMSClient />
    </div>
  );
}
