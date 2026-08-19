"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, RotateCcw, Grid, Eye, CheckCircle2,
  AlertTriangle, ArrowLeft, ArrowRight, User, Calendar, Pill,
  ChevronLeft, Sparkles, BookOpen, ShieldCheck, Trophy, Check, FileText
} from "lucide-react";
import { ConfettiCanvas } from "@/components/ui/ConfettiCanvas";

export interface PrescriptionCaseData {
  id: string;
  title: string;
  imageUrl: string;
  groundTruth: {
    patientName: string;
    patientAge: number | string;
    patientGender: string;
    rxDate: string;
    medicines: Array<{
      name: string;
      strength: string;
      dose: string;
      frequency: string;
      duration: string;
    }>;
    hasProblem: boolean;
    problemType?: string;
    shouldDispense: boolean;
    dispenseReason?: string;
    counsellingPoints: string[];
  };
}

interface StudentAnswers {
  patientName: string;
  patientAge: string;
  patientGender: string;
  rxDate: string;
  identifiedProblem: string;
  dispenseDecision: "DISPENSE" | "DO_NOT_DISPENSE" | "";
  selectedCounselling: string[];
}

export function PrescriptionSideBySideWizard({
  caseData,
}: {
  caseData: PrescriptionCaseData;
}) {
  const router = useRouter();

  // Zoom & Viewer State for Prescription Viewer
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imgFailed, setImgFailed] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [invertContrast, setInvertContrast] = useState<boolean>(false);

  // Wizard Multi-Step State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswers>({
    patientName: "",
    patientAge: "",
    patientGender: "",
    rxDate: "",
    identifiedProblem: "",
    dispenseDecision: "",
    selectedCounselling: [],
  });

  // Score & Submission State
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setShowGrid(false);
    setInvertContrast(false);
  };

  const calculateScore = () => {
    let earned = 0;
    const gt = caseData.groundTruth;

    // 1. Patient Details
    if (studentAnswers.patientName.trim().toLowerCase() === gt.patientName.trim().toLowerCase()) earned += 15;
    if (String(studentAnswers.patientAge).trim() === String(gt.patientAge).trim()) earned += 10;
    if (studentAnswers.patientGender.toLowerCase() === gt.patientGender.toLowerCase()) earned += 10;

    // 2. Problem Detection
    if (gt.hasProblem) {
      if (studentAnswers.identifiedProblem !== "No Problem Found (Valid Prescription)" && studentAnswers.identifiedProblem !== "") {
        earned += 25;
      }
    } else {
      if (studentAnswers.identifiedProblem === "No Problem Found (Valid Prescription)") {
        earned += 25;
      }
    }

    // 3. Dispensing Decision
    const expectedDecision = gt.shouldDispense ? "DISPENSE" : "DO_NOT_DISPENSE";
    if (studentAnswers.dispenseDecision === expectedDecision) {
      earned += 25;
    }

    // 4. Counselling Points
    const selectedMatches = studentAnswers.selectedCounselling.filter((c) =>
      gt.counsellingPoints.includes(c)
    ).length;
    if (gt.counsellingPoints.length > 0) {
      earned += Math.round((selectedMatches / gt.counsellingPoints.length) * 15);
    } else {
      earned += 15;
    }

    setScore(earned);
    setIsSubmitted(true);
    if (earned >= 60) {
      setShowConfetti(true);
    }

    // Save score to DB log
    fetch("/api/learning-hub/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType: "PRESCRIPTION_REVIEW",
        referenceId: `Case-${caseData.id}`,
        score: earned,
        maxScore: 100,
      }),
    }).catch((err) => console.error("Failed to save score:", err));
  };

  // ── Results View ──────────────────────────────────────────────────────────
  if (isSubmitted) {
    const isPassed = score >= 60;
    return (
      <div className="max-w-xl mx-auto space-y-5 py-4">
        <ConfettiCanvas active={showConfetti} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-6 shadow-sm"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-7 h-7 text-amber-600" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0E57A4] bg-[#EBF3FA] px-3 py-0.5 rounded-full border border-[#0E57A4]/20">
              Simulation Completed
            </span>
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              {caseData.title}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Clinical Decision Score & Rationale Review
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-1">
            <div className="text-4xl font-mono font-extrabold text-[#0E57A4]">
              {score} <span className="text-lg text-slate-400">/ 100</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 font-mono">
              {isPassed ? "🌟 Passed - Accurate Clinical Decision" : "⚠️ Needs Revision - Review Ground Truth"}
            </div>
          </div>

          {/* Clinical Ground Truth Summary */}
          <div className="text-left space-y-2 text-xs">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 space-y-1 font-sans">
              <span className="font-bold text-[11px] uppercase font-mono block">Correct Dispensing Action</span>
              <p className="font-semibold">{caseData.groundTruth.shouldDispense ? "✓ Dispense to Patient" : "✗ Do Not Dispense (Hold & Contact Prescriber)"}</p>
            </div>

            {caseData.groundTruth.dispenseReason && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1 font-sans">
                <span className="font-bold text-[11px] uppercase font-mono text-slate-500 block">Clinical Rationale</span>
                <p className="leading-relaxed">{caseData.groundTruth.dispenseReason}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                setScore(0);
                setShowConfetti(false);
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Retry Case
            </button>
            <button
              onClick={() => router.push("/dashboard/practice/prescription-review")}
              className="flex-1 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <FileText className="w-4 h-4" /> All Cases
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* ── Compact Minimal Top Header Row ──────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/practice/prescription-review"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0E57A4] bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl shadow-2xs transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cases</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="text-sm font-display font-extrabold text-slate-900 truncate">
            {caseData.title}
          </h1>
        </div>

        {/* Right Badge */}
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] px-3 py-1 rounded-full border border-[#0E57A4]/20">
          Prescription Simulation
        </span>
      </div>

      {/* ── Main Side-by-Side Split Workspace ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

        {/* ========================================================================= */}
        {/* LEFT PANEL: INTERACTIVE PRESCRIPTION IMAGE VIEWER (PACS Monitor)          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col relative min-h-[460px]">

          {/* PACS Viewer Toolbar */}
          <div className="px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0E57A4]/30 text-blue-300 font-mono font-bold border border-blue-500/20 flex items-center gap-1.5 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-blue-400" /> PACS VIEWER
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGrid((g) => !g)}
                className={`p-1.5 rounded-lg border transition ${showGrid
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                title="Toggle Reticle Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prescription Document Canvas */}
          <div className={`flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80 relative ${showGrid ? "bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" : ""
            }`}>
            <motion.div
              animate={{ scale: zoomLevel }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className={`relative max-w-full rounded-2xl overflow-hidden shadow-2xl border transition-filter duration-200 ${invertContrast ? "filter invert" : ""
                } border-white/10`}
            >
              {caseData.imageUrl && !imgFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={caseData.imageUrl}
                  alt="Prescription Review Challenge"
                  className="w-auto max-h-[500px] object-contain rounded-2xl select-none"
                  draggable={false}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                /* Authentic Medical Prescription Pad Canvas */
                <div className="w-[400px] p-6 bg-[#FAFBFD] text-slate-900 border border-slate-300 font-sans space-y-4 rounded-2xl shadow-xl select-none text-xs">
                  <div className="flex items-center justify-between border-b-2 border-[#0E57A4] pb-2.5">
                    <div>
                      <h3 className="font-display font-bold text-[#0E57A4] uppercase tracking-wider text-xs">
                        IMHS CLINICAL TEACHING HOSPITAL
                      </h3>
                      <p className="text-[9px] text-slate-500 font-mono">Department of Clinical Therapeutics</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center font-display font-extrabold text-[#0E57A4]">
                      Rx
                    </div>
                  </div>

                  <div className="bg-slate-100/90 rounded-xl p-2.5 border border-slate-200 grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Patient Name</span><span className="font-bold text-slate-900">{caseData.groundTruth.patientName}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Age / Sex</span><span className="font-bold text-slate-900">{caseData.groundTruth.patientAge}y / {caseData.groundTruth.patientGender}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span><span className="font-bold text-slate-900">{caseData.groundTruth.rxDate}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Ref No</span><span className="font-bold text-slate-900">IMHS-RX-2024</span></div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-lg font-serif font-bold text-[#0E57A4] italic">℞</div>
                    <div className="space-y-1.5 pl-2">
                      {caseData.groundTruth.medicines.map((m, idx) => (
                        <div key={idx} className="border-b border-dashed border-slate-200 pb-1 flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{idx + 1}. {m.name} {m.strength}</div>
                            <div className="text-[10px] font-mono text-slate-600">Sig: {m.dose} - {m.frequency}</div>
                          </div>
                          <div className="font-mono text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{m.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <div>SLMC Reg: #48291</div>
                    <div className="text-right italic font-serif font-bold text-slate-700">Dr. I. Wijesinghe, MBBS</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: QUESTION WIZARD                                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-between bg-white">

          <div className="space-y-4">
            {/* Step Header with Clean Interconnected Progress Bar */}
            <div className="space-y-2.5 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-display font-extrabold text-slate-900">
                  {currentStep === 1 && "Step 1 · Verify Patient Demographics"}
                  {currentStep === 2 && "Step 2 · Prescribed Medicines Review"}
                  {currentStep === 3 && "Step 3 · Clinical Problem Detection"}
                  {currentStep === 4 && "Step 4 · Pharmacist Dispensing Decision"}
                  {currentStep === 5 && "Step 5 · Patient Counselling Checklist"}
                </h2>
                <span className="text-xs font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-full border border-[#0E57A4]/20">
                  {currentStep}/5
                </span>
              </div>

              {/* Progress Step Bar */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step === currentStep
                        ? "bg-[#0E57A4]"
                        : step < currentStep
                          ? "bg-emerald-600"
                          : "bg-slate-200"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Question Forms */}
            <AnimatePresence mode="wait">

              {/* STEP 1: PATIENT DETAILS */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3.5 pt-1"
                >
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                      Patient Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter patient name as written on prescription"
                        value={studentAnswers.patientName}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, patientName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 58"
                        value={studentAnswers.patientAge}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, patientAge: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                        Gender
                      </label>
                      <select
                        value={studentAnswers.patientGender}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, patientGender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                      Prescription Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. 2024-01-15"
                        value={studentAnswers.rxDate}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, rxDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PRESCRIBED MEDICINES REVIEW */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Verify the prescribed medicines against standard therapeutic dosages:
                  </p>

                  <div className="space-y-2.5">
                    {caseData.groundTruth.medicines.map((med, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="font-bold text-[#0E57A4] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-[#0E57A4]" />
                            {idx + 1}. {med.name}
                          </span>
                          <span className="font-mono text-xs text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold">{med.strength}</span>
                        </div>
                        <div className="text-slate-600 text-[11px]">Dose: <strong className="text-slate-900 font-mono">{med.dose} - {med.frequency}</strong> ({med.duration})</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PROBLEM IDENTIFICATION */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Select the clinical issue or error in this prescription:
                  </p>

                  <div className="space-y-2 pt-1">
                    {[
                      "No Problem Found (Valid Prescription)",
                      "Incorrect Dosage / Overdose Risk",
                      "Drug-Drug Interaction Error",
                      "Patient Allergy Contraindication",
                      "Missing Duration or Signature",
                    ].map((option) => {
                      const isSelected = studentAnswers.identifiedProblem === option;
                      return (
                        <button
                          key={option}
                          onClick={() => setStudentAnswers({ ...studentAnswers, identifiedProblem: option })}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${isSelected
                              ? "bg-[#EBF3FA] border-[#0E57A4] text-[#0E57A4] shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <span>{option}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E57A4]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PHARMACIST DISPENSING DECISION */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Make your final pharmacist dispensing call:
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setStudentAnswers({ ...studentAnswers, dispenseDecision: "DISPENSE" })}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${studentAnswers.dispenseDecision === "DISPENSE"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md ring-2 ring-emerald-500/20"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      <span className="font-bold text-xs">DISPENSE</span>
                      <span className="text-[10px] font-mono text-slate-500 text-center">Safe & complete</span>
                    </button>

                    <button
                      onClick={() => setStudentAnswers({ ...studentAnswers, dispenseDecision: "DO_NOT_DISPENSE" })}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${studentAnswers.dispenseDecision === "DO_NOT_DISPENSE"
                          ? "bg-rose-50 border-rose-500 text-rose-900 shadow-md ring-2 ring-rose-500/20"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                      <AlertTriangle className="w-7 h-7 text-rose-600" />
                      <span className="font-bold text-xs">DO NOT DISPENSE</span>
                      <span className="text-[10px] font-mono text-slate-500 text-center">Withhold prescription</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: PATIENT COUNSELLING POINTS */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <p className="text-slate-600 text-xs leading-relaxed font-sans">
                    Select the counselling points to advise this patient:
                  </p>

                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                    {caseData.groundTruth.counsellingPoints.map((point) => {
                      const isSelected = studentAnswers.selectedCounselling.includes(point);
                      return (
                        <button
                          key={point}
                          onClick={() => {
                            const updated = isSelected
                              ? studentAnswers.selectedCounselling.filter((p) => p !== point)
                              : [...studentAnswers.selectedCounselling, point];
                            setStudentAnswers({ ...studentAnswers, selectedCounselling: updated });
                          }}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${isSelected
                              ? "bg-[#EBF3FA] border-[#0E57A4] text-[#0E57A4] shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <span>{point}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E57A4] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={calculateScore}
                className="px-5 py-2 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default PrescriptionSideBySideWizard;
