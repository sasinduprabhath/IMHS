import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { AISupportChat } from "@/components/student/AISupportChat";
import { DashboardTour } from "@/components/student/DashboardTour";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch tour completion flag for current student
  let hasCompletedTour = true; // safe default: don't show tour if DB fails
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedTour: true },
    });
    hasCompletedTour = dbUser?.hasCompletedTour ?? true;
  } catch {
    // If DB lookup fails, skip tour gracefully
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

      {/* AI Support Chatbot — floats over entire dashboard */}
      <div id="tour-ai-chat">
        <AISupportChat />
      </div>

      {/* First-login onboarding tour (Driver.js) */}
      <DashboardTour shouldRun={!hasCompletedTour} />
    </div>
  );
}
