"use client";

import React, { useState } from "react";
import { createPrescriptionCase, updatePrescriptionCase } from "@/actions/prescription-actions";
import { Plus, Trash2, Save, Eye, FileText, CheckCircle2, AlertTriangle, Upload } from "lucide-react";

interface CaseEditorFormProps {
  initialCase?: any;
  onSuccess?: () => void;
}

export function CaseEditorForm({ initialCase, onSuccess }: CaseEditorFormProps) {
  const isEditing = !!initialCase;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Form State
  const [title, setTitle] = useState(initialCase?.title || "Prescription Case Review #1");
  const [imageUrl, setImageUrl] = useState(initialCase?.imageUrl || "/practice/prescriptions/case-01.png");

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
      "Drug interaction",
      "Contraindication",
      "Incomplete prescription info",
      "Illegible writing",
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
      "Take Metformin with meals",
      "Report ankle swelling to doctor",
    ]
  );

  const [isPublished, setIsPublished] = useState(initialCase?.isPublished ?? true);
  const [newProblemOpt, setNewProblemOpt] = useState("");
  const [newCounsellingOpt, setNewCounsellingOpt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.error || "Failed to upload image file");
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
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
      setProblemOptions([...problemOptions, newProblemOpt.trim()]);
      setNewProblemOpt("");
    }
  };

  const addCounsellingPoint = () => {
    if (newCounsellingOpt.trim()) {
      setCounsellingPoints([...counsellingPoints, newCounsellingOpt.trim()]);
      setNewCounsellingOpt("");
    }
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
        alert(isEditing ? "Case updated successfully!" : "Case created successfully!");
        onSuccess?.();
      } else {
        alert(res.error || "Failed to save prescription case");
      }
    } catch (err: any) {
      alert("An unexpected error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-display font-bold text-ink flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0E57A4]" />
          {isEditing ? "Edit Prescription Case" : "Create New Prescription Case"}
        </h2>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "edit" ? "bg-[#0E57A4] text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            Form Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "preview" ? "bg-[#0E57A4] text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Student Preview
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Metadata */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-ink-muted">Case Title</label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0E57A4]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Prescription Image Upload & URL */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-ink-muted flex items-center justify-between">
                <span>Prescription Document Image</span>
                <span className="text-[10px] text-slate-400 font-normal">Upload PNG/JPG or enter image URL</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Drag and drop file upload */}
                <div className="relative border-2 border-dashed border-slate-200 hover:border-[#0E57A4]/50 rounded-xl p-4 text-center transition-colors bg-slate-50 flex flex-col items-center justify-center min-h-[110px]">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className={`w-6 h-6 text-[#0E57A4] mb-1 ${uploadingImage ? "animate-bounce" : ""}`} />
                  <p className="text-xs font-bold text-ink">
                    {uploadingImage ? "Uploading file to /public/practice/prescriptions/..." : "Upload Image File from Device"}
                  </p>
                  <p className="text-[10px] text-ink-muted font-mono">Saves to public/practice/prescriptions/</p>
                </div>

                {/* URL input + Image preview */}
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="or paste image URL / Data URL..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0E57A4]"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="relative h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Prescription preview" className="h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details Json */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E57A4]">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-mono text-ink-muted uppercase">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-ink-muted uppercase">Age</label>
                <input
                  type="number"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  value={patient.age}
                  onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-ink-muted uppercase">Sex</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  value={patient.sex}
                  onChange={(e) => setPatient({ ...patient, sex: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-ink-muted uppercase">Date</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                  value={patient.date}
                  onChange={(e) => setPatient({ ...patient, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Prescribed Medicines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E57A4]">
                Prescribed Medicines ({medicines.length})
              </h3>
              <button
                type="button"
                onClick={addMedicine}
                className="text-xs font-semibold text-[#0E57A4] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            {medicines.map((med, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  className="flex-2 px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                  value={med.name}
                  onChange={(e) => {
                    const next = [...medicines];
                    next[index].name = e.target.value;
                    setMedicines(next);
                  }}
                />
                <input
                  type="text"
                  placeholder="Strength (e.g. 10mg)"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                  value={med.strength}
                  onChange={(e) => {
                    const next = [...medicines];
                    next[index].strength = e.target.value;
                    setMedicines(next);
                  }}
                />
                <input
                  type="text"
                  placeholder="Dose"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                  value={med.dose}
                  onChange={(e) => {
                    const next = [...medicines];
                    next[index].dose = e.target.value;
                    setMedicines(next);
                  }}
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs bg-white"
                  value={med.frequency}
                  onChange={(e) => {
                    const next = [...medicines];
                    next[index].frequency = e.target.value;
                    setMedicines(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="p-1.5 text-clinical-red hover:bg-clinical-red/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Problem & Action Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProblem}
                  onChange={(e) => setHasProblem(e.target.checked)}
                  className="w-4 h-4 text-[#0E57A4] rounded"
                />
                <span className="text-sm font-bold text-ink">Prescription Has Problem/Error</span>
              </label>

              {hasProblem && (
                <div className="space-y-2 pl-6">
                  <label className="text-xs font-mono font-bold text-ink-muted uppercase">Correct Problem Reason</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 rounded-lg border text-xs"
                    value={correctProblem}
                    onChange={(e) => setCorrectProblem(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldDispense}
                  onChange={(e) => setShouldDispense(e.target.checked)}
                  className="w-4 h-4 text-[#0E57A4] rounded"
                />
                <span className="text-sm font-bold text-ink">Pharmacist Should Dispense</span>
              </label>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-ink-muted uppercase">Action Feedback Explanation</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs font-sans"
                  value={dispenseReason}
                  onChange={(e) => setDispenseReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Counselling Points List */}
          <div className="space-y-2 pt-2 border-t">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0E57A4]">
              Expected Counselling Points ({counsellingPoints.length})
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add counselling advice point..."
                className="flex-1 px-3 py-1.5 rounded-lg border text-xs"
                value={newCounsellingOpt}
                onChange={(e) => setNewCounsellingOpt(e.target.value)}
              />
              <button
                type="button"
                onClick={addCounsellingPoint}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200"
              >
                Add Point
              </button>
            </div>
            <ul className="space-y-1 pt-1">
              {counsellingPoints.map((pt, i) => (
                <li key={i} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border">
                  <span>{pt}</span>
                  <button
                    type="button"
                    onClick={() => setCounsellingPoints(counsellingPoints.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-clinical-red"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0E57A4] text-white font-bold text-sm hover:bg-[#0A4482] flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving..." : isEditing ? "Update Case" : "Create Case"}
            </button>
          </div>
        </form>
      ) : (
        /* Student Mode Live Preview */
        <div className="p-8 space-y-6 max-w-xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Live Preview of how this case will render for students during Activity 01.
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm bg-white">
            <h3 className="font-display font-bold text-ink text-base">{title}</h3>

            <div className="bg-slate-100 rounded-xl p-4 font-mono text-xs space-y-1">
              <div><strong className="text-ink">Patient:</strong> {patient.name} ({patient.age}y / {patient.sex})</div>
              <div><strong className="text-ink">Date:</strong> {patient.date}</div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono font-bold uppercase text-ink-muted">Prescribed Medicines:</p>
              {medicines.map((m, i) => (
                <div key={i} className="text-xs font-sans bg-slate-50 p-2.5 rounded-lg border">
                  <strong>{m.name}</strong> {m.strength} — {m.dose} ({m.frequency} x {m.duration})
                </div>
              ))}
            </div>

            <div className="pt-2 border-t space-y-2">
              <div className="text-xs font-mono font-bold">
                Has Problem? <span className={hasProblem ? "text-clinical-red" : "text-[#4A8B7A]"}>{hasProblem ? "YES" : "NO"}</span>
              </div>
              <div className="text-xs font-mono font-bold">
                Should Dispense? <span className={shouldDispense ? "text-[#4A8B7A]" : "text-clinical-red"}>{shouldDispense ? "DISPENSE" : "DO NOT DISPENSE"}</span>
              </div>
              <p className="text-xs text-ink-muted italic">{dispenseReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
