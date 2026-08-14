"use client";

import React, { useState } from "react";
import { deletePrescriptionCase } from "@/actions/prescription-actions";
import { Trash2, Edit3, ExternalLink, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";

interface CaseItem {
  id: string;
  title: string;
  imageUrl: string;
  patientDetails: any;
  medicineDetails: any;
  hasProblem: boolean;
  problemOptions: any;
  correctProblem: string | null;
  shouldDispense: boolean;
  dispenseReason: string;
  counsellingPoints: any;
  isPublished: boolean;
  createdAt: string | Date;
}

interface CaseManagerListProps {
  cases: CaseItem[];
  onEditCase?: (c: CaseItem) => void;
}

export function CaseManagerList({ cases, onEditCase }: CaseManagerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await deletePrescriptionCase(id);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Failed to delete case.");
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (cases.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-slate-200">
        No prescription cases configured yet. Fill out the form above to add your first case.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((c, index) => {
        const patient = typeof c.patientDetails === "object" ? c.patientDetails : {};
        const medicines = Array.isArray(c.medicineDetails) ? c.medicineDetails : [];

        return (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs gap-4 transition-all"
          >
            {/* Left Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Clean Case Number Badge */}
                <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Case #{index + 1}
                </span>

                <h3 className="font-display font-bold text-ink text-sm truncate">
                  {c.title}
                </h3>

                {/* Status Pill */}
                <span
                  className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    c.hasProblem
                      ? "bg-clinical-red-light text-clinical-red border-clinical-red/30"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {c.hasProblem ? "Has Error" : "Clean Rx"}
                </span>

                {patient?.name && (
                  <span className="text-xs font-mono text-slate-500">
                    · Patient: <strong>{patient.name}</strong> ({patient.age || 58}y)
                  </span>
                )}
              </div>

              {/* Rationale explanation */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {c.dispenseReason || "No dispensing rationale specified."}
              </p>

              {/* Medicines summary */}
              {medicines.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {medicines.map((m: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {m.name || "Drug"} {m.strength || ""}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action & Buttons */}
            <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Action Required</div>
                <div
                  className={`text-xs font-mono font-bold ${
                    c.shouldDispense ? "text-emerald-600" : "text-clinical-red"
                  }`}
                >
                  {c.shouldDispense ? "DISPENSE" : "DO NOT DISPENSE"}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <Link
                  href={`/dashboard/learning-hub/prescription-review?case=${c.id}`}
                  target="_blank"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-semibold flex items-center gap-1"
                  title="Test Student Side-by-Side View"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Test</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.title)}
                  disabled={deletingId === c.id}
                  className="p-2 rounded-lg bg-clinical-red/10 hover:bg-clinical-red/20 text-clinical-red transition text-xs font-semibold disabled:opacity-50"
                  title="Delete Duplicate Case"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
