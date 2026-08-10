"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ActivityShell } from "./ActivityShell";
import { SAMPLE_PRESCRIPTION_CASES } from "@/data/prescriptionCases";
import { PrescriptionCase } from "@/types/pharmacology";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ZoomIn, ZoomOut, RotateCcw, CheckCircle2, XCircle, AlertTriangle,
  FileText, User, Pill, ShieldAlert, Check, Sparkles, Eye, Info
} from "lucide-react";

export function PrescriptionReviewClient() {
  const [caseIndex, setCaseIndex] = useState(0);
  const currentCase = SAMPLE_PRESCRIPTION_CASES[caseIndex] || SAMPLE_PRESCRIPTION_CASES[0];

  const [step, setStep] = useState(1); // 1 to 6
  const [zoomLevel, setZoomLevel] = useState(1);

  // Student Responses
  const [identifiedPatientName, setIdentifiedPatientName] = useState("");
  const [identifiedPatientAge, setIdentifiedPatientAge] = useState("");

  const [hasProblemInput, setHasProblemInput] = useState<boolean | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  const [dispenseActionInput, setDispenseActionInput] = useState<'dispense' | 'do_not_dispense' | null>(null);
  const [actionReasonInput, setActionReasonInput] = useState("");

  const [selectedCounsellingPoints, setSelectedCounsellingPoints] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Step Labels
  const STEP_LABELS = [
    "01. Prescription Image",
    "02. Patient Details",
    "03. Medicine Details",
    "04. Identify Problem",
    "05. Dispensing Action",
    "06. Patient Counselling",
  ];

  // Zoom Helpers
  const zoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const zoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const resetZoom = () => setZoomLevel(1);

  // Problem Checkbox Toggle
  const toggleProblemOption = (opt: string) => {
    setSelectedProblems((prev) =>
      prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]
    );
  };

  // Counselling Checkbox Toggle
  const toggleCounselling = (point: string) => {
    setSelectedCounsellingPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  // Next Step Validation
  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return true; // Patient details reviewed
    if (step === 3) return true; // Medicines reviewed
    if (step === 4) return hasProblemInput !== null;
    if (step === 5) return dispenseActionInput !== null;
    if (step === 6) return selectedCounsellingPoints.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 6) {
      setStep((s) => s + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Calculate Final Score
  const calculateScore = () => {
    let score = 0;
    const maxScore = 100;

    // Step 4 Problem Match (30 pts)
    if (hasProblemInput === currentCase.hasProblem) {
      score += 20;
    }
    if (currentCase.hasProblem && selectedProblems.length > 0) {
      const correctSelected = selectedProblems.filter((p) =>
        currentCase.problemOptions?.includes(p) && p !== "No clinical problem identified - Prescription is valid"
      ).length;
      score += Math.min(10, correctSelected * 5);
    } else if (!currentCase.hasProblem && hasProblemInput === false) {
      score += 10;
    }

    // Step 5 Dispense Action Match (40 pts)
    if (dispenseActionInput === currentCase.expectedAction) {
      score += 40;
    }

    // Step 6 Counselling Points Match (30 pts)
    const expected = currentCase.expectedCounsellingPoints;
    const correctCount = selectedCounsellingPoints.filter((p) => expected.includes(p)).length;
    const incorrectCount = selectedCounsellingPoints.filter((p) => !expected.includes(p)).length;
    const counsellingScore = Math.max(0, Math.round((correctCount / expected.length) * 30) - incorrectCount * 5);
    score += counsellingScore;

    return Math.min(maxScore, Math.max(0, score));
  };

  const restartCase = () => {
    setStep(1);
    setHasProblemInput(null);
    setSelectedProblems([]);
    setDispenseActionInput(null);
    setActionReasonInput("");
    setSelectedCounsellingPoints([]);
    setIsCompleted(false);
  };

  const switchCase = (idx: number) => {
    setCaseIndex(idx);
    restartCase();
  };

  // ── Render Completed Summary View ──
  if (isCompleted) {
    const finalScore = calculateScore();
    const passed = finalScore >= 70;

    return (
      <ActivityShell
        title="Prescription Review Challenge — Results"
        subtitle={currentCase.title}
        progress={1}
        stepLabel="Completed"
        hideFooter
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-paper border border-slate-200 space-y-6">
          <div className="text-center space-y-3 pb-6 border-b border-slate-200">
            <div className={cn(
              "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border shadow-sm",
              passed
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              {passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <span className="inline-block font-mono text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Dispensing Review Scorecard
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              {finalScore} <span className="text-slate-400 text-lg font-normal">/ 100</span>
            </h2>
            <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
              {passed
                ? "Excellent clinical review! You correctly identified the dispensing safety parameters."
                : "Good attempt! Review the clinical breakdown below to reinforce dispensing safety rules."}
            </p>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Clinical Review Breakdown
            </h3>

            {/* Step 4 Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">1. Problem Identification</span>
                <span className={hasProblemInput === currentCase.hasProblem ? "text-emerald-700 font-mono" : "text-[#C1443A] font-mono"}>
                  {hasProblemInput === currentCase.hasProblem ? "✓ Correct Identification" : "✗ Incorrect"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Expected Problem State:</strong> {currentCase.hasProblem ? "Problem Identified" : "No Problem (Valid Script)"}
              </p>
              <p className="text-xs text-slate-600">
                <strong>Clinical Notes:</strong> {currentCase.problemDescription}
              </p>
            </div>

            {/* Step 5 Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">2. Dispensing Decision</span>
                <span className={dispenseActionInput === currentCase.expectedAction ? "text-emerald-700 font-mono" : "text-[#C1443A] font-mono"}>
                  {dispenseActionInput === currentCase.expectedAction ? "✓ Correct Action (+40 pts)" : "✗ Action Missed"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong>Expected Decision:</strong>{" "}
                <span className="uppercase font-mono font-bold text-slate-900">
                  {currentCase.expectedAction === "dispense" ? "Dispense Medicine" : "Do Not Dispense"}
                </span>
              </p>
              <p className="text-xs text-slate-600">
                <strong>Pharmacist Action Reason:</strong> {currentCase.actionReason}
              </p>
            </div>

            {/* Step 6 Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">3. Patient Counselling Points</span>
                <span className="text-[#0E57A4] font-mono">
                  {selectedCounsellingPoints.filter((p) => currentCase.expectedCounsellingPoints.includes(p)).length} / {currentCase.expectedCounsellingPoints.length} Matched
                </span>
              </div>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                {currentCase.expectedCounsellingPoints.map((pt, i) => (
                  <li key={i} className={selectedCounsellingPoints.includes(pt) ? "text-emerald-700 font-medium" : "text-slate-600"}>
                    {pt} {selectedCounsellingPoints.includes(pt) ? "✓" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={restartCase}
              className="w-full sm:w-auto text-xs font-semibold rounded-xl gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry This Case
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {SAMPLE_PRESCRIPTION_CASES.map((c, idx) => (
                <Button
                  key={c.id}
                  type="button"
                  variant={caseIndex === idx ? "default" : "outline"}
                  onClick={() => switchCase(idx)}
                  className={cn(
                    "text-xs font-mono rounded-xl flex-1 sm:flex-initial",
                    caseIndex === idx ? "bg-[#0E57A4] text-white" : ""
                  )}
                >
                  Case 0{idx + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ActivityShell>
    );
  }

  // ── Main Step-by-Step Layout ──
  return (
    <ActivityShell
      title="Prescription Review Challenge"
      subtitle={currentCase.title}
      progress={step / 6}
      stepLabel={`Step ${step} of 6`}
      stepsCount={6}
      currentStepIndex={step}
      stepLabels={STEP_LABELS}
      onBack={step > 1 ? handleBack : undefined}
      onNext={handleNext}
      disableNext={!canProceed()}
      nextLabel={step === 6 ? "Finish & Review" : "Continue to Step " + (step + 1)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT PANEL: Persistent Prescription Image Viewer (Pin Panel) ── */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 shadow-paper space-y-3 sticky top-24">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase">
              <FileText className="w-4 h-4 text-[#0E57A4]" />
              <span>Prescription Audit Script</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={zoomOut}
                className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold text-slate-700">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors ml-1 border-l border-slate-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Prescription Render Frame */}
          <div className="relative h-72 sm:h-80 w-full bg-slate-900/5 rounded-2xl border border-slate-200 overflow-auto flex items-center justify-center p-2">
            <div
              className="transition-transform duration-200 origin-center bg-white p-4 rounded-xl shadow-md border border-slate-300 w-full max-w-sm space-y-3"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-start">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-sm">IMHS CLINICAL CENTER</h4>
                  <p className="text-[9px] font-mono text-slate-500">Reg: SLMC-MED-49120 · Colombo 03</p>
                </div>
                <span className="font-serif text-xl font-bold text-[#0E57A4]">℞</span>
              </div>

              <div className="text-[11px] font-mono space-y-0.5 text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                <p><strong>Patient:</strong> {currentCase.patient.name}</p>
                <p><strong>Age/Sex:</strong> {currentCase.patient.age} YRS / {currentCase.patient.sex}</p>
                <p><strong>Date:</strong> {currentCase.patient.date}</p>
              </div>

              <div className="space-y-2 text-xs font-sans text-slate-900 pt-1">
                <p className="font-mono text-[10px] text-slate-400 font-bold uppercase">Prescribed Medicines:</p>
                {currentCase.medicines.map((m, idx) => (
                  <div key={m.id} className="p-2 rounded bg-amber-50/50 border border-amber-200/60 space-y-0.5">
                    <p className="font-bold text-slate-900">{idx + 1}. {m.name} ({m.strength})</p>
                    <p className="text-[11px] text-slate-600 font-mono">Dose: {m.dose} · {m.frequency}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Duration: {m.duration}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-400">
                <span>Dr. I. Wijesinghe (MBBS, MD)</span>
                <span>Signature: Verified ✓</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono text-center">
            💡 Tip: Use zoom controls above or scroll inside box to inspect details.
          </p>
        </div>

        {/* ── RIGHT PANEL: Step-by-Step Interactive Form ── */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-paper space-y-6">
          {/* STEP 01: Prescription Overview */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 01 of 06 — Prescription Verification
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Review the Prescription Script
                </h2>
                <p className="text-xs text-slate-600">
                  Carefully examine the prescription image on the left panel. Verify legibility, prescriber details, and general structure before proceeding to patient audit.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0E57A4] space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Pharmacist Audit Instructions:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Check prescription header and date validity.</li>
                  <li>Confirm legibility of patient demographic information.</li>
                  <li>Review drug items for strength, dosage form, and frequency clarity.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 02: Patient Details */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 02 of 06 — Patient Demographics
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Verify Patient Details
                </h2>
                <p className="text-xs text-slate-600">
                  Audit the patient information identified from the prescription script.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Patient Name</span>
                  <p className="text-sm font-bold text-slate-900">{currentCase.patient.name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Age / Gender</span>
                  <p className="text-sm font-bold text-slate-900">{currentCase.patient.age} Years · {currentCase.patient.sex}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Prescription Date</span>
                  <p className="text-sm font-bold text-slate-900">{currentCase.patient.date}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Clinical Diagnosis</span>
                  <p className="text-sm font-bold text-slate-900">{currentCase.patient.diagnosis || "Not Stated"}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 03: Medicine Details */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 03 of 06 — Medicine Audit
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Review Prescribed Medicines
                </h2>
                <p className="text-xs text-slate-600">
                  Review drug name, strength, dosage form, frequency, and treatment duration for each medicine item.
                </p>
              </div>

              <div className="space-y-3">
                {currentCase.medicines.map((m, idx) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#0E57A4]">Item #{idx + 1}</span>
                      <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">
                        {m.duration}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{m.name} {m.strength}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 pt-1 border-t border-slate-200">
                      <div><strong>Dose:</strong> {m.dose}</div>
                      <div><strong>Frequency:</strong> {m.frequency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 04: Identify the Problem */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 04 of 06 — Clinical Problem Audit
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Is there any problem with this prescription?
                </h2>
                <p className="text-xs text-slate-600">
                  Evaluate drug safety, dosage limits, contraindications, and potential interactions.
                </p>
              </div>

              {/* Yes / No Choice Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setHasProblemInput(true)}
                  className={cn(
                    "p-4 rounded-2xl border text-left space-y-1 transition-all cursor-pointer",
                    hasProblemInput === true
                      ? "bg-amber-50 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-400/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">YES</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Prescription has a clinical or administrative issue.</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHasProblemInput(false);
                    setSelectedProblems([]);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border text-left space-y-1 transition-all cursor-pointer",
                    hasProblemInput === false
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs ring-2 ring-emerald-400/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">NO</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Prescription is safe, clear, and valid.</p>
                </button>
              </div>

              {/* Structured Options Taxonomy if YES */}
              {hasProblemInput === true && (
                <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in">
                  <h4 className="text-xs font-mono font-bold text-slate-900 uppercase">
                    Select Identified Clinical Problems:
                  </h4>
                  <div className="space-y-2">
                    {currentCase.problemOptions?.map((opt) => {
                      const checked = selectedProblems.includes(opt);
                      return (
                        <label
                          key={opt}
                          onClick={() => toggleProblemOption(opt)}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all select-none",
                            checked
                              ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] font-semibold"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                          )}>
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 05: Pharmacist Action */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 05 of 06 — Pharmacist Action
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Would you dispense this prescription?
                </h2>
                <p className="text-xs text-slate-600">
                  Make an appropriate professional dispensing decision based on your clinical evaluation.
                </p>
              </div>

              {/* Dispense vs Do Not Dispense Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDispenseActionInput("dispense")}
                  className={cn(
                    "p-5 rounded-2xl border text-left space-y-2 transition-all cursor-pointer",
                    dispenseActionInput === "dispense"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">DISPENSE MEDICINE</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Safe to dispense as written with appropriate counselling.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDispenseActionInput("do_not_dispense")}
                  className={cn(
                    "p-5 rounded-2xl border text-left space-y-2 transition-all cursor-pointer",
                    dispenseActionInput === "do_not_dispense"
                      ? "bg-red-50 border-[#C1443A] text-red-950 ring-2 ring-red-400/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-[#C1443A]" />
                    <span className="font-bold text-sm">DO NOT DISPENSE</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hold dispensing and contact prescribing physician for intervention.
                  </p>
                </button>
              </div>

              {/* Teachable Moment Consistency Warning */}
              {hasProblemInput === true && dispenseActionInput === "dispense" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Teachable Moment Warning:</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    You flagged a clinical problem in Step 04, but selected <strong>&ldquo;DISPENSE MEDICINE&rdquo;</strong> in Step 05. A pharmacist should not dispense a prescription with unverified dosing or contraindication issues until resolved with the doctor.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 06: Patient Counselling */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0E57A4] uppercase tracking-wider">
                  Step 06 of 06 — Patient Counselling
                </span>
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Select Patient Counselling Advice
                </h2>
                <p className="text-xs text-slate-600">
                  Identify key counselling points to communicate to the patient regarding administration, safety, and monitoring.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  ...currentCase.expectedCounsellingPoints,
                  "Stop taking medication as soon as symptoms vanish.",
                  "Double your dose if you forget a dose during the day."
                ].map((pt, i) => {
                  const checked = selectedCounsellingPoints.includes(pt);
                  return (
                    <label
                      key={i}
                      onClick={() => toggleCounselling(pt)}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                        checked
                          ? "bg-[#0E57A4]/8 border-[#0E57A4] text-[#0E57A4] font-semibold"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        checked ? "bg-[#0E57A4] border-[#0E57A4] text-white" : "border-slate-300 bg-white"
                      )}>
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{pt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ActivityShell>
  );
}
