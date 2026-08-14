import React from "react";
import Link from "next/link";
import { getPrescriptionCases } from "@/actions/prescription-actions";
import { CaseEditorForm } from "@/components/admin/CaseEditorForm";
import { CaseManagerList } from "@/components/admin/CaseManagerList";
import { ArrowLeft, FileText } from "lucide-react";
import { PRESCRIPTION_CASES } from "@/data/prescriptionCases";

export const metadata = {
  title: "Prescription Case Manager — Admin CMS",
};

export default async function AdminPrescriptionsPage() {
  const cases = await getPrescriptionCases();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/admin/learning-hub"
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to CMS Overview
          </Link>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0E57A4]" /> Prescription Case Manager
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Configure clinical cases, upload prescription document images, set ground truth answers, and manage duplicates.
          </p>
        </div>
      </div>

      {/* Case Editor Form */}
      <CaseEditorForm />

      {/* Existing Cases List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-ink">
            Configured Prescription Cases ({cases.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Click trash icon to delete duplicate entries
          </span>
        </div>

        <CaseManagerList cases={cases} />
      </div>
    </div>
  );
}
