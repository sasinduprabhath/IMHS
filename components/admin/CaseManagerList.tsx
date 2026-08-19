"use client";

import React, { useState } from "react";
import { deletePrescriptionCase } from "@/actions/prescription-actions";
import { CaseEditorForm } from "./CaseEditorForm";
import {
  Trash2,
  Edit3,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  User,
  Pill,
  X,
} from "lucide-react";
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
}

export function CaseManagerList({ cases }: CaseManagerListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "errors" | "clean" | "published">("all");
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
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

  const filteredCases = cases.filter((c) => {
    const patient = typeof c.patientDetails === "object" ? c.patientDetails : {};
    const patientName = (patient?.name || "").toLowerCase();
    const diagnosis = (patient?.diagnosis || "").toLowerCase();
    const medicines = Array.isArray(c.medicineDetails) ? c.medicineDetails : [];
    const medNames = medicines.map((m: any) => (m?.name || "").toLowerCase()).join(" ");

    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      patientName.includes(search.toLowerCase()) ||
      diagnosis.includes(search.toLowerCase()) ||
      medNames.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "errors") return c.hasProblem;
    if (filterType === "clean") return !c.hasProblem;
    if (filterType === "published") return c.isPublished;
    return true;
  });

  return (
    <div className="space-y-4 max-w-full">
      {/* ── Search & Filter Controls Ribbon ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2.5 sm:p-3 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case title, patient, diagnosis, medicine..."
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-sans placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[40px]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills - Mobile Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "all", label: `All (${cases.length})` },
            { id: "errors", label: `⚠️ Erroneous (${cases.filter((c) => c.hasProblem).length})` },
            { id: "clean", label: `✓ Clean (${cases.filter((c) => !c.hasProblem).length})` },
            { id: "published", label: `Published (${cases.filter((c) => c.isPublished).length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors shrink-0 whitespace-nowrap min-h-[36px] ${
                filterType === f.id
                  ? "bg-[#0E57A4] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Case Cards List ────────────────────────────────────────────── */}
      {filteredCases.length === 0 ? (
        <div className="p-8 sm:p-12 text-center space-y-2 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-mono text-slate-500">
            {search ? `No prescription cases match "${search}".` : "No cases configured in this view."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c, index) => {
            const patient = typeof c.patientDetails === "object" ? c.patientDetails : {};
            const medicines = Array.isArray(c.medicineDetails) ? c.medicineDetails : [];

            return (
              <div
                key={c.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white shadow-xs hover:shadow-md gap-3.5 sm:gap-4 transition-all"
              >
                {/* Left Case Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                      Case #{index + 1}
                    </span>

                    <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {c.title}
                    </h3>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                        c.hasProblem
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {c.hasProblem ? "⚠️ Contains Error" : "✓ Clean Rx"}
                    </span>
                  </div>

                  {patient?.name && (
                    <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {patient.name}
                      </span>
                      <span>({patient.age || 58}y / {patient.sex || "F"})</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 truncate max-w-full">{patient.diagnosis}</span>
                    </div>
                  )}

                  {/* Dispense Rationale Preview */}
                  <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-2">
                    {c.dispenseReason || "No dispensing rationale specified."}
                  </p>

                  {/* Medicines Summary Chips */}
                  {medicines.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">Prescription:</span>
                      {medicines.map((m: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1"
                        >
                          <Pill className="w-2.5 h-2.5 text-[#0E57A4] shrink-0" />
                          <span>{m.name || "Drug"} {m.strength || ""}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Action & Controls Area */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Action Required</div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        c.shouldDispense ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {c.shouldDispense ? "DISPENSE" : "DO NOT DISPENSE"}
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-slate-200">
                    <Link
                      href={`/dashboard/learning-hub/prescription-review?case=${c.id}`}
                      target="_blank"
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-mono font-bold flex items-center gap-1 min-h-[36px]"
                      title="Test Student View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Test View</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingCase(c)}
                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#EBF3FA] hover:bg-[#BFDBFE] text-[#0E57A4] transition text-xs font-mono font-bold flex items-center gap-1 min-h-[36px]"
                      title="Edit this case"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.title)}
                      disabled={deletingId === c.id}
                      className="p-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition text-xs font-semibold disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete Case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Direct In-Place Edit Modal (Mobile Responsive Full Height Dialog) ── */}
      {editingCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between p-3.5 sm:p-4 px-4 sm:px-6 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="font-display font-bold text-xs sm:text-sm truncate">Edit Prescription Case</h3>
              </div>
              <button
                onClick={() => setEditingCase(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-1 flex-1">
              <CaseEditorForm
                initialCase={editingCase}
                onSuccess={() => {
                  setEditingCase(null);
                  window.location.reload();
                }}
                onCancel={() => setEditingCase(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
