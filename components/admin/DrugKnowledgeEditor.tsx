"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical, Plus, Trash2, Edit3, Save, ArrowLeft, Check, AlertCircle,
  FileUp, Download, Info, Search, Filter, X, Sparkles, CheckCircle2
} from "lucide-react";
import {
  createDrugKnowledge,
  updateDrugKnowledge,
  deleteDrugKnowledge,
} from "@/actions/drug-actions";

export interface DrugItem {
  id?: string;
  genericName: string;
  drugClass: string;
  drugClassOptions?: string[];
  mechanismOfAction: string;
  moaOptions?: string[];
  sideEffects: string[] | string;
  sideEffectOptions?: string[];
  interactions: string[] | string;
  interactionOptions?: string[];
  antidote?: string | null;
  antidoteOptions?: string[];
  isPublished?: boolean;
}

interface DrugKnowledgeEditorProps {
  initialDrugs: DrugItem[];
}

export function DrugKnowledgeEditor({ initialDrugs }: DrugKnowledgeEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [drugs, setDrugs] = useState<DrugItem[]>(initialDrugs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugItem | null>(null);

  // Form Fields
  const [genericName, setGenericName] = useState("");
  const [drugClass, setDrugClass] = useState("");
  const [moa, setMoa] = useState("");
  const [sideEffectsStr, setSideEffectsStr] = useState("");
  const [interactionsStr, setInteractionsStr] = useState("");
  const [antidote, setAntidote] = useState("");

  const [saving, setSaving] = useState(false);
  const [fetchingAi, setFetchingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleAiAutoFill = async () => {
    if (!genericName.trim()) {
      setError("Please enter a Generic Medicine Name first to auto-fill.");
      return;
    }

    setFetchingAi(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/fetch-drug-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genericName: genericName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch AI drug information.");
      }

      const info = data.data;
      if (info.drugClass) setDrugClass(info.drugClass);
      if (info.mechanismOfAction) setMoa(info.mechanismOfAction);
      if (info.sideEffects?.length > 0) setSideEffectsStr(info.sideEffects.join(", "));
      if (info.drugInteractions?.length > 0) setInteractionsStr(info.drugInteractions.join(", "));
      if (info.antidote) setAntidote(info.antidote);

      setSuccessMsg(`Gemini AI successfully populated clinical fields for "${genericName}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to auto-fill via AI.");
    } finally {
      setFetchingAi(false);
    }
  };

  const openAddModal = () => {
    setEditingDrug(null);
    setGenericName("");
    setDrugClass("");
    setMoa("");
    setSideEffectsStr("");
    setInteractionsStr("");
    setAntidote("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (drug: DrugItem) => {
    setEditingDrug(drug);
    setGenericName(drug.genericName);
    setDrugClass(drug.drugClass);
    setMoa(drug.mechanismOfAction);
    setSideEffectsStr(
      Array.isArray(drug.sideEffects) ? drug.sideEffects.join(", ") : drug.sideEffects || ""
    );
    setInteractionsStr(
      Array.isArray(drug.interactions) ? drug.interactions.join(", ") : drug.interactions || ""
    );
    setAntidote(drug.antidote || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName.trim() || !drugClass.trim() || !moa.trim()) {
      setError("Please fill in Generic Name, Drug Class, and Mechanism of Action.");
      return;
    }

    setSaving(true);
    setError(null);

    const sideEffectsArr = sideEffectsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const interactionsArr = interactionsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      genericName: genericName.trim(),
      drugClass: drugClass.trim(),
      drugClassOptions: [drugClass.trim(), "ACE Inhibitor", "Beta Blocker", "CCB", "Diuretic"],
      mechanismOfAction: moa.trim(),
      moaOptions: [moa.trim(), "Inhibits viral replication", "Blocks H1 histamine receptors"],
      sideEffects: sideEffectsArr.length > 0 ? sideEffectsArr : ["Hypotension", "Headache"],
      sideEffectOptions: [...sideEffectsArr, "Dizziness", "Nausea", "Hyperkalemia"],
      interactions: interactionsArr.length > 0 ? interactionsArr : ["CYP3A4 Inhibitors"],
      interactionOptions: [...interactionsArr, "NSAIDs", "Warfarin", "Grapefruit Juice"],
      antidote: antidote.trim() || undefined,
      antidoteOptions: antidote.trim() ? [antidote.trim(), "N-acetylcysteine", "Naloxone"] : [],
      isPublished: true,
    };

    try {
      if (editingDrug?.id) {
        const res = await updateDrugKnowledge(editingDrug.id, payload);
        if (!res.success) throw new Error(res.error);
        setDrugs((prev) =>
          prev.map((d) => (d.id === editingDrug.id ? { ...d, ...payload } : d))
        );
        setSuccessMsg(`Successfully updated medicine: ${genericName}`);
      } else {
        const res = await createDrugKnowledge(payload);
        if (!res.success) throw new Error(res.error);
        setDrugs((prev) => [res.drug as any, ...prev]);
        setSuccessMsg(`Successfully added new medicine: ${genericName}`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save drug entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string, name?: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete "${name}" from the Drug Knowledge Base?`)) return;

    try {
      const res = await deleteDrugKnowledge(id);
      if (!res.success) throw new Error(res.error);
      setDrugs((prev) => prev.filter((d) => d.id !== id));
      setSuccessMsg(`Deleted "${name}".`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete drug.");
    }
  };

  // ── Download Sample CSV Template ──────────────────────────────────────────
  const downloadSampleCSV = () => {
    const csvContent =
      `genericName,drugClass,mechanismOfAction,sideEffects,interactions,antidote\n` +
      `"Atorvastatin","HMG-CoA Reductase Inhibitor","Inhibits HMG-CoA reductase to decrease hepatic cholesterol synthesis.","Myalgia, Transaminase elevation, Headache","Grapefruit juice, Clarithromycin, Gemfibrozil","None / Symptomatic"\n` +
      `"Amoxicillin","Aminopenicillin Antibiotic","Inhibits bacterial cell wall synthesis by binding to PBPs.","Diarrhoea, Rash, Nausea","Allopurinol, Oral Contraceptives","None"\n` +
      `"Metformin","Biguanide Antidiabetic","Decreases hepatic glucose production and increases insulin sensitivity.","Gastrointestinal upset, Lactic acidosis","Iodinated contrast, Alcohol","None"\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `drug_knowledge_sample_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── CSV Parsing & Bulk Import ─────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportNotice(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setError("CSV file must contain a header line and at least 1 drug entry.");
          return;
        }

        const parsedRows: string[][] = [];
        for (const line of lines) {
          const row: string[] = [];
          let inQuotes = false;
          let currentVal = "";
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              row.push(currentVal.trim().replace(/^["']|["']$/g, ""));
              currentVal = "";
            } else {
              currentVal += char;
            }
          }
          row.push(currentVal.trim().replace(/^["']|["']$/g, ""));
          parsedRows.push(row);
        }

        const dataRows = parsedRows.slice(1);
        let importedCount = 0;

        for (const r of dataRows) {
          const gName = r[0] || "";
          const dClass = r[1] || "General Medicine";
          const dMoa = r[2] || "Pharmacological action.";
          const sEffects = (r[3] || "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
          const sInteractions = (r[4] || "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
          const dAntidote = r[5] || "";

          if (gName.trim().length > 0) {
            const res = await createDrugKnowledge({
              genericName: gName.trim(),
              drugClass: dClass.trim(),
              drugClassOptions: [dClass.trim(), "Cardiovascular", "Antibiotic", "Endocrine"],
              mechanismOfAction: dMoa.trim(),
              moaOptions: [dMoa.trim(), "Cell wall inhibitor"],
              sideEffects: sEffects.length > 0 ? sEffects : ["Nausea"],
              sideEffectOptions: sEffects,
              interactions: sInteractions.length > 0 ? sInteractions : ["CYP3A4"],
              interactionOptions: sInteractions,
              antidote: dAntidote.trim() || undefined,
            });

            if (res.success && res.drug) {
              importedCount++;
              setDrugs((prev) => [res.drug as any, ...prev]);
            }
          }
        }

        setImportNotice(`Successfully imported ${importedCount} medicines into the Drug Knowledge Base!`);
      } catch (err: any) {
        console.error("CSV Import error:", err);
        setError("Failed to parse CSV file: " + (err.message || ""));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // ── Filter Computation ──────────────────────────────────────────────────
  const uniqueClasses = useMemo(() => {
    const classes = Array.from(new Set(drugs.map((d) => d.drugClass))).filter(Boolean);
    return classes.sort();
  }, [drugs]);

  const filteredDrugs = useMemo(() => {
    return drugs.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.genericName.toLowerCase().includes(q);
        const matchClass = d.drugClass.toLowerCase().includes(q);
        const matchMoa = d.mechanismOfAction.toLowerCase().includes(q);
        if (!matchName && !matchClass && !matchMoa) return false;
      }
      if (selectedClass !== "all" && d.drugClass !== selectedClass) return false;
      return true;
    });
  }, [drugs, searchQuery, selectedClass]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#4A8B7A] to-[#0E57A4] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/learning-hub")}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition border border-white/20"
              aria-label="Back to CMS"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  Activity 02 Content CMS
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 text-white px-3 py-0.5 rounded-full border border-white/20">
                  {drugs.length} Medicines Seeded
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Drug Knowledge Base Manager
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={openAddModal}
              className="px-5 py-3 rounded-2xl bg-white text-[#4A8B7A] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 text-[#4A8B7A]" /> Add New Medicine
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <Download className="w-4 h-4 text-emerald-300" /> Sample CSV Template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <FileUp className="w-4 h-4" /> Import CSV File
            </button>
          </div>

          <p className="text-xs font-mono text-white/70">
            Activity 02 (Drug Classification Wizard) dynamically uses this database.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {importNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 shrink-0 text-blue-600" />
          <span>{importNotice}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic name, class, or MOA..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#4A8B7A]" /> Class:
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs font-mono p-2 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none bg-white"
            >
              <option value="all">All Classes ({drugs.length})</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drug Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDrugs.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-display font-bold text-slate-800">No Medicines Found</h3>
            <p className="text-xs text-slate-500">Add a new medicine or import a CSV file to expand the database.</p>
          </div>
        ) : (
          filteredDrugs.map((drug) => {
            const sideEffectsList = Array.isArray(drug.sideEffects)
              ? drug.sideEffects
              : typeof drug.sideEffects === "string"
              ? drug.sideEffects.split(",")
              : [];
            const interactionsList = Array.isArray(drug.interactions)
              ? drug.interactions
              : typeof drug.interactions === "string"
              ? drug.interactions.split(",")
              : [];

            return (
              <div
                key={drug.id || drug.genericName}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:shadow-xs hover:border-[#4A8B7A]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#4A8B7A] bg-[#4A8B7A]/10 px-2.5 py-0.5 rounded-full border border-[#4A8B7A]/20">
                        {drug.drugClass}
                      </span>
                      <h3 className="text-xl font-display font-bold text-slate-900 mt-1">
                        {drug.genericName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(drug)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#4A8B7A] hover:bg-[#4A8B7A]/10 transition"
                        title="Edit medicine"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(drug.id, drug.genericName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-slate-700 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                        Mechanism of Action (MOA)
                      </span>
                      <p className="text-slate-800 leading-relaxed">{drug.mechanismOfAction}</p>
                    </div>

                    {sideEffectsList.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Key Side Effects
                        </span>
                        <p className="text-slate-700">{sideEffectsList.join(", ")}</p>
                      </div>
                    )}

                    {interactionsList.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Major Interactions
                        </span>
                        <p className="text-slate-700">{interactionsList.join(", ")}</p>
                      </div>
                    )}

                    {drug.antidote && (
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 block">
                          Antidote / Specific Reversal Agent
                        </span>
                        <p className="text-emerald-800 font-semibold">{drug.antidote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add / Edit Drug Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#4A8B7A]">
                  Activity 02 Medicine Form
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  {editingDrug ? `Edit Medicine: ${editingDrug.genericName}` : "Add New Medicine"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDrug} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                      Generic Name *
                    </label>
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={fetchingAi || !genericName.trim()}
                      className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                      title="Fetch structured pharmacology details from Gemini AI"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {fetchingAi ? "Fetching AI..." : "AI Auto-Fill"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Atorvastatin"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                    Drug Class *
                  </label>
                  <input
                    type="text"
                    value={drugClass}
                    onChange={(e) => setDrugClass(e.target.value)}
                    placeholder="e.g. HMG-CoA Reductase Inhibitor"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  Mechanism of Action (MOA) *
                </label>
                <textarea
                  value={moa}
                  onChange={(e) => setMoa(e.target.value)}
                  placeholder="Describe pharmacological mechanism of action..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none min-h-[70px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  Common Side Effects (Comma-separated)
                </label>
                <input
                  type="text"
                  value={sideEffectsStr}
                  onChange={(e) => setSideEffectsStr(e.target.value)}
                  placeholder="e.g. Myalgia, Transaminase elevation, Headache"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  Key Drug Interactions (Comma-separated)
                </label>
                <input
                  type="text"
                  value={interactionsStr}
                  onChange={(e) => setInteractionsStr(e.target.value)}
                  placeholder="e.g. Grapefruit juice, Clarithromycin, Gemfibrozil"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  Antidote / Specific Reversal Agent (Optional)
                </label>
                <input
                  type="text"
                  value={antidote}
                  onChange={(e) => setAntidote(e.target.value)}
                  placeholder="e.g. N-acetylcysteine / Symptomatic support"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#4A8B7A] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#4A8B7A] hover:bg-[#3B7264] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : editingDrug ? "Update Medicine" : "Save Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
