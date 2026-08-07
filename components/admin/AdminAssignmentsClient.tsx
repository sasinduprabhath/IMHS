"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Trash2,
  Edit,
  Download,
  User,
  BookOpen,
  Send,
  Loader2,
  X,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DateTimePicker from "@/components/ui/date-time-picker";
import { CourseSelect } from "@/components/ui/course-select";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  attachmentUrl: string | null;
  dueDate: string;
  maxMarks: number;
  allowLate: boolean;
  allowedFileTypes: string;
  course: Course;
  _count?: {
    submissions: number;
  };
}

interface Submission {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  status: string; // "SUBMITTED" | "LATE" | "GRADED"
  score: number | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy: string | null;
  submittedAt: string;
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    maxMarks: number;
    course: { id: string; title: string };
  };
  user: {
    id: string;
    name: string;
    email: string;
    studentId: string | null;
  };
}

export function AdminAssignmentsClient({ courses }: { courses: Course[] }) {
  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "ASSIGNMENTS">("SUBMISSIONS");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // New Assignment Form State
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newAllowLate, setNewAllowLate] = useState(false);
  const [newAllowedFileTypes, setNewAllowedFileTypes] = useState("PDF,DOCX,ZIP");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [createError, setCreateError] = useState("");

  // Grade Form State
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradeError, setGradeError] = useState("");

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        fetch("/api/admin/assignments"),
        fetch(`/api/admin/assignments/submissions?courseId=${selectedCourseId}&status=${selectedStatus}`),
      ]);

      if (assRes.ok) {
        const data = await assRes.json();
        setAssignments(data.assignments || []);
      }
      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error("Error loading assignments data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourseId, selectedStatus]);

  // Create Assignment Submit
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");

    if (!newCourseId || !newTitle || !newDescription || !newDueDate) {
      setCreateError("Please fill in all required fields (Course, Title, Instructions, Due Date).");
      return;
    }

    setIsSubmittingNew(true);
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: newCourseId,
          title: newTitle,
          description: newDescription,
          attachmentUrl: newAttachmentUrl || null,
          dueDate: newDueDate,
          maxMarks: newMaxMarks,
          allowLate: newAllowLate,
          allowedFileTypes: newAllowedFileTypes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewAttachmentUrl("");
        setNewDueDate("");
        fetchData();
      } else {
        setCreateError(data.error || "Failed to create assignment");
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Grade Submission Submit
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setGradeError("");

    if (gradeScore < 0 || gradeScore > selectedSubmission.assignment.maxMarks) {
      setGradeError(`Score must be between 0 and ${selectedSubmission.assignment.maxMarks}`);
      return;
    }

    setIsSubmittingGrade(true);
    try {
      const res = await fetch(`/api/admin/assignments/submissions/${selectedSubmission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: gradeScore,
          feedback: gradeFeedback,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowGradeModal(false);
        setSelectedSubmission(null);
        fetchData();
      } else {
        setGradeError(data.error || "Failed to save grade");
      }
    } catch {
      setGradeError("Network error. Please try again.");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment? All associated student submissions will be permanently deleted.")) return;

    try {
      const res = await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error("Error deleting assignment:", e);
    }
  };

  // Open Grade Modal
  const openGradeModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.score ?? sub.assignment.maxMarks);
    setGradeFeedback(sub.feedback || "");
    setGradeError("");
    setShowGradeModal(true);
  };

  // Filter Submissions by search text
  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.user.name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      (s.user.studentId && s.user.studentId.toLowerCase().includes(q)) ||
      s.assignment.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0C1A30 0%, #0E57A4 60%, #1a6fc4 100%)",
          boxShadow: "0 8px 32px rgba(14,87,164,.25)",
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-white/80 bg-white/10 border border-white/20 px-3 py-1 rounded-pill">
                <FileCheck className="w-3 h-3 text-[#F16726]" />
                Coursework Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
              Assignment & Grading Module
            </h1>
            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              Publish coursework briefs, review student file uploads, record qualitative feedback, and sync marks directly to student progress logs.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 bg-[#F16726] hover:bg-[#d95316] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 gap-2 rounded-xl px-5 py-3"
          >
            <Plus className="w-4 h-4" /> Publish Assignment
          </Button>
        </div>
      </div>

      {/* ── Tabs & Stats bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("SUBMISSIONS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === "SUBMISSIONS"
                ? "bg-white text-[#0E57A4] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#0C1A30]"
            }`}
          >
            Submissions Queue ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("ASSIGNMENTS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === "ASSIGNMENTS"
                ? "bg-white text-[#0E57A4] shadow-sm font-bold"
                : "text-[#64748B] hover:text-[#0C1A30]"
            }`}
          >
            Coursework Briefs ({assignments.length})
          </button>
        </div>

        {/* Quick Counts */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#64748B]">
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            Pending Review: {submissions.filter((s) => s.status !== "GRADED").length}
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Graded: {submissions.filter((s) => s.status === "GRADED").length}
          </span>
        </div>
      </div>

      {/* ── TAB 1: SUBMISSIONS QUEUE & GRADING ──────────────────────────── */}
      {activeTab === "SUBMISSIONS" && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search student name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4] transition-colors"
              />
            </div>

            <div>
              <CourseSelect
                courses={[{ id: "ALL", title: "All Courses" }, ...courses]}
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                placeholder="All Courses"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4] transition-colors"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted (Pending Review)</option>
                <option value="LATE">Late Submission</option>
                <option value="GRADED">Graded</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E57A4] mb-3" />
              Loading student submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No submissions found</p>
              <p className="text-xs text-slate-400">No student submissions match your current filter selection.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono uppercase text-slate-500 tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Student</th>
                      <th className="py-3.5 px-4 font-bold">Assignment & Course</th>
                      <th className="py-3.5 px-4 font-bold">Submitted Date</th>
                      <th className="py-3.5 px-4 font-bold">Status</th>
                      <th className="py-3.5 px-4 font-bold">Score</th>
                      <th className="py-3.5 px-4 font-bold">File</th>
                      <th className="py-3.5 px-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs">
                    {filteredSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        {/* Student Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0E57A4]/10 text-[#0E57A4] font-bold flex items-center justify-center shrink-0">
                              {s.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{s.user.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {s.user.studentId || s.user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assignment Info */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{s.assignment.title}</p>
                            <p className="text-[10px] font-mono text-[#0E57A4]">{s.assignment.course.title}</p>
                          </div>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                          {new Date(s.submittedAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          {s.status === "GRADED" ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Graded
                            </span>
                          ) : s.status === "LATE" ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Late
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-blue-600" /> Submitted
                            </span>
                          )}
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4 font-mono">
                          {s.score !== null ? (
                            <span className="font-bold text-slate-900 text-xs">
                              {s.score} / {s.assignment.maxMarks}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Unassigned</span>
                          )}
                        </td>

                        {/* File Link */}
                        <td className="py-4 px-4">
                          <a
                            href={s.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E57A4] hover:text-[#F16726] bg-[#0E57A4]/8 hover:bg-[#0E57A4]/15 border border-[#0E57A4]/20 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                            title={`Open ${s.fileName}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span>Open File</span>
                          </a>
                        </td>

                        {/* Grade Button */}
                        <td className="py-4 px-4 text-right">
                          <Button
                            onClick={() => openGradeModal(s)}
                            size="sm"
                            className="bg-[#0E57A4] hover:bg-[#0c4a8e] text-white font-semibold rounded-lg text-xs gap-1.5"
                          >
                            <Award className="w-3.5 h-3.5" />
                            {s.status === "GRADED" ? "Edit Grade" : "Grade Submission"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COURSEWORK BRIEFS DIRECTORY ───────────────────────────── */}
      {activeTab === "ASSIGNMENTS" && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E57A4] mb-3" />
              Loading assignment briefs...
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-4">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-700">No Coursework Briefs Published</p>
                <p className="text-xs text-slate-400 mt-1">Publish your first assignment brief to allow enrolled students to submit completed coursework.</p>
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="bg-[#0E57A4] text-white font-semibold text-xs gap-2">
                <Plus className="w-4 h-4" /> Publish Assignment Brief
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase font-bold text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-2.5 py-0.5 rounded-full">
                        {a.course.title}
                      </span>
                      <h3 className="text-base font-display font-bold text-slate-900 mt-2">{a.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{a.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-3 border-t border-[#F1F5F9] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F16726]" />
                      <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Max Marks: {a.maxMarks}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Formats: {a.allowedFileTypes}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Late Allowed: {a.allowLate ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  {a.attachmentUrl && (
                    <div className="pt-2">
                      <a
                        href={a.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E57A4] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Brief Attachment PDF
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CREATE ASSIGNMENT ──────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto touch-pan-y overscroll-contain"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-xl bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto my-auto touch-pan-y overscroll-contain"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">Publish New Assignment Brief</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enrolled students will see this coursework brief and deadline in their portal.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course *</label>
                  <CourseSelect
                    courses={courses}
                    value={newCourseId}
                    onChange={setNewCourseId}
                    placeholder="Select Target Course..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Pharmacology Case Study Assignment 1"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions & Guidelines *</label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed instructions, assessment criteria, and formatting rules..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date & Time *</label>
                    <DateTimePicker
                      value={newDueDate}
                      onChange={(isoString) => setNewDueDate(isoString)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Marks *</label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={newMaxMarks}
                      onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coursework Brief File Attachment (PDF, DOCX, ZIP)</label>
                  <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#0E57A4] transition-colors rounded-xl p-4 bg-[#F8FAFC] text-center space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.zip,.doc"
                      onChange={async (e) => {
                        const selectedFile = e.target.files?.[0];
                        if (!selectedFile) return;
                        setCreateError("");
                        setIsSubmittingNew(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", selectedFile);
                          formData.append("folder", "briefs");

                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          const data = await res.json();
                          if (res.ok && data.url) {
                            setNewAttachmentUrl(data.url);
                          } else {
                            setCreateError(data.error || "Failed to upload brief file.");
                          }
                        } catch {
                          setCreateError("Brief file upload failed. Please try again.");
                        } finally {
                          setIsSubmittingNew(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0E57A4]">
                      <FileText className="w-4 h-4" />
                      {newAttachmentUrl ? "Brief File Attached & Ready" : "Click or drag & drop to upload Brief Attachment"}
                    </div>

                    {newAttachmentUrl && (
                      <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                        {newAttachmentUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed File Formats</label>
                    <input
                      type="text"
                      placeholder="PDF,DOCX,ZIP"
                      value={newAllowedFileTypes}
                      onChange={(e) => setNewAllowedFileTypes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="allowLate"
                      checked={newAllowLate}
                      onChange={(e) => setNewAllowLate(e.target.checked)}
                      className="w-4 h-4 text-[#0E57A4] rounded border-slate-300 focus:ring-[#0E57A4]"
                    />
                    <label htmlFor="allowLate" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Allow Late Submissions
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingNew} className="bg-[#0E57A4] text-white font-semibold">
                    {isSubmittingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Assignment"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: GRADE SUBMISSION ───────────────────────────────────────── */}
      <AnimatePresence>
        {showGradeModal && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGradeModal(false)}
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
                  <h2 className="text-lg font-display font-bold text-slate-900">Grade Student Submission</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSubmission.user.name} ({selectedSubmission.user.studentId || selectedSubmission.user.email})
                  </p>
                </div>
                <button onClick={() => setShowGradeModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Assignment:</span>
                  <span className="font-semibold text-slate-900">{selectedSubmission.assignment.title}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Submitted File:</span>
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0E57A4] font-semibold underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open File ({selectedSubmission.fileName})
                  </a>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Submission Status:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSubmission.status}</span>
                </div>
              </div>

              {gradeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{gradeError}</span>
                </div>
              )}

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Score / Marks (out of {selectedSubmission.assignment.maxMarks}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={selectedSubmission.assignment.maxMarks}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold font-mono outline-none focus:border-[#0E57A4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lecturer Qualitative Feedback & Remarks</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed feedback for the student..."
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs outline-none focus:border-[#0E57A4]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                  <Button type="button" variant="outline" onClick={() => setShowGradeModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingGrade} className="bg-[#0E57A4] text-white font-semibold">
                    {isSubmittingGrade ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Grade & Feedback"}
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
