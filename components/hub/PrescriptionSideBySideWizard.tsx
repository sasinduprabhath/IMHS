"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  FileText,
  BookOpen,
  ChevronLeft,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export function PrescriptionSideBySideWizard({ caseData }: { caseData: PrescriptionCaseData }) {
  const router = useRouter();

  // Zoom State for Prescription Viewer
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  // Wizard Step State (1: Patient, 2: Medicines, 3: Problem, 4: Dispense, 5: Counselling)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Student Input State
  const [studentAnswers, setStudentAnswers] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "",
    rxDate: "",
    identifiedProblem: "",
    dispenseDecision: "" as "DISPENSE" | "DO_NOT_DISPENSE" | "",
    selectedCounselling: [] as string[],
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Handle Zoom
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  const calculateScore = () => {
    let pts = 0;
    const gt = caseData.groundTruth;

    // Step 1: Patient details match
    if (studentAnswers.patientName.trim().toLowerCase().includes(gt.patientName.toLowerCase().slice(0, 3))) {
      pts += 2;
    }

    // Step 3: Problem Identification match
    const problemMatched =
      (!gt.hasProblem && studentAnswers.identifiedProblem.includes("No Problem")) ||
      (gt.hasProblem && studentAnswers.identifiedProblem !== "No Problem Found (Valid Prescription)");
    if (problemMatched) pts += 2;

    // Step 4: Dispense Decision
    const expectedActionStr = gt.shouldDispense ? "DISPENSE" : "DO_NOT_DISPENSE";
    if (studentAnswers.dispenseDecision === expectedActionStr) pts += 3;

    // Step 5: Counselling points match
    const correctPoints = studentAnswers.selectedCounselling.filter((p) =>
      gt.counsellingPoints.includes(p)
    ).length;
    pts += Math.min(3, correctPoints);

    setScore(pts);
    setIsSubmitted(true);
  };

  // ── Results Screen ──────────────────────────────────────────────────────────
  if (isSubmitted) {
    const maxScore = 10;
    const pct = Math.round((score / maxScore) * 100);
    const gt = caseData.groundTruth;

    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full space-y-6 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-[#0E57A4]" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Case Review Complete!</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">{caseData.title}</p>
          </div>

          <div className="bg-gradient-to-br from-[#EBF3FA] to-white rounded-2xl border border-[#0E57A4]/20 p-5 space-y-1">
            <div className="text-5xl font-mono font-bold text-[#0E57A4]">
              {score}<span className="text-xl text-slate-400">/{maxScore}</span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-600">{pct}% Accuracy Rating</div>
          </div>

          <div className="text-left space-y-3 text-xs">
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
              <div className="font-mono text-[10px] uppercase font-bold text-slate-400">Clinical Ground Truth Action</div>
              <div className={`font-bold text-sm ${gt.shouldDispense ? "text-[#4A8B7A]" : "text-[#C1443A]"}`}>
                {gt.shouldDispense ? "✓ DISPENSE" : "✗ DO NOT DISPENSE"}
              </div>
              {gt.dispenseReason && (
                <p className="text-slate-600 font-sans leading-relaxed mt-1">{gt.dispenseReason}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1">
              <div className="font-mono text-[10px] uppercase font-bold text-slate-400">Recorded Patient Information</div>
              <div className="font-mono text-slate-800">{gt.patientName} · {gt.patientAge}y / {gt.patientGender} · Date: {gt.rxDate}</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(1);
                setScore(0);
              }}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Retry Case
            </button>
            <button
              onClick={() => router.push("/dashboard/practice")}
              className="flex-1 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> Practice Hub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <button
            onClick={() => router.push("/dashboard/practice")}
            className="text-xs font-mono font-bold text-[#0E57A4] hover:underline flex items-center gap-1 mb-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Practice Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F16726] bg-[#F16726]/10 px-2.5 py-0.5 rounded-full border border-[#F16726]/20">
              Activity 01: Prescription Review
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mt-1">
            {caseData.title}
          </h1>
        </div>
      </div>

      {/* Main Side-by-Side Split Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* ========================================================================= */}
        {/* LEFT PANEL: INTERACTIVE PRESCRIPTION IMAGE VIEWER (PACS Monitor Styling)  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col relative min-h-[420px]">

          {/* Controls Header */}
          <div className="p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#0E57A4]/40 text-blue-300 text-xs font-mono font-bold border border-blue-500/30 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" /> Rx IMAGE VIEWER
              </span>
              <span className="text-slate-400 text-xs font-mono">Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prescription Document Canvas */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/60 cursor-grab active:cursor-grabbing">
            <motion.div
              animate={{ scale: zoomLevel }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="relative max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              {caseData.imageUrl && !imgFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={caseData.imageUrl}
                  alt="Prescription Review Challenge"
                  className="w-auto max-h-[520px] object-contain rounded-2xl select-none"
                  draggable={false}
                  onError={() => setImgFailed(true)}
                />
              ) : (
                /* Authentic Medical Prescription Pad Document Canvas */
                <div className="w-[440px] p-6 bg-[#FAFBFD] text-slate-900 border border-slate-300 font-sans space-y-4 rounded-2xl shadow-xl select-none">
                  <div className="flex items-center justify-between border-b-2 border-[#0E57A4] pb-3">
                    <div>
                      <h3 className="text-sm font-display font-bold text-[#0E57A4] uppercase tracking-wider">
                        IMHS CLINICAL TEACHING HOSPITAL
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">Department of Clinical Therapeutics</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#0E57A4]/10 border border-[#0E57A4]/20 flex items-center justify-center font-display font-bold text-[#0E57A4] text-base">
                      Rx
                    </div>
                  </div>

                  <div className="bg-slate-100/80 rounded-lg p-2.5 border border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Patient Name</span><span className="font-bold text-slate-900">{caseData.groundTruth.patientName}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Age / Sex</span><span className="font-bold text-slate-900">{caseData.groundTruth.patientAge}y / {caseData.groundTruth.patientGender}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span><span className="font-bold text-slate-900">{caseData.groundTruth.rxDate}</span></div>
                    <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Ref No</span><span className="font-bold text-slate-900">CLIN-2024</span></div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-lg font-serif font-bold text-[#0E57A4] italic">Rx</div>
                    <div className="space-y-1.5 pl-3">
                      {caseData.groundTruth.medicines.map((m, idx) => (
                        <div key={idx} className="border-b border-dashed border-slate-200 pb-1 flex items-start justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{idx + 1}. {m.name} {m.strength}</div>
                            <div className="text-[10px] font-mono text-slate-600 pl-2">Sig: {m.dose} — {m.frequency}</div>
                          </div>
                          <div className="font-mono text-slate-500 text-[10px]">{m.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <div>IMHS Medical Systems</div>
                    <div className="text-right italic font-serif font-bold text-slate-700 text-xs">Dr. I. Wijesinghe, MBBS</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: SIDE-BY-SIDE QUESTION WIZARD                                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">

          <div>
            {/* Step Header */}
            <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E57A4]">
                  Step {currentStep} of 5
                </span>
                <h2 className="text-lg font-display font-bold text-slate-900 mt-0.5">
                  {currentStep === 1 && "Step 01: Verify Patient Details"}
                  {currentStep === 2 && "Step 02: Review Prescribed Medicines"}
                  {currentStep === 3 && "Step 03: Identify Clinical Problem"}
                  {currentStep === 4 && "Step 04: Pharmacist Action"}
                  {currentStep === 5 && "Step 05: Patient Counselling Points"}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {currentStep}/5
              </span>
            </div>

            {/* Progress Step Pills */}
            <div className="flex items-center gap-1.5 mb-6">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    step === currentStep
                      ? "bg-[#0E57A4] shadow-xs"
                      : step < currentStep
                      ? "bg-[#4A8B7A]"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Step Question Forms */}
            <AnimatePresence mode="wait">

              {/* STEP 1: PATIENT DETAILS */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Inspect the prescription document on the left and enter the patient details as written:
                  </p>

                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                        Patient Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kumari Perera"
                        value={studentAnswers.patientName}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, patientName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 58"
                          value={studentAnswers.patientAge}
                          onChange={(e) => setStudentAnswers({ ...studentAnswers, patientAge: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono font-bold text-slate-700 uppercase block mb-1">
                          Gender
                        </label>
                        <select
                          value={studentAnswers.patientGender}
                          onChange={(e) => setStudentAnswers({ ...studentAnswers, patientGender: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition-all"
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
                      <input
                        type="text"
                        placeholder="e.g. 2024-01-15"
                        value={studentAnswers.rxDate}
                        onChange={(e) => setStudentAnswers({ ...studentAnswers, rxDate: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/20 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PRESCRIBED MEDICINES REVIEW */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Verify the prescribed medicines, strength, dose, and duration:
                  </p>

                  <div className="space-y-3">
                    {caseData.groundTruth.medicines.map((med, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="font-bold text-[#0E57A4] text-sm flex items-center justify-between">
                          <span>{idx + 1}. {med.name}</span>
                          <span className="font-mono text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{med.strength}</span>
                        </div>
                        <div className="text-slate-600">Dose & Frequency: <span className="text-slate-900 font-mono font-bold">{med.dose} — {med.frequency}</span></div>
                        <div className="text-slate-600">Duration: <span className="text-slate-900 font-mono font-bold">{med.duration}</span></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PROBLEM IDENTIFICATION */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Select the clinical problem or error identified in this prescription:
                  </p>

                  <div className="space-y-2.5 pt-1">
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
                          className={`w-full p-3.5 rounded-xl border-2 text-left text-xs font-bold transition flex items-center justify-between ${
                            isSelected
                              ? "bg-[#0E57A4]/10 border-[#0E57A4] text-[#0E57A4]"
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
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Based on your clinical review, select your dispensing decision:
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => setStudentAnswers({ ...studentAnswers, dispenseDecision: "DISPENSE" })}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                        studentAnswers.dispenseDecision === "DISPENSE"
                          ? "bg-[#4A8B7A]/12 border-[#4A8B7A] text-[#2d6655] shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <CheckCircle2 className="w-8 h-8 text-[#4A8B7A]" />
                      <span className="font-bold text-sm">DISPENSE</span>
                    </button>

                    <button
                      onClick={() => setStudentAnswers({ ...studentAnswers, dispenseDecision: "DO_NOT_DISPENSE" })}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
                        studentAnswers.dispenseDecision === "DO_NOT_DISPENSE"
                          ? "bg-clinical-red-light border-clinical-red text-clinical-red shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <AlertTriangle className="w-8 h-8 text-clinical-red" />
                      <span className="font-bold text-sm">DO NOT DISPENSE</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: PATIENT COUNSELLING POINTS */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Select essential counselling advice points to provide to the patient:
                  </p>

                  <div className="space-y-2 pt-1">
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
                          className={`w-full p-3.5 rounded-xl border-2 text-left text-xs font-semibold transition flex items-center justify-between ${
                            isSelected
                              ? "bg-[#0E57A4]/10 border-[#0E57A4] text-[#0E57A4]"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{point}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0E57A4]" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={calculateScore}
                className="px-6 py-2.5 rounded-xl bg-[#F16726] hover:bg-[#D95316] text-white text-xs font-bold transition shadow-md"
              >
                Submit Case Review
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default PrescriptionSideBySideWizard;
