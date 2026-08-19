"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Upload,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Download,
  ShieldCheck,
  Loader2,
  MessageSquare,
  Sparkles,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  attachmentUrl: string | null;
  dueDate: string;
  maxMarks: number;
  allowLate: boolean;
  allowedFileTypes: string;
  course: { id: string; title: string; slug: string };
  chapter?: { id: string; title: string } | null;
  status: string; // "PENDING" | "SUBMITTED" | "LATE" | "GRADED" | "CLOSED" | "OVERDUE"
  submission: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number | null;
    submittedAt: string;
    status: string;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
    gradedBy: string | null;
  } | null;
}

export function StudentAssignmentsClient({ courseId }: { courseId?: string }) {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmitAssignment, setActiveSubmitAssignment] = useState<AssignmentItem | null>(null);

  // Upload Form State
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const url = courseId
        ? `/api/student/assignments?courseId=${courseId}`
        : `/api/student/assignments`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error("Error loading student assignments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const handleOpenSubmit = (a: AssignmentItem) => {
    setActiveSubmitAssignment(a);
    setFileUrl(a.submission?.fileUrl || "");
    setFileName(a.submission?.fileName || "");
    setFileSize(a.submission?.fileSize || undefined);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAssignment) return;
    setSubmitError("");
    setSubmitSuccess("");

    if (!fileUrl.trim() || !fileName.trim()) {
      setSubmitError("Please provide both the File Name and File Storage URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Single Device Verification fingerprint
      const deviceFingerprint =
        typeof window !== "undefined"
          ? window.navigator.userAgent.split(" ").slice(0, 3).join("_")
          : undefined;

      const res = await fetch(`/api/student/assignments/${activeSubmitAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          fileName,
          fileSize: fileSize || 0,
          deviceFingerprint,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(data.message || "Assignment submitted successfully!");
        setTimeout(() => {
          setActiveSubmitAssignment(null);
          fetchAssignments();
        }, 1200);
      } else {
        setSubmitError(data.error || "Failed to submit assignment.");
      }
    } catch {
      setSubmitError("Network error. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E57A4] mb-3" />
        Loading course assignments & worksheets...
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-3">
        <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-semibold text-slate-700">No Coursework Briefs Available</p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Your instructors have not published any pending assignments or worksheets for this course yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header Widget ── */}
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 p-7 sm:p-8 text-white space-y-2 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #093972 0%, #0E57A4 45%, #1868c2 80%, #0c4887 100%)",
          boxShadow: "0 12px 36px rgba(14,87,164,.35), 0 4px 12px rgba(14,87,164,.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold text-white/90 bg-white/15 border border-white/25 px-3 py-0.5 rounded-full shadow-xs">
            Coursework Portal
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">Assignments &amp; Worksheets Hub</h2>
        <p className="text-xs sm:text-sm text-white/80 max-w-3xl leading-relaxed">
          Download coursework briefs, submit completed assignments from your authenticated device, and view live marks &amp; qualitative feedback.
        </p>
      </div>

      {/* ── Assignment Cards Grid ── */}
      <div className="grid grid-cols-1 gap-6">
        {assignments.map((a) => {
          const isPastDue = new Date() > new Date(a.dueDate);
          const isGraded = a.status === "GRADED" && a.submission?.score !== null;

          const cleanCourseTitle = a.course.title
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\/g, "");

          return (
            <div
              key={a.id}
              className="bg-white border-2 border-[#E2E8F0] hover:border-[#0E57A4]/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Top Row: Course Title & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-3 py-0.5 rounded-full">
                    {cleanCourseTitle}
                  </span>
                  <h3 className="text-base sm:text-xl font-display font-bold text-slate-900 mt-1">{a.title}</h3>
                </div>

                {/* Live Status Badges */}
                <div className="shrink-0">
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      GRADED · {a.submission?.score} / {a.maxMarks}
                    </span>
                  ) : a.status === "SUBMITTED" ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Submitted · Pending Review
                    </span>
                  ) : a.status === "LATE" ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Late Submission
                    </span>
                  ) : a.status === "CLOSED" ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Submission Closed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 text-slate-500" />
                      Pending Submission
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions & Guidelines */}
              {a.description && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1]/60 p-4 sm:p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <FileText className="w-4 h-4 text-[#0E57A4]" />
                    Coursework Instructions &amp; Guidelines
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans pl-6">
                    {a.description.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\/g, "")}
                  </div>
                </div>
              )}

              {/* Specs & Due Date Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] text-[11px] font-mono text-slate-600">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Due Date:</span>
                  <span className={`font-semibold ${isPastDue ? "text-amber-600 font-bold" : "text-slate-800"}`}>
                    {new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Max Marks:</span>
                  <span className="font-semibold text-slate-800">{a.maxMarks} Points</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Allowed Files:</span>
                  <span className="font-semibold text-slate-800">{a.allowedFileTypes}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Late Submissions:</span>
                  <span className="font-semibold text-slate-800">{a.allowLate ? "Allowed" : "Locked"}</span>
                </div>
              </div>

              {/* Brief Attachment & Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                {a.attachmentUrl ? (
                  <a
                    href={a.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0E57A4] hover:bg-[#0c4a8e] px-4 py-2.5 rounded-2xl transition-all shadow-xs hover:shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" /> View Coursework Brief
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No external brief file attached</span>
                )}

                {/* Submission Action */}
                {a.status !== "CLOSED" && (
                  <Button
                    onClick={() => handleOpenSubmit(a)}
                    className="bg-[#0E57A4] hover:bg-[#0c4a8e] text-white font-bold text-xs gap-2 rounded-2xl px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    {a.submission ? "Re-submit / Update File" : "Submit Assignment"}
                  </Button>
                )}
              </div>

              {/* ── STUDENT SUBMISSION DETAILS CARD ── */}
              {a.submission && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FileCheck className="w-4 h-4 text-[#0E57A4]" />
                      Your Submitted Coursework
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      Submitted on: {new Date(a.submission.submittedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0]">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{a.submission.fileName}</p>
                      <p className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Stored & Linked to Student Record
                      </p>
                    </div>

                    <a
                      href={a.submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0E57A4] hover:bg-[#0c4a8e] px-3.5 py-2 rounded-xl transition-all shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Submitted File
                    </a>
                  </div>
                </div>
              )}

              {/* ── GRADED FEEDBACK SECTION ── */}
              {isGraded && a.submission && (
                <div className="bg-emerald-500/8 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-sm">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Lecturer Assessment & Feedback
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-700">
                      Score: {a.submission.score} / {a.maxMarks} ({Math.round((a.submission.score! / a.maxMarks) * 100)}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round((a.submission.score! / a.maxMarks) * 100)}%` }}
                    />
                  </div>

                  {a.submission.feedback && (
                    <div className="bg-white/80 p-4 rounded-xl border border-emerald-200/60 text-xs text-slate-800 leading-relaxed font-sans space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 block">
                        Instructor Notes ({a.submission.gradedBy || "Lecturer"}):
                      </span>
                      <p className="italic">"{a.submission.feedback}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── MODAL: SUBMIT ASSIGNMENT ────────────────────────────────────── */}
      <AnimatePresence>
        {activeSubmitAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSubmitAssignment(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900">Submit Assignment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeSubmitAssignment.title}</p>
                </div>
                <button onClick={() => setActiveSubmitAssignment(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Allowed Device Verification Notice */}
              <div className="bg-[#0E57A4]/8 border border-[#0E57A4]/20 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-[#0E57A4]">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#0E57A4]" />
                <div>
                  <span className="font-bold block">Authenticated Allowed Device Access</span>
                  <span className="text-[11px] opacity-90 leading-tight block mt-0.5">
                    Your assignment submission is verified against your active student portal account and registered device.
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Direct File Uploader Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Upload Completed File (PDF, DOCX, ZIP) *
                  </label>
                  <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#0E57A4] transition-colors rounded-2xl p-6 bg-[#F8FAFC] text-center space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.zip,.doc"
                      onChange={async (e) => {
                        const selectedFile = e.target.files?.[0];
                        if (!selectedFile) return;
                        setSubmitError("");
                        setIsSubmitting(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", selectedFile);
                          formData.append("folder", "submissions");

                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          const data = await res.json();
                          if (res.ok && data.url) {
                            setFileUrl(data.url);
                            setFileName(data.fileName);
                            setFileSize(selectedFile.size);
                          } else {
                            setSubmitError(data.error || "Failed to upload file.");
                          }
                        } catch {
                          setSubmitError("File upload failed. Please try again.");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    <div className="w-12 h-12 bg-[#0E57A4]/10 text-[#0E57A4] rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {fileName ? fileName : "Click or drag & drop file to upload"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Allowed formats: <strong className="text-slate-600">{activeSubmitAssignment.allowedFileTypes}</strong> (Max 50MB)
                      </p>
                    </div>

                    {fileUrl && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        File Ready for Submission
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignment Title / File Identifier *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John_Doe_Pharmacology_Assignment1.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                  <Button type="button" variant="outline" onClick={() => setActiveSubmitAssignment(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !fileUrl} className="bg-[#0E57A4] text-white font-semibold">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Submission"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
