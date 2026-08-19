import React from "react";
import Link from "next/link";
import { getPrescriptionCases } from "@/actions/prescription-actions";
import { CaseEditorForm } from "@/components/admin/CaseEditorForm";
import { CaseManagerList } from "@/components/admin/CaseManagerList";
import { ArrowLeft, FileText, Sparkles, PlusCircle } from "lucide-react";

export const metadata = {
  title: "Prescription Case Manager - Admin CMS",
};

export default async function AdminPrescriptionsPage() {
  const cases = await getPrescriptionCases();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/admin/learning-hub"
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline inline-flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS Overview
          </Link>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#0E57A4] shrink-0" />
            <span>Prescription Case Manager</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Configure clinical cases, upload prescription document images, set ground truth answers, and manage duplicates.
          </p>
        </div>
      </div>

      {/* Case Editor Form Component */}
      <CaseEditorForm />

      {/* Existing Cases Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-display font-bold text-slate-900">
              Configured Cases
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0E57A4] border border-blue-200">
              {cases.length}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click edit to update or trash to remove duplicates
          </span>
        </div>

        <CaseManagerList cases={cases} />
      </div>
    </div>
  );
}
