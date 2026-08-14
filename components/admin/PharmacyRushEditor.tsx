"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Plus, Save, ArrowLeft, Check, AlertCircle, Play,
  Sparkles, CheckCircle2, Clock, X, Layers, HelpCircle
} from "lucide-react";
import {
  createPharmacyRushConfig,
  setActivePharmacyRushConfig,
} from "@/actions/pharmacy-rush-actions";
import { DRUGS } from "@/data/drugs";
import { ROUND_TOPICS } from "@/data/pharmacyRushRounds";

export interface RushRoundInput {
  roundNumber: number;
  challengeType: string;
  questionText: string;
  options: string[];
  correctOption: string;
  pointsValue?: number;
}

export interface RushConfigItem {
  id?: string;
  medicineName: string;
  isActive: boolean;
  timePerRoundSec: number;
  rounds: RushRoundInput[];
  createdAt?: Date;
}

interface PharmacyRushEditorProps {
  initialConfigs: RushConfigItem[];
  availableDrugs?: Array<{ id?: string; genericName: string; drugClass: string }>;
}

export function PharmacyRushEditor({ initialConfigs, availableDrugs }: PharmacyRushEditorProps) {
  const router = useRouter();
  const [configs, setConfigs] = useState<RushConfigItem[]>(initialConfigs);
  const drugList = availableDrugs && availableDrugs.length > 0 ? availableDrugs : DRUGS;
  const [isCustomMed, setIsCustomMed] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineName, setMedicineName] = useState("");
  const [timePerRoundSec, setTimePerRoundSec] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [rounds, setRounds] = useState<RushRoundInput[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    const defaultMed = drugList[0]?.genericName || "Amlodipine";
    setMedicineName(defaultMed);
    setTimePerRoundSec(15);
    setIsActive(true);
    setIsCustomMed(false);
    generateRoundsForMedicine(defaultMed);
    setError(null);
    setIsModalOpen(true);
  };

  const generateRoundsForMedicine = (medName: string) => {
    const targetDrug = drugList.find((d) => d.genericName.toLowerCase() === medName.toLowerCase());

    const generated: RushRoundInput[] = ROUND_TOPICS.map((topic, idx) => {
      let qText = `What is the primary ${topic.label} for ${medName}?`;
      let correct = targetDrug ? targetDrug.drugClass : `Standard ${topic.label}`;
      let opts = [correct, "Alternative Option A", "Alternative Option B", "Alternative Option C"];

      if (idx === 0) {
        qText = `Identify the primary Pharmacological Class of ${medName}:`;
        correct = targetDrug?.drugClass || "Therapeutic Clinical Agent";
        opts = [correct, "Beta-1 Adrenergic Blocker", "Thiazide Diuretic", "Angiotensin Receptor Blocker"];
      } else if (idx === 1) {
        qText = `What is the main FDA-approved Clinical Indication for ${medName}?`;
        correct = targetDrug?.genericName === "Metformin" ? "Type 2 Diabetes Mellitus" : `Approved Clinical Indication for ${medName}`;
        opts = [correct, "Acute Bronchospasm", "Bacterial Meningitis", "Rheumatoid Arthritis"];
      } else if (idx === 2) {
        qText = `Which Mechanism of Action best describes ${medName}?`;
        correct = (targetDrug as any)?.mechanismOfAction || `Pharmacological action mechanism for ${medName}.`;
        opts = [correct, "Inhibits bacterial cell wall synthesis", "Blocks histamine H2 receptors", "Inhibits Na-K-2Cl cotransporter"];
      } else if (idx === 5) {
        qText = `Which recognized side effect is associated with ${medName}?`;
        correct = (targetDrug as any)?.commonSideEffects?.[0] || (targetDrug as any)?.sideEffects?.[0] || `Common side effect of ${medName}`;
        opts = [correct, "Tendon Rupture", "Ototoxicity", "Lactic Acidosis"];
      } else if (idx === 7) {
        qText = `What key Counselling Point should be given to a patient taking ${medName}?`;
        correct = `Follow prescribed dosing regimen for ${medName}; report adverse reactions.`;
        opts = ["Take only with high-fat meals", "Avoid exposure to sunlight", "Store strictly at -20°C"];
      }

      return {
        roundNumber: idx + 1,
        challengeType: topic.topic,
        questionText: qText,
        options: opts,
        correctOption: correct,
        pointsValue: 10,
      };
    });

    setRounds(generated);
  };

  const [fetchingAiRounds, setFetchingAiRounds] = useState(false);

  const handleAiGenerateRounds = async () => {
    if (!medicineName.trim()) return;

    setFetchingAiRounds(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generate-arcade-rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName: medicineName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate arcade rounds via AI.");
      }

      if (Array.isArray(data.rounds) && data.rounds.length === 10) {
        setRounds(data.rounds);
        setSuccessMsg(`Gemini AI generated 10 custom arcade rounds for ${medicineName}!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate arcade rounds via AI.");
    } finally {
      setFetchingAiRounds(false);
    }
  };

  const handleMedicineChange = (newMed: string) => {
    setMedicineName(newMed);
    generateRoundsForMedicine(newMed);
  };

  const updateRound = (index: number, field: keyof RushRoundInput, value: any) => {
    setRounds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateRoundOption = (roundIdx: number, optionIdx: number, value: string) => {
    setRounds((prev) => {
      const next = [...prev];
      const newOpts = [...next[roundIdx].options];
      newOpts[optionIdx] = value;
      // If updating index 0 (correct answer), also update correctOption
      const isCorrectOption = optionIdx === 0;
      next[roundIdx] = {
        ...next[roundIdx],
        options: newOpts,
        correctOption: isCorrectOption ? value : next[roundIdx].correctOption,
      };
      return next;
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError("Please specify a medicine name.");
      return;
    }

    if (rounds.length < 10) {
      setError("Pharmacy Rush requires exactly 10 sequential rounds.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        medicineName: medicineName.trim(),
        timePerRoundSec,
        isActive,
        rounds,
      };

      const res = await createPharmacyRushConfig(payload);
      if (!res.success) throw new Error(res.error);

      setConfigs((prev) => [res.config as any, ...prev]);
      setSuccessMsg(`Successfully created Arcade Game Config for ${medicineName}!`);
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to create arcade game config.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id?: string, name?: string) => {
    if (!id) return;
    try {
      const res = await setActivePharmacyRushConfig(id);
      if (!res.success) throw new Error(res.error);

      setConfigs((prev) =>
        prev.map((c) => ({ ...c, isActive: c.id === id }))
      );
      setSuccessMsg(`"${name}" is now the active Arcade Game featured in Activity 04!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to set active arcade game.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#F16726] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
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
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Activity 04 Arcade CMS
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 text-white px-3 py-0.5 rounded-full border border-white/20">
                  {configs.length} Arcade Game Configs
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                Pharmacy Rush Arcade Configurator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-2xl bg-white text-[#F16726] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4 text-[#F16726]" /> Create Custom Arcade Game
            </button>
          </div>
        </div>

        <p className="text-xs font-mono text-white/80 pt-2 border-t border-white/10">
          Activity 04 runs a 15-second per round rapid-fire arcade game across 10 sequential clinical topics.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 10-Round Structure Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#F16726]" /> Standard 10-Round Arcade Challenge Sequence
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ROUND_TOPICS.map((r, idx) => (
            <div key={r.topic} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#F16726] bg-[#F16726]/10 px-2 py-0.5 rounded-full">
                Round {idx + 1}
              </span>
              <div className="text-xs font-display font-bold text-slate-900 truncate">{r.label}</div>
              <div className="text-[9px] font-mono text-slate-400">15s Clock</div>
            </div>
          ))}
        </div>
      </div>

      {/* Configured Arcade Games */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-slate-900">
          Configured Pharmacy Rush Arcade Games
        </h2>

        {configs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
            <Zap className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-display font-bold text-slate-800">No Custom Arcade Configs Created</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create custom 10-round arcade questions for any medicine in the IMHS syllabus.
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-[#F16726] hover:bg-[#D95316] text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Arcade Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((cfg) => (
              <div
                key={cfg.id || cfg.medicineName}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-2xs transition ${
                  cfg.isActive ? "border-[#F16726] ring-2 ring-[#F16726]/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold text-slate-900 text-lg">
                        {cfg.medicineName}
                      </span>
                      {cfg.isActive && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      10 Rounds · {cfg.timePerRoundSec}s Countdown
                    </p>
                  </div>

                  {!cfg.isActive && (
                    <button
                      onClick={() => handleSetActive(cfg.id, cfg.medicineName)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
                    >
                      Set Active
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Rounds: {cfg.rounds?.length || 10}</span>
                  <a
                    href={`/dashboard/practice/pharmacy-rush?drug=${encodeURIComponent(cfg.medicineName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0E57A4] font-bold hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Play Arcade
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Arcade Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[88vh] shadow-2xl animate-fade-in my-auto overflow-hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#F16726]">
                  Activity 04 Arcade Builder
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Configure 10-Round Pharmacy Rush Game
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                      Select Medicine Profile *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMed(!isCustomMed)}
                      className="text-[10px] font-mono text-[#F16726] font-bold hover:underline"
                    >
                      {isCustomMed ? "Select Existing Profile" : "+ Enter Custom Name"}
                    </button>
                  </div>

                  {isCustomMed ? (
                    <input
                      type="text"
                      value={medicineName}
                      onChange={(e) => handleMedicineChange(e.target.value)}
                      placeholder="Type custom generic medicine name..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#F16726] outline-none font-bold bg-white"
                      required
                    />
                  ) : (
                    <select
                      value={medicineName}
                      onChange={(e) => handleMedicineChange(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#F16726] outline-none bg-white font-bold"
                    >
                      {drugList.map((d) => (
                        <option key={d.id || d.genericName} value={d.genericName}>
                          {d.genericName} ({d.drugClass})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                    Round Timer (Sec)
                  </label>
                  <input
                    type="number"
                    value={timePerRoundSec}
                    onChange={(e) => setTimePerRoundSec(Number(e.target.value))}
                    min={5}
                    max={60}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#F16726] outline-none font-bold"
                  />
                </div>
              </div>

              {/* 10 Rounds Accordion / Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-display font-bold text-slate-900">
                    10 Sequential Round Questions & Answers
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAiGenerateRounds}
                      disabled={fetchingAiRounds || !medicineName.trim()}
                      className="text-xs font-mono font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {fetchingAiRounds ? "AI Generating..." : "AI Auto-Generate 10 Rounds"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {rounds.map((r, rIdx) => (
                    <div
                      key={r.roundNumber}
                      className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#F16726] bg-[#F16726]/10 px-2.5 py-0.5 rounded-full">
                          Round {r.roundNumber}: {ROUND_TOPICS[rIdx]?.label || `Topic ${r.roundNumber}`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                          Question Statement
                        </label>
                        <input
                          type="text"
                          value={r.questionText}
                          onChange={(e) => updateRound(rIdx, "questionText", e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#F16726] outline-none font-medium"
                          required
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {r.options.map((opt, optIdx) => (
                          <div key={optIdx} className="space-y-1">
                            <label className={`text-[9px] font-mono font-bold uppercase ${optIdx === 0 ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}>
                              {optIdx === 0 ? "✓ Option 1 (CORRECT ANSWER)" : `Distractor Option ${optIdx + 1}`}
                            </label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateRoundOption(rIdx, optIdx, e.target.value)}
                              className={`w-full text-xs p-2 rounded-xl border outline-none ${
                                optIdx === 0
                                  ? "border-emerald-300 bg-emerald-50/50 font-semibold text-emerald-900"
                                  : "border-slate-200 bg-white"
                              }`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                  className="px-6 py-2.5 rounded-xl bg-[#F16726] hover:bg-[#D95316] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving Arcade Game..." : "Save Arcade Game Config"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
