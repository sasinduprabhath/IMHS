import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LiveChatBox } from "@/components/chat/LiveChatBox";
import { MessageSquare, ShieldCheck, Clock, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Messages & Academic Desk | IMHS Student Portal",
  description: "Direct official communication with IMHS Academic Desk & Administration.",
};

export default async function StudentMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
            Communication Channel
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight mt-0.5">
            Admin & Academic Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Directly communicate with IMHS administration regarding course enrollment, payment confirmations, and academic queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Desk Active
          </span>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Info Guide */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#0E57A4]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Official Channel</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              All messages sent here are reviewed by our registered academic coordinators and instructors.
            </p>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant confirmation of payment receipts & slip uploads.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Assistance with video lectures, assignments & exams.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Device reset & 2FA security requests.</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 shadow-xs space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-[#0E57A4] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Operating Hours
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Monday - Sunday: 8:00 AM – 10:00 PM. Messages received outside hours will be answered first thing in the morning.
            </p>
          </div>
        </div>

        {/* Right Chat Box */}
        <div className="lg:col-span-3 h-[680px]">
          <LiveChatBox
            currentUserId={user.id}
            currentUserRole="STUDENT"
            targetName="IMHS Academic & Student Support Desk"
            targetSubtext="Official Communications Desk"
            className="h-full shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
