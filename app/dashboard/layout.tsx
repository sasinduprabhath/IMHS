import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { AISupportChat } from "@/components/student/AISupportChat";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-row font-sans"
      style={{ background: "linear-gradient(160deg, #F0F5FB 0%, #F8FAFC 40%, #ffffff 100%)" }}>
      {/* Left Sidebar */}
      <StudentSidebar user={session.user} />

      {/* Main content area */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* AI Support Chatbot - floats over entire dashboard */}
      <AISupportChat />
    </div>
  );
}
