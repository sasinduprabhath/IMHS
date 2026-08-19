"use client";

import React, { useState, useEffect } from "react";
import { createPrescriptionCase, updatePrescriptionCase } from "@/actions/prescription-actions";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  User,
  Pill,
  MessageSquare,
  Image as ImageIcon,
  Check,
  X,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface CaseEditorFormProps {
  initialCase?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AI_PRESETS = [
  { label: "Amlodipine Overdose", scenario: "Hypertension patient prescribed Amlodipine 10mg BD exceeding 10mg/day maximum" },
  { label: "Warfarin Interaction", scenario: "Atrial fibrillation patient on Warfarin co-prescribed High-Dose Aspirin creating major bleed risk" },
  { label: "Asthma Contraindication", scenario: "Asthma patient with hypertension prescribed Propranolol non-selective beta blocker" },
  { label: "Metformin in CKD", scenario: "Type 2 Diabetic patient with severe renal impairment prescribed high-dose Metformin risk of lactic acidosis" },
  { label: "Clean Valid Rx", scenario: "Clean safe prescription of Amoxicillin 500mg TDS for 5 days with Paracetamol for dental infection" },
];

export function CaseEditorForm({ initialCase, onSuccess, onCancel }: CaseEditorFormProps) {
  const isEditing = !!initialCase;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "medicines" | "rules" | "counselling" | "image">("details");

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(initialCase?.title || "Prescription Case Review #1");
  const [imageUrl, setImageUrl] = useState(initialCase?.imageUrl || "");
  const [imgError, setImgError] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Sync state whenever initialCase changes
  useEffect(() => {
    if (initialCase) {
      setTitle(initialCase.title || "Prescription Case Review #1");
      setImageUrl(initialCase.imageUrl || "");
      setPatient(
        initialCase.patientDetails || {
          name: "Kumari Perera",
          age: 58,
          sex: "Female",
          date: "2024-01-15",
          diagnosis: "Essential Hypertension",
        }
      );
      setMedicines(
        initialCase.medicineDetails || [
          { name: "Amlodipine", strength: "10 mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days" },
        ]
      );
      setHasProblem(initialCase.hasProblem ?? true);
      setProblemOptions(initialCase.problemOptions || ["Wrong/excessive dose"]);
      setCorrectProblem(initialCase.correctProblem || "Wrong/excessive dose");
      setShouldDispense(initialCase.shouldDispense ?? false);
      setDispenseReason(initialCase.dispenseReason || "");
      setCounsellingPoints(initialCase.counsellingPoints || []);
      setIsPublished(initialCase.isPublished ?? true);
      setImgError(false);
      setUploadError("");
    }
  }, [initialCase]);

  // Patient Details
  const [patient, setPatient] = useState(
    initialCase?.patientDetails || {
      name: "Kumari Perera",
      age: 58,
      sex: "Female",
      date: "2024-01-15",
      diagnosis: "Essential Hypertension",
    }
  );

  // Medicine Details
  const [medicines, setMedicines] = useState<any[]>(
    initialCase?.medicineDetails || [
      { name: "Amlodipine", strength: "10 mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days" },
      { name: "Metformin", strength: "500 mg", dose: "1 tablet", frequency: "Twice daily", duration: "30 days" },
    ]
  );

  // Problem Logic
  const [hasProblem, setHasProblem] = useState(initialCase?.hasProblem ?? true);
  const [problemOptions, setProblemOptions] = useState<string[]>(
    initialCase?.problemOptions || [
      "Wrong/excessive dose",
      "Severe drug-drug interaction",
      "Contraindication with patient condition",
      "Incomplete prescription details",
      "Illegible handwriting / ambiguous frequency",
    ]
  );
  const [correctProblem, setCorrectProblem] = useState(
    initialCase?.correctProblem || "Wrong/excessive dose"
  );

  // Pharmacist Action & Reason
  const [shouldDispense, setShouldDispense] = useState(initialCase?.shouldDispense ?? false);
  const [dispenseReason, setDispenseReason] = useState(
    initialCase?.dispenseReason ||
      "Amlodipine 10 mg BD exceeds maximum recommended daily dose (10 mg/day). Contact prescriber."
  );

  // Counselling Points
  const [counsellingPoints, setCounsellingPoints] = useState<string[]>(
    initialCase?.counsellingPoints || [
      "Take at prescribed dose only",
      "Take Metformin with meals to reduce GI irritation",
      "Report ankle swelling or dizziness to your doctor",
    ]
  );

  const [isPublished, setIsPublished] = useState(initialCase?.isPublished ?? true);
  const [newProblemOpt, setNewProblemOpt] = useState("");
  const [newCounsellingOpt, setNewCounsellingOpt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── AI Generator Handler ─────────────────────────────────────────
  const handleAIGenerate = async (customScenario?: string) => {
    const scenarioToUse = customScenario || aiPrompt;
    setIsGeneratingAI(true);
    setAiSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/generate-prescription-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioToUse }),
      });

      const data = await res.json();
      if (res.ok && data.caseData) {
        const c = data.caseData;
        if (c.title) setTitle(c.title);
        if (c.patientDetails) setPatient(c.patientDetails);
        if (Array.isArray(c.medicineDetails) && c.medicineDetails.length > 0) setMedicines(c.medicineDetails);
        if (typeof c.hasProblem === "boolean") setHasProblem(c.hasProblem);
        if (Array.isArray(c.problemOptions) && c.problemOptions.length > 0) setProblemOptions(c.problemOptions);
        if (c.correctProblem !== undefined) setCorrectProblem(c.correctProblem);
        if (typeof c.shouldDispense === "boolean") setShouldDispense(c.shouldDispense);
        if (c.dispenseReason) setDispenseReason(c.dispenseReason);
        if (Array.isArray(c.counsellingPoints) && c.counsellingPoints.length > 0) setCounsellingPoints(c.counsellingPoints);

        setAiSuccessMsg(`✨ AI Case successfully generated: "${c.title}"`);
        setAiPrompt("");
      } else {
        alert(data.error || "Failed to generate case with Gemini AI.");
      }
    } catch (err: any) {
      alert("AI Generation error: " + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "prescriptions");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        setImgError(false);
      } else {
        setUploadError(data.error || "Failed to upload image file");
      }
    } catch (err: any) {
      setUploadError("Upload error: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", strength: "", dose: "", frequency: "", duration: "" }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const addProblemOption = () => {
    if (newProblemOpt.trim()) {
      if (!problemOptions.includes(newProblemOpt.trim())) {
        setProblemOptions([...problemOptions, newProblemOpt.trim()]);
      }
      setNewProblemOpt("");
    }
  };

  const removeProblemOption = (opt: string) => {
    setProblemOptions(problemOptions.filter((o) => o !== opt));
    if (correctProblem === opt) {
      setCorrectProblem(problemOptions[0] || "");
    }
  };

  const addCounsellingPoint = () => {
    if (newCounsellingOpt.trim()) {
      setCounsellingPoints([...counsellingPoints, newCounsellingOpt.trim()]);
      setNewCounsellingOpt("");
    }
  };

  const removeCounsellingPoint = (index: number) => {
    setCounsellingPoints(counsellingPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        imageUrl,
        patientDetails: patient,
        medicineDetails: medicines,
        hasProblem,
        problemOptions,
        correctProblem: hasProblem ? correctProblem : "",
        shouldDispense,
        dispenseReason,
        counsellingPoints,
        isPublished,
      };

      let res;
      if (isEditing) {
        res = await updatePrescriptionCase(initialCase.id, payload);
      } else {
        res = await createPrescriptionCase(payload);
      }

      if (res.success) {
        alert(isEditing ? "Prescription case updated successfully!" : "Prescription case created successfully!");
        onSuccess?.();
        if (!isEditing) {
          window.location.reload();
        }
      } else {
        alert(res.error || "Failed to save prescription case");
      }
    } catch (err: any) {
      alert("Error saving case: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden max-w-full">
      
      {/* ── AI Auto-Generate Header Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#1E3A8A] text-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-display font-bold text-white leading-tight">
                {isEditing ? `Edit Case: ${initialCase.title}` : "Create Clinical Prescription Case"}
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/80 font-sans mt-0.5">
                Type a clinical scenario or pick a preset to auto-populate all pharmacology fields with Gemini AI.
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-end sm:self-center text-xs font-mono px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* AI Input & Quick Preset Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Elderly patient on Ciprofloxacin prescribed Antacid chelation..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs font-sans text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-amber-300/60 focus:bg-white/15 min-h-[42px]"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAIGenerate())}
            />
            <button
              type="button"
              onClick={() => handleAIGenerate()}
              disabled={isGeneratingAI}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 disabled:opacity-50 min-h-[42px]"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
              <span>{isGeneratingAI ? "Generating Case..." : "✨ AI Auto-Generate Case"}</span>
            </button>
          </div>

          {/* Quick Preset Chips - Mobile Friendly Smooth Swipe */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono text-white/90 no-scrollbar">
            <span className="text-white/50 text-[10px] shrink-0">Quick Presets:</span>
            {AI_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleAIGenerate(p.scenario)}
                disabled={isGeneratingAI}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-blue-100 transition-colors shrink-0 whitespace-nowrap"
              >
                + {p.label}
              </button>
            ))}
          </div>

          {/* AI Success Message */}
          {aiSuccessMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="truncate">{aiSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs Bar (Scrollable on Small Screens) ───────────────── */}
      <div className="flex items-center gap-1 px-3 sm:px-5 border-b border-slate-200 bg-slate-50/60 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "details", label: "Patient & Case", icon: User },
          { id: "medicines", label: `Medicines (${medicines.length})`, icon: Pill },
          { id: "rules", label: "Problem & Decision", icon: AlertTriangle },
          { id: "counselling", label: `Counselling (${counsellingPoints.length})`, icon: MessageSquare },
          { id: "image", label: "Prescription Slip", icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-3.5 text-xs font-mono font-bold border-b-2 whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? "border-[#0E57A4] text-[#0E57A4] bg-white shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Form Body ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6">

        {/* ── TAB 1: Patient & Case Info ───────────────────────────────────── */}
        {activeTab === "details" && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hypertension Review: Excessive Amlodipine Dosing"
                className="w-full text-xs font-sans p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[42px]"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3.5 sm:space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0E57A4]" /> Patient Demographics &amp; Diagnosis
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={patient.name || ""}
                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    value={patient.age || ""}
                    onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Sex *</label>
                  <select
                    value={patient.sex || "Female"}
                    onChange={(e) => setPatient({ ...patient, sex: e.target.value })}
                    className="w-full text-xs font-sans p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Prescription Date</label>
                  <input
                    type="date"
                    value={patient.date || "2024-01-15"}
                    onChange={(e) => setPatient({ ...patient, date: e.target.value })}
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={patient.diagnosis || ""}
                  onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                  placeholder="e.g. Essential Hypertension & Type 2 Diabetes Mellitus"
                  className="w-full text-xs font-sans p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E57A4] shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-800">Publish in Student Hub</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0E57A4]"></div>
              </label>
            </div>
          </div>
        )}

        {/* ── TAB 2: Medicines List ───────────────────────────────────────── */}
        {activeTab === "medicines" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-[#0E57A4]" /> Prescribed Medicines Table
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  List the medicines prescribed on this prescription slip
                </p>
              </div>

              <button
                type="button"
                onClick={addMedicine}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#EBF3FA] hover:bg-[#BFDBFE] text-[#0E57A4] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" /> Add Drug Row
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Item #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 text-xs transition-colors"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Responsive grid: On mobile 2 cols, on large 5 cols */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Drug Name *</label>
                      <input
                        type="text"
                        required
                        value={m.name}
                        onChange={(e) => {
                          const next = [...medicines];
                          next[idx].name = e.target.value;
                          setMedicines(next);
                        }}
                        placeholder="e.g. Amlodipine"
                        className="w-full text-xs font-sans p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Strength *</label>
                      <input
                        type="text"
                        required
                        value={m.strength}
                        onChange={(e) => {
                          const next = [...medicines];
                          next[idx].strength = e.target.value;
                          setMedicines(next);
                        }}
                        placeholder="e.g. 10 mg"
                        className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Dose *</label>
                      <input
                        type="text"
                        required
                        value={m.dose}
                        onChange={(e) => {
                          const next = [...medicines];
                          next[idx].dose = e.target.value;
                          setMedicines(next);
                        }}
                        placeholder="e.g. 1 tablet"
                        className="w-full text-xs font-sans p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Frequency *</label>
                      <input
                        type="text"
                        required
                        value={m.frequency}
                        onChange={(e) => {
                          const next = [...medicines];
                          next[idx].frequency = e.target.value;
                          setMedicines(next);
                        }}
                        placeholder="e.g. Twice daily"
                        className="w-full text-xs font-sans p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Duration *</label>
                      <input
                        type="text"
                        required
                        value={m.duration}
                        onChange={(e) => {
                          const next = [...medicines];
                          next[idx].duration = e.target.value;
                          setMedicines(next);
                        }}
                        placeholder="e.g. 30 days"
                        className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-white min-h-[38px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: Problem Logic & Decision Rules ────────────────────────── */}
        {activeTab === "rules" && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
            {/* Has Problem Toggle */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Prescription Error Status
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Does this prescription contain a dosing error, contraindication, or drug interaction?
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setHasProblem(true);
                      setShouldDispense(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                      hasProblem
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ⚠️ Has Error
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasProblem(false);
                      setShouldDispense(true);
                      setCorrectProblem("");
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                      !hasProblem
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ✓ Clean / Safe
                  </button>
                </div>
              </div>

              {hasProblem && (
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <label className="block text-xs font-mono font-bold text-slate-700">
                    Correct Clinical Error (Ground Truth Answer) *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {problemOptions.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-sans cursor-pointer transition-all ${
                          correctProblem === opt
                            ? "bg-rose-50 border-rose-400 text-rose-900 font-bold"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <input
                            type="radio"
                            name="correctProblem"
                            checked={correctProblem === opt}
                            onChange={() => setCorrectProblem(opt)}
                            className="text-rose-600 focus:ring-rose-500 shrink-0"
                          />
                          <span className="truncate">{opt}</span>
                        </div>

                        {problemOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProblemOption(opt);
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Add Custom Problem Option */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={newProblemOpt}
                      onChange={(e) => setNewProblemOpt(e.target.value)}
                      placeholder="Add custom problem distractor option..."
                      className="flex-1 text-xs font-sans p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProblemOption())}
                    />
                    <button
                      type="button"
                      onClick={addProblemOption}
                      className="w-full sm:w-auto px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-mono font-bold rounded-lg min-h-[40px] shrink-0"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pharmacist Dispensing Decision */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E57A4]" /> Expected Action: Should Dispense?
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Action expected from the student
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShouldDispense(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                      !shouldDispense
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    DO NOT DISPENSE
                  </button>

                  <button
                    type="button"
                    onClick={() => setShouldDispense(true)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold text-center transition-all ${
                      shouldDispense
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    DISPENSE
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 mb-1">
                  Detailed Dispensing Rationale (Shown after student submits) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={dispenseReason}
                  onChange={(e) => setDispenseReason(e.target.value)}
                  placeholder="e.g. Amlodipine 10 mg BD exceeds maximum recommended daily dose (10 mg/day). Contact prescriber to adjust."
                  className="w-full text-xs font-sans p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] bg-white leading-relaxed min-h-[85px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: Patient Counselling Points ────────────────────────────── */}
        {activeTab === "counselling" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#0E57A4]" /> Patient Counselling Guidance
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">
                Key verbal counselling points the student must know for this patient case
              </p>
            </div>

            <div className="space-y-2">
              {counsellingPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-sans gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#EBF3FA] text-[#0E57A4] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{pt}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCounsellingPoint(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 shrink-0"
                    title="Remove point"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Counselling Point Input */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={newCounsellingOpt}
                onChange={(e) => setNewCounsellingOpt(e.target.value)}
                placeholder="Type additional counselling point (e.g. Take with meals)..."
                className="flex-1 text-xs font-sans p-2.5 rounded-lg border border-slate-200 bg-white min-h-[40px]"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCounsellingPoint())}
              />
              <button
                type="button"
                onClick={addCounsellingPoint}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#0E57A4] hover:bg-[#0A4685] text-white text-xs font-mono font-bold rounded-lg shrink-0 min-h-[40px]"
              >
                + Add Point
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 5: Prescription Slip Image ───────────────────────────────── */}
        {activeTab === "image" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#0E57A4]" /> Prescription Slip Image
              </h4>
              <p className="text-[11px] text-slate-500 font-sans">
                Upload a scanned prescription, high-res photo, or provide a direct image URL
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1">Image URL / Local File Path *</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => {
                      setImgError(false);
                      setImageUrl(e.target.value);
                    }}
                    placeholder="/practice/prescriptions/upload_...png or https://..."
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white min-h-[40px] focus:outline-none focus:border-[#0E57A4]"
                  />
                </div>

                {/* Upload Dropzone */}
                <div className="border-2 border-dashed border-slate-300 hover:border-[#0E57A4] rounded-2xl p-5 text-center space-y-2 bg-slate-50 hover:bg-blue-50/20 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#0E57A4]/10 text-[#0E57A4] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div className="text-xs font-sans text-slate-600">
                    <p className="font-bold text-[#0E57A4]">
                      {uploadingImage ? "Uploading new slip to server..." : "Click or drag & drop to upload new image file"}
                    </p>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}
              </div>

              {/* Image Preview Card */}
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 text-center space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Live Slip Preview</span>
                  {imageUrl && !imgError && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-[#0E57A4] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      Open Full Size <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                  {imageUrl && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt="Prescription Slip Preview"
                      onError={() => setImgError(true)}
                      onLoad={() => setImgError(false)}
                      className="max-h-full max-w-full object-contain rounded-lg transition-opacity duration-200"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1 p-4">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-mono text-slate-500">
                        {imgError ? "⚠ Failed to load image from URL" : "No Image Specified"}
                      </span>
                      {imgError && (
                        <p className="text-[10px] text-rose-500 font-mono">
                          Check the URL or upload a new file
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {imageUrl && (
                  <p className="text-[10px] font-mono text-slate-400 truncate max-w-full" title={imageUrl}>
                    Source: {imageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Form Actions Bottom Bar ──────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <span className="text-xs font-mono text-slate-400 text-center sm:text-left">
            {isEditing ? "Editing existing case record" : "New prescription case draft"}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-mono text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[42px]"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4685] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 min-h-[42px]"
            >
              <Save className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Saving..." : isEditing ? "Update Case" : "Save & Publish"}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
