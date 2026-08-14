"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, AlertTriangle, CheckCircle2, XCircle,
  RotateCcw, BookOpen, Trophy, User, FileText, Pill, ShieldAlert, MessageSquare
} from "lucide-react";
import { ActivityShell } from "./ActivityShell";
import { FeedbackOverlay } from "./FeedbackOverlay";
import { OptionButton } from "./OptionButton";
import type { PrescriptionCase, OptionState } from "@/types/pharmacology";

const STEPS = [
  "Prescription",
  "Patient Details",
  "Medicine Details",
  "Identify Problem",
  "Pharmacist Action",
  "Counselling",
];

const STEP_ICONS = [FileText, User, Pill, ShieldAlert, CheckCircle2, MessageSquare];

interface PrescriptionReviewActivityProps {
  prescriptionCase: PrescriptionCase;
}

interface PatientAnswer {
  name: string;
  age: string;
  sex: string;
  date: string;
}

export function PrescriptionReviewActivity({ prescriptionCase }: PrescriptionReviewActivityProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);
  const [patientAnswer, setPatientAnswer] = useState<PatientAnswer>({ name: "", age: "", sex: "", date: "" });
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [problemSubmitted, setProblemSubmitted] = useState(false);
  const [hasProblemAnswer, setHasProblemAnswer] = useState<boolean | null>(null);
  const [actionAnswer, setActionAnswer] = useState<"dispense" | "do_not_dispense" | null>(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [consistencyFlag, setConsistencyFlag] = useState(false);
  const [selectedCounsellingIds, setSelectedCounsellingIds] = useState<string[]>([]);
  const [counsellingSubmitted, setCounsellingSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleExit = () => router.push("/dashboard/practice");

  const toggleProblem = (id: string) => {
    if (problemSubmitted) return;
    setSelectedProblemIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const submitProblemStep = () => {
    setProblemSubmitted(true);
    let pts = 0;
    // Score hasProblem
    if (hasProblemAnswer === prescriptionCase.hasProblem) pts += 2;
    // Score problem identification (if applicable)
    if (prescriptionCase.hasProblem && prescriptionCase.correctProblemIds) {
      const correctHits = selectedProblemIds.filter((id) => prescriptionCase.correctProblemIds!.includes(id)).length;
      const incorrectHits = selectedProblemIds.filter((id) => !prescriptionCase.correctProblemIds!.includes(id)).length;
      pts += Math.max(0, correctHits - incorrectHits) * 2;
    }
    setScore((s) => s + pts);
  };

  const submitActionStep = () => {
    setActionSubmitted(true);
    // Consistency check: if they said "no problem" but chose "do_not_dispense", flag it
    if (hasProblemAnswer === false && actionAnswer === "do_not_dispense") {
      setConsistencyFlag(true);
    }
    if (actionAnswer === prescriptionCase.expectedAction) {
      setScore((s) => s + 3);
    }
  };

  const toggleCounselling = (id: string) => {
    if (counsellingSubmitted) return;
    setSelectedCounsellingIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const submitCounselling = () => {
    setCounsellingSubmitted(true);
    const correct = selectedCounsellingIds.filter((id) => prescriptionCase.expectedCounsellingPoints.includes(id)).length;
    const incorrect = selectedCounsellingIds.filter((id) => !prescriptionCase.expectedCounsellingPoints.includes(id)).length;
    setScore((s) => s + Math.max(0, correct - incorrect));
    // Last step — complete
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      setCompleted(true);
    }
  };

  const getNextDisabled = () => {
    switch (stepIndex) {
      case 0: return false;
      case 1: return !patientAnswer.name.trim();
      case 2: return false;
      case 3: return !problemSubmitted;
      case 4: return !actionSubmitted;
      case 5: return !counsellingSubmitted;
      default: return false;
    }
  };

  const getPrescriptionImageState = () => {
    if (stepIndex < 3) return "prominent";
    return "panel";
  };

  // ── Results ────────────────────────────────────────────────────────────────
  if (completed) {
    const maxScore = 10;
    const pct = Math.round((score / maxScore) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBF3FA] via-[#F8FAFC] to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-md w-full space-y-6 text-center">
          <Trophy className="w-12 h-12 text-[#0E57A4] mx-auto" />
          <div>
            <h2 className="text-2xl font-display font-bold text-ink">Review Complete!</h2>
            <p className="text-sm text-ink-muted mt-1">Prescription Review — Case {prescriptionCase.id}</p>
          </div>
          <div className="bg-gradient-to-br from-[#EBF3FA] to-white rounded-2xl border border-[#0E57A4]/20 p-5 space-y-1">
            <div className="text-5xl font-mono font-bold text-[#0E57A4]">{score}<span className="text-xl text-ink-muted">/{maxScore}</span></div>
            <div className="text-xs font-mono text-ink-muted">{pct}% accuracy</div>
          </div>
          <div className="text-left space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-ink-muted tracking-widest">Correct Action</h3>
            <div className={`p-3 rounded-xl border text-sm font-semibold ${prescriptionCase.expectedAction === "dispense" ? "bg-[#4A8B7A]/10 border-[#4A8B7A]/30 text-[#2d6655]" : "bg-clinical-red-light border-clinical-red/30 text-clinical-red"}`}>
              {prescriptionCase.expectedAction === "dispense" ? "✓ Dispense — " : "✗ Do NOT dispense — "}
              <span className="font-normal">{prescriptionCase.dispensingReason}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/dashboard/practice/prescription-review`)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-ink hover:bg-slate-50"><RotateCcw className="w-4 h-4" /> Try Again</button>
            <button onClick={handleExit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482]"><BookOpen className="w-4 h-4" /> Practice Hub</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStep = () => {
    switch (stepIndex) {
      // ─ Step 0: Prescription Image ─────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 01 — Prescription Image</h2>
              <p className="text-sm text-ink-muted">Review the prescription carefully. Zoom in to read details clearly.</p>
            </div>
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
              {/* Zoom controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-ink hover:bg-slate-50 shadow-xs" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-ink hover:bg-slate-50 shadow-xs" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                {zoom !== 1 && <button onClick={() => setZoom(1)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-ink hover:bg-slate-50 shadow-xs text-[9px] font-mono font-bold">1:1</button>}
              </div>

              <div className="overflow-auto" style={{ maxHeight: "520px" }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease" }}>
                  {prescriptionCase.imageUrl && !imgFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={prescriptionCase.imageUrl}
                      alt={`Prescription for ${prescriptionCase.patient.name}`}
                      className="w-full object-contain"
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    /* Authentic Medical Prescription Pad Document */
                    <div className="w-full p-8 bg-[#FDFDFD] border border-slate-200 font-sans space-y-6 select-none">
                      {/* Hospital Header */}
                      <div className="flex items-center justify-between border-b-2 border-[#0E57A4] pb-4">
                        <div className="space-y-0.5">
                          <h3 className="text-lg font-display font-bold text-[#0E57A4] uppercase tracking-wider">
                            IMHS CLINICAL TEACHING HOSPITAL
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">Department of Clinical Pharmacy & Therapeutics</p>
                          <p className="text-[10px] text-slate-400 font-mono">Reg No: PH/COL/2024/0981 · Emergency: +94 11 269 1111</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center font-display font-bold text-[#0E57A4] text-xl">
                          Rx
                        </div>
                      </div>

                      {/* Patient Info Bar */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Patient Name</span><span className="font-bold text-slate-800">{prescriptionCase.patient.name}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Age / Sex</span><span className="font-bold text-slate-800">{prescriptionCase.patient.age} Yrs / {prescriptionCase.patient.sex}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span><span className="font-bold text-slate-800">{prescriptionCase.patient.date}</span></div>
                        <div><span className="text-slate-400 block text-[9px] uppercase font-bold">B.P.</span><span className="font-bold text-slate-800">145/92 mmHg</span></div>
                      </div>

                      {/* Rx Medicine List */}
                      <div className="space-y-4 pt-2">
                        <div className="text-2xl font-serif font-bold text-[#0E57A4] italic">Rx</div>
                        <div className="space-y-3 pl-4">
                          {prescriptionCase.medicines.map((m, i) => (
                            <div key={i} className="border-b border-dashed border-slate-200 pb-2 flex items-start justify-between">
                              <div>
                                <div className="text-sm font-display font-bold text-slate-900">
                                  {i + 1}. {m.name} {m.strength}
                                </div>
                                <div className="text-xs font-mono text-slate-600 pl-4 mt-0.5">
                                  Sig: {m.dose} — {m.frequency}
                                </div>
                              </div>
                              <div className="text-xs font-mono font-semibold text-slate-500">
                                M.i.t: {m.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Doctor Signature Block */}
                      <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
                        <div>Ref: CLIN-CASE-01</div>
                        <div className="text-right space-y-1">
                          <div className="font-serif italic text-sm font-bold text-slate-700">Dr. I. Wijesinghe</div>
                          <div className="text-[10px] text-slate-400">MBBS, M.Pharm (Clinical Specialist)</div>
                          <div className="text-[9px] text-slate-400">SLMC Reg: 48921</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-muted text-center font-mono">Use the +/− buttons or pinch to zoom. When ready, press Continue.</p>
          </div>
        );

      // ─ Step 1: Patient Details ─────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5 max-w-lg mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 02 — Patient Details</h2>
              <p className="text-sm text-ink-muted">Identify the following patient details from the prescription.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Patient Name", placeholder: "As written on prescription", correct: prescriptionCase.patient.name },
                { key: "age", label: "Patient Age", placeholder: "e.g. 58", correct: String(prescriptionCase.patient.age) },
                { key: "sex", label: "Sex", placeholder: "Male / Female", correct: prescriptionCase.patient.sex },
                { key: "date", label: "Prescription Date", placeholder: "YYYY-MM-DD", correct: prescriptionCase.patient.date },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">{label}</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-sans text-ink bg-white focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition-all"
                    placeholder={placeholder}
                    value={patientAnswer[key as keyof PatientAnswer]}
                    onChange={(e) => setPatientAnswer((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="bg-[#EBF3FA] rounded-xl p-3 border border-[#0E57A4]/20">
              <p className="text-xs text-[#0E57A4] font-mono">
                💡 These details verify the prescription is for the correct patient. Always confirm patient identity before dispensing.
              </p>
            </div>
          </div>
        );

      // ─ Step 2: Medicine Details ────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 03 — Medicine Details</h2>
              <p className="text-sm text-ink-muted">Review all prescribed medicines from the prescription.</p>
            </div>
            <div className="space-y-3">
              {prescriptionCase.medicines.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0E57A4]/10 flex items-center justify-center">
                      <span className="text-[10px] font-mono font-bold text-[#0E57A4]">{i + 1}</span>
                    </div>
                    <h3 className="font-display font-bold text-ink text-sm">{m.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Strength", value: m.strength },
                      { label: "Dose", value: m.dose },
                      { label: "Frequency", value: m.frequency },
                      { label: "Duration", value: m.duration },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                        <div className="text-[9px] font-mono font-bold uppercase text-ink-muted tracking-wider">{label}</div>
                        <div className="text-xs font-semibold text-ink mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ─ Step 3: Identify Problem ────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-5 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 04 — Identify the Problem</h2>
              <p className="text-sm text-ink-muted">Does this prescription have a problem that requires attention?</p>
            </div>

            {/* Yes / No */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: "Yes — There is a problem", color: "#C1443A" },
                { value: false, label: "No — Prescription is correct", color: "#4A8B7A" },
              ].map(({ value, label, color }) => {
                const isSelected = hasProblemAnswer === value;
                const showResult = problemSubmitted;
                const isCorrect = value === prescriptionCase.hasProblem;
                return (
                  <button
                    key={String(value)}
                    disabled={problemSubmitted}
                    onClick={() => !problemSubmitted && setHasProblemAnswer(value)}
                    className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 ${
                      showResult && isSelected && isCorrect ? "border-[#4A8B7A] bg-[#4A8B7A]/10 text-[#2d6655]"
                      : showResult && isSelected && !isCorrect ? "border-clinical-red bg-clinical-red-light text-clinical-red"
                      : showResult && !isSelected && isCorrect ? "border-[#4A8B7A]/50 bg-[#4A8B7A]/5 text-[#2d6655] opacity-70"
                      : isSelected ? "border-[#0E57A4] bg-[#EBF3FA] text-[#0E57A4]"
                      : "border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Problem taxonomy — only show when "Yes" selected */}
            {hasProblemAnswer === true && prescriptionCase.problemOptions && (
              <div className="space-y-2">
                <p className="text-xs font-mono font-bold uppercase text-ink-muted tracking-wider">Select the type of problem(s):</p>
                {prescriptionCase.problemOptions.map((opt, i) => {
                  const isSelected = selectedProblemIds.includes(opt.id);
                  const isCorrect = prescriptionCase.correctProblemIds?.includes(opt.id) ?? false;
                  let state: OptionState = isSelected ? "selected" : "idle";
                  if (problemSubmitted) {
                    if (isCorrect && isSelected) state = "correct";
                    else if (isCorrect && !isSelected) state = "revealed";
                    else if (!isCorrect && isSelected) state = "incorrect";
                    else state = "idle";
                  }
                  return (
                    <OptionButton
                      key={opt.id}
                      index={i}
                      label={opt.label}
                      state={state}
                      onClick={() => toggleProblem(opt.id)}
                      disabled={problemSubmitted}
                      isMultiSelect={!problemSubmitted}
                      isMultiSelected={isSelected}
                    />
                  );
                })}
              </div>
            )}

            {!problemSubmitted && hasProblemAnswer !== null && (
              <button
                onClick={submitProblemStep}
                className="w-full py-3 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors"
              >
                Submit Assessment
              </button>
            )}

            {problemSubmitted && (
              <FeedbackOverlay
                show
                isCorrect={hasProblemAnswer === prescriptionCase.hasProblem}
                correctAnswer={prescriptionCase.hasProblem ? "Yes — this prescription has a problem" : "No — this prescription is correct"}
              />
            )}
          </div>
        );

      // ─ Step 4: Pharmacist Action ──────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-5 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 05 — Pharmacist Action</h2>
              <p className="text-sm text-ink-muted">What is the correct action for this prescription?</p>
            </div>

            {/* Consistency warning */}
            {consistencyFlag && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Consistency check:</strong> You indicated no problem in Step 04, but chose "Do not dispense." A pharmacist must have documented reasons for withholding a prescription.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: "dispense" as const, label: "✓ Dispense", desc: "Prescription is correct — safe to dispense to patient", color: "#4A8B7A" },
                { value: "do_not_dispense" as const, label: "✗ Do Not Dispense", desc: "Prescription has an issue — contact prescriber before dispensing", color: "#C1443A" },
              ].map(({ value, label, desc, color }) => {
                const isSelected = actionAnswer === value;
                const isCorrect = value === prescriptionCase.expectedAction;
                return (
                  <button
                    key={value}
                    disabled={actionSubmitted}
                    onClick={() => !actionSubmitted && setActionAnswer(value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      actionSubmitted && isSelected && isCorrect ? "border-[#4A8B7A] bg-[#4A8B7A]/10"
                      : actionSubmitted && isSelected && !isCorrect ? "border-clinical-red bg-clinical-red-light"
                      : actionSubmitted && !isSelected && isCorrect ? "border-[#4A8B7A]/40 bg-[#4A8B7A]/5 opacity-70"
                      : isSelected ? "border-[#0E57A4] bg-[#EBF3FA]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className={`text-sm font-bold mb-1 ${actionSubmitted && isCorrect ? "text-[#2d6655]" : actionSubmitted && isSelected && !isCorrect ? "text-clinical-red" : "text-ink"}`}>{label}</p>
                    <p className="text-xs text-ink-muted leading-snug">{desc}</p>
                  </button>
                );
              })}
            </div>

            {!actionSubmitted && actionAnswer && (
              <button
                onClick={submitActionStep}
                className="w-full py-3 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] transition-colors"
              >
                Confirm Action
              </button>
            )}

            {actionSubmitted && (
              <div className={`p-4 rounded-xl border text-sm leading-relaxed ${actionAnswer === prescriptionCase.expectedAction ? "bg-[#4A8B7A]/10 border-[#4A8B7A]/30 text-[#2d6655]" : "bg-clinical-red-light border-clinical-red/30 text-clinical-red"}`}>
                <strong>{prescriptionCase.expectedAction === "dispense" ? "✓ Correct: Dispense" : "✗ Correct: Do Not Dispense"}</strong>
                <p className="mt-1 font-normal text-ink-muted">{prescriptionCase.dispensingReason}</p>
              </div>
            )}
          </div>
        );

      // ─ Step 5: Patient Counselling ────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5 max-w-xl mx-auto">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-display font-bold text-ink">Step 06 — Patient Counselling</h2>
              <p className="text-sm text-ink-muted">Select all appropriate counselling points to advise this patient.</p>
            </div>

            {/* Counselling options = all correct + 3 distractors */}
            {(() => {
              const distractors = [
                "Take all medicines at the same time for convenience",
                "Double the dose if you miss one",
                "Stop taking medicines once symptoms improve",
              ];
              const allOptions = [...prescriptionCase.expectedCounsellingPoints, ...distractors];
              return (
                <div className="space-y-2.5">
                  {allOptions.map((opt, i) => {
                    const isSelected = selectedCounsellingIds.includes(opt);
                    const isCorrect = prescriptionCase.expectedCounsellingPoints.includes(opt);
                    let state: OptionState = isSelected ? "selected" : "idle";
                    if (counsellingSubmitted) {
                      if (isCorrect && isSelected) state = "correct";
                      else if (isCorrect && !isSelected) state = "revealed";
                      else if (!isCorrect && isSelected) state = "incorrect";
                      else state = "idle";
                    }
                    return (
                      <OptionButton
                        key={opt}
                        index={i}
                        label={opt}
                        state={state}
                        onClick={() => toggleCounselling(opt)}
                        disabled={counsellingSubmitted}
                        isMultiSelect={!counsellingSubmitted}
                        isMultiSelected={isSelected}
                      />
                    );
                  })}
                </div>
              );
            })()}

            {!counsellingSubmitted && (
              <button
                onClick={submitCounselling}
                disabled={selectedCounsellingIds.length === 0}
                className="w-full py-3 rounded-xl bg-[#0E57A4] text-sm font-bold text-white hover:bg-[#0A4482] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit Counselling Points
              </button>
            )}

            {counsellingSubmitted && (
              <div className="bg-[#4A8B7A]/10 border border-[#4A8B7A]/30 rounded-xl p-4">
                <p className="text-sm font-bold text-[#2d6655] mb-2">Counselling Points Reviewed</p>
                <p className="text-xs text-ink-muted">Green = correct selections · Red = incorrect · outlined green = missed correct answers</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ActivityShell
      title="Prescription Review Challenge"
      subtitle={`Patient: ${prescriptionCase.patient.name}`}
      stepLabel={STEPS[stepIndex]}
      stepIndex={stepIndex}
      totalSteps={STEPS.length}
      waypoints={STEPS}
      onExit={handleExit}
      onBack={stepIndex > 0 ? () => setStepIndex((s) => s - 1) : undefined}
      onNext={handleNext}
      nextLabel={stepIndex === STEPS.length - 1 ? "Complete Review" : "Next Step"}
      nextDisabled={getNextDisabled()}
      accentColor="#0E57A4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </ActivityShell>
  );
}
