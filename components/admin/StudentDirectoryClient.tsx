"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createPasswordResetWALink } from "@/lib/whatsapp";
import {
  Search, UserPlus, MessageCircle, KeyRound, Eye,
  Users, CheckCircle2, Copy, Check, RefreshCw, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

interface StudentItem {
  id: string;
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
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resetModalStudent, setResetModalStudent] = useState<StudentItem | null>(null);
  const [newTempPassword, setNewTempPassword] = useState("");
  const [resetSuccessLink, setResetSuccessLink] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Toolbar */}
      <div className="bg-surface border border-chart-grid rounded-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-paper">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-sage" />
          <input
            type="text"
            placeholder="Search by student name, email, or WhatsApp phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-xs text-ink focus:outline-none focus:border-clinical-teal focus:bg-white transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-sage hidden md:inline">
            Total <strong className="text-ink">{filteredStudents.length}</strong> students
          </span>
          <Link href="/admin/students/new">
            <Button className="gap-2 text-xs font-semibold bg-chart-red hover:bg-chart-red-hover text-white border-0">
              <UserPlus className="w-4 h-4" /> Onboard Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-chart-grid bg-linen/50 text-sage uppercase font-mono text-[10px]">
                <th className="p-4">Student Profile</th>
                <th className="p-4">WhatsApp & Email</th>
                <th className="p-4">Active Course Enrollments</th>
                <th className="p-4">Completed Lessons</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chart-grid/60">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sage font-mono space-y-2">
                    <Users className="w-8 h-8 mx-auto text-sage/50" />
                    <div>No student accounts matched your query &ldquo;{search}&rdquo;.</div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-linen/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-clinical-teal/15 border border-clinical-teal/30 flex items-center justify-center font-bold text-clinical-teal text-xs">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink text-sm">{st.name}</div>
                          <div className="text-[10px] font-mono text-sage">ID: {st.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-ink-muted">
                      <div className="text-xs text-ink font-sans font-medium">{st.email}</div>
                      <div className="text-[11px] text-clinical-teal font-mono">{st.phone}</div>
                    </td>

                    <td className="p-4">
                      {st.enrollments.length === 0 ? (
                        <span className="text-[10px] font-mono text-sage bg-linen px-2 py-0.5 rounded border border-chart-grid">
                          No active courses
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {st.enrollments.map((e) => (
                            <span
                              key={e.course.id}
                              title={e.course.title}
                              className="text-[10px] font-mono bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/20 px-2 py-0.5 rounded font-semibold truncate max-w-[180px]"
                            >
                              {e.course.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono text-ink">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-clinical-teal" />
                        <span className="font-bold">{st.progress.length}</span>
                        <span className="text-[10px] text-sage">lessons done</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px] gap-1"
                          onClick={() => {
                            setResetModalStudent(st);
                            setNewTempPassword("");
                            setResetSuccessLink(null);
                          }}
                        >
                          <KeyRound className="w-3 h-3 text-chart-red" />
                          <span>Reset Pass</span>
                        </Button>

                        <Link href={`/admin/students/${st.id}`}>
                          <Button size="sm" variant="default" className="h-7 px-2.5 text-[11px] gap-1 font-semibold">
                            <Eye className="w-3 h-3" />
                            <span>View Record</span>
                          </Button>
                        </Link>
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
          <div className="p-4 border-t border-chart-grid bg-linen/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="text-sage text-[11px]">
              Showing <strong className="text-ink">{startIndex + 1}</strong> to{" "}
              <strong className="text-ink">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)}
              </strong>{" "}
              of <strong className="text-ink">{filteredStudents.length}</strong> students
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

              <span className="px-3 py-1 bg-white border border-chart-grid rounded text-ink font-semibold">
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

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetModalStudent && (
          <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-chart-grid rounded-card shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-chart-grid pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-chart-red" />
                  <h3 className="text-base font-display font-semibold text-ink">
                    Reset Password: {resetModalStudent.name}
                  </h3>
                </div>
                <button
                  onClick={() => setResetModalStudent(null)}
                  className="text-sage hover:text-ink p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetSuccessLink ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded text-xs space-y-2">
                    <div className="flex items-center gap-2 text-green-700 font-bold font-mono">
                      <CheckCircle2 className="w-4 h-4" /> Password Updated Successfully
                    </div>
                    <p className="text-ink-muted">
                      New Password: <strong className="font-mono text-ink text-sm bg-white px-2 py-0.5 rounded border border-chart-grid">{newTempPassword}</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono text-sage">WhatsApp Dispatch Link:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={resetSuccessLink}
                        className="w-full text-xs font-mono bg-linen border border-chart-grid px-3 py-1.5 rounded truncate"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(resetSuccessLink)}
                        className="shrink-0 gap-1 text-xs"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <a href={resetSuccessLink} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2 bg-chart-red text-white border-0 font-semibold">
                      <MessageCircle className="w-4 h-4" /> Open WhatsApp & Send Credentials
                    </Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Generate or type a new password for <strong className="text-ink">{resetModalStudent.email}</strong>.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-ink font-medium">New Temporary Password *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newTempPassword}
                        onChange={(e) => setNewTempPassword(e.target.value)}
                        placeholder="e.g. IMHS-882910"
                        className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
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
                      className="w-full gap-1.5 text-xs font-semibold bg-chart-red text-white border-0"
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
