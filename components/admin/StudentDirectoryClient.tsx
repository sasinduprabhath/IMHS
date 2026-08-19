"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createPasswordResetWALink } from "@/lib/whatsapp";
import {
  Search,
  UserPlus,
  MessageCircle,
  KeyRound,
  Edit3,
  Users,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  IdCard,
  ShieldCheck,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";

interface StudentItem {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  enrollments: {
    course: { id: string; title: string; slug: string };
  }[];
  progress: { lessonId: string }[];
}

const ITEMS_PER_PAGE = 20;

export function StudentDirectoryClient({ initialStudents }: { initialStudents: StudentItem[] }) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Password reset modal state
  const [resetModalStudent, setResetModalStudent] = useState<StudentItem | null>(null);
  const [newTempPassword, setNewTempPassword] = useState("");
  const [resetSuccessLink, setResetSuccessLink] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit details modal state
  const [editModalStudent, setEditModalStudent] = useState<StudentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStudentId, setEditStudentId] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase())) ||
      s.phone.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleGenerateRandomPass = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "IMHS-";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTempPassword(pass);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent || !newTempPassword) return;

    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/students/${resetModalStudent.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword: newTempPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const waLink = createPasswordResetWALink(
          resetModalStudent.phone,
          resetModalStudent.name,
          resetModalStudent.email,
          newTempPassword
        );
        setResetSuccessLink(waLink);
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch {
      alert("Error resetting password");
    } finally {
      setIsResetting(false);
    }
  };

  const openEditModal = (st: StudentItem) => {
    setEditModalStudent(st);
    setEditName(st.name);
    setEditEmail(st.email);
    setEditPhone(st.phone);
    setEditStudentId(st.studentId || "");
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalStudent) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/students/${editModalStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          studentId: editStudentId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editModalStudent.id
              ? {
                  ...s,
                  name: editName,
                  email: editEmail,
                  phone: editPhone,
                  studentId: editStudentId,
                }
              : s
          )
        );
        setEditModalStudent(null);
      } else {
        alert(data.message || "Failed to update student details");
      }
    } catch {
      alert("Error updating student details");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Helper: render enrollment badges
  const renderEnrollmentBadges = (enrollments: StudentItem["enrollments"]) => {
    if (enrollments.length === 0) {
      return (
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
          No active courses
        </span>
      );
    }
    const first = enrollments[0];
    const rest = enrollments.slice(1);
    const restTitles = rest.map((e) => e.course.title).join(" | ");
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          title={first.course.title}
          className="text-[10px] font-mono bg-blue-50 text-[#0E57A4] border border-blue-200 px-2 py-0.5 rounded-md font-semibold max-w-[200px] truncate"
        >
          {first.course.title}
        </span>
        {rest.length > 0 && (
          <span
            title={restTitles}
            className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-semibold cursor-help hover:bg-slate-200 transition-colors"
          >
            +{rest.length} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* ── Search + Action Bar ── */}
      <div className="bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, Reg ID (e.g. IWPH4131), email, or phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[40px] font-sans"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs font-mono text-slate-500">
            Total <strong className="text-slate-900">{filteredStudents.length}</strong> students
          </span>
          <Link href="/admin/students/new">
            <button
              className="inline-flex items-center gap-2 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:opacity-90 min-h-[40px]"
              style={{ background: "linear-gradient(135deg, #F16726 0%, #D95316 100%)", boxShadow: "0 4px 12px rgba(241,103,38,.25)" }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Student</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Directory Content Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* 📱 Mobile Card View (screens < md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-mono space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs">No student accounts matched your query &ldquo;{search}&rdquo;.</div>
            </div>
          ) : (
            paginatedStudents.map((st) => (
              <div
                key={st.id}
                onClick={() => router.push(`/admin/students/${st.id}`)}
                className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/60 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0E57A4] text-sm shrink-0">
                      {st.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm group-hover:text-[#0E57A4] transition-colors">
                        {st.name}
                      </div>
                      <span className="inline-flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-[#0E57A4] font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <IdCard className="w-3 h-3 text-[#0E57A4] shrink-0" />
                        <span>Reg ID: {st.studentId || "PENDING"}</span>
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0E57A4] shrink-0 mt-1" />
                </div>

                <div className="text-xs font-mono space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div className="truncate text-slate-800 font-sans font-medium">{st.email}</div>
                  <div className="text-[#0E57A4] font-bold text-[11px]">{st.phone}</div>
                </div>

                {/* Course Badges */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Enrolled Programs:</div>
                  {st.enrollments.length === 0 ? (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                      No active courses
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {st.enrollments.map((e) => (
                        <span
                          key={e.course.id}
                          className="text-[10px] font-mono bg-blue-50 text-[#0E57A4] border border-blue-200 px-2 py-0.5 rounded-full font-semibold"
                        >
                          {e.course.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">{st.progress.length}</span>
                    <span className="text-slate-400 text-[10px]">lessons done</span>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 text-[11px] gap-1 border-blue-200 text-[#0E57A4] hover:bg-blue-50 font-semibold"
                      onClick={() => openEditModal(st)}
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] gap-1 text-rose-700 border-rose-200 hover:bg-rose-50"
                      onClick={() => {
                        setResetModalStudent(st);
                        setNewTempPassword("");
                        setResetSuccessLink(null);
                      }}
                    >
                      <KeyRound className="w-3 h-3 text-rose-600" /> Reset
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💻 Desktop Table View (screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase font-mono text-[10px]">
                <th className="p-4 pl-6">Student Profile &amp; Reg ID</th>
                <th className="p-4">WhatsApp &amp; Email</th>
                <th className="p-4">Active Program Enrollments</th>
                <th className="p-4">Completed Lessons</th>
                <th className="p-4 pr-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-mono space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-300" />
                    <div>No student accounts matched your query &ldquo;{search}&rdquo;.</div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => router.push(`/admin/students/${st.id}`)}
                    className="hover:bg-slate-50/70 transition-all duration-150 group cursor-pointer"
                    title="Click row to view full student profile"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0E57A4] text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-[#0E57A4] transition-colors">
                            {st.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#0E57A4] font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                              <IdCard className="w-3 h-3 text-[#0E57A4] shrink-0" />
                              <span>Reg ID: {st.studentId || "PENDING"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-xs text-slate-800 font-sans font-medium">{st.email}</div>
                      <div className="text-[11px] text-[#0E57A4] font-bold font-mono">{st.phone}</div>
                    </td>

                    <td className="p-3 max-w-[280px]">
                      {renderEnrollmentBadges(st.enrollments)}
                    </td>

                    <td className="p-4 font-mono text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold">{st.progress.length}</span>
                        <span className="text-[10px] text-slate-400">lessons done</span>
                      </div>
                    </td>

                    <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-[11px] gap-1 font-semibold border-blue-200 text-[#0E57A4] hover:bg-blue-50 shadow-xs"
                          onClick={() => openEditModal(st)}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Details</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-[11px] gap-1 border-rose-200 text-rose-700 hover:bg-rose-50 shadow-xs"
                          onClick={() => {
                            setResetModalStudent(st);
                            setNewTempPassword("");
                            setResetSuccessLink(null);
                          }}
                        >
                          <KeyRound className="w-3 h-3 text-rose-600" />
                          <span>Reset Pass</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Controls ── */}
        {filteredStudents.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="text-slate-500 text-[11px]">
              Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-slate-900">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)}
              </strong>{" "}
              of <strong className="text-slate-900">{filteredStudents.length}</strong> students
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="h-8 w-8 p-0"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs shadow-2xs">
                Page {validPage} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Student Details Modal */}
      <AnimatePresence>
        {editModalStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#0E57A4]" />
                  <h3 className="text-base font-display font-bold text-slate-900">
                    Edit Student Details
                  </h3>
                </div>
                <button
                  onClick={() => setEditModalStudent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-700 font-bold">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-700 font-bold">
                    Student Reg ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    placeholder="e.g. IWPH4131"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-700 font-bold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-700 font-bold">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setEditModalStudent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingEdit}
                    className="w-full gap-1.5 text-xs font-semibold bg-[#0E57A4] hover:bg-[#0A4482] text-white border-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetModalStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-display font-bold text-slate-900">
                    Reset Password: {resetModalStudent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setResetModalStudent(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetSuccessLink ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Password Updated Successfully
                    </div>
                    <p className="text-slate-600">
                      New Password: <strong className="font-mono text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">{newTempPassword}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono text-slate-500 font-bold">WhatsApp Dispatch Link:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={resetSuccessLink}
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl truncate"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(resetSuccessLink)}
                        className="shrink-0 gap-1 text-xs"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <a href={resetSuccessLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-semibold h-10 shadow-xs">
                      <MessageCircle className="w-4 h-4" /> Open WhatsApp &amp; Send Credentials
                    </Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generate or type a new password for <strong className="text-slate-900">{resetModalStudent.email}</strong>.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-700 font-bold">New Temporary Password *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newTempPassword}
                        onChange={(e) => setNewTempPassword(e.target.value)}
                        placeholder="e.g. IMHS-882910"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateRandomPass}
                        className="shrink-0 gap-1 text-xs font-mono"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Auto-Gen
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => setResetModalStudent(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isResetting || !newTempPassword}
                      className="w-full gap-1.5 text-xs font-semibold bg-[#0E57A4] hover:bg-[#0A4482] text-white border-0"
                    >
                      {isResetting ? "Updating..." : "Confirm & Generate Link"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
