"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VitalLine } from "@/components/ui/vital-line";
import { CustomSelect } from "@/components/ui/custom-select";
import { createPasswordResetWALink, formatPhoneForWhatsApp } from "@/lib/whatsapp";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  PlusCircle,
  KeyRound,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Snowflake,
  ShieldCheck,
  PauseCircle,
  RotateCcw,
  Sparkles,
  IdCard,
  ChevronRight
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  chapters: {
    lessons: { id: string }[];
  }[];
}

interface StudentDetailProps {
  student: {
    id: string;
    studentId?: string | null;
    name: string;
    email: string;
    phone: string;
    status?: string; // "ACTIVE" | "FROZEN"
    createdAt: string | Date;
    enrollments: {
      id: string;
      status?: string; // "ACTIVE" | "FROZEN"
      course: CourseDetail;
    }[];
    progress: { lessonId: string }[];
  };
  availableCourses: { id: string; title: string }[];
}

export function StudentDetailClient({ student, availableCourses }: StudentDetailProps) {
  const router = useRouter();
  const completedLessonIds = new Set(student.progress.map((p) => p.lessonId));

  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isTogglingAccountStatus, setIsTogglingAccountStatus] = useState(false);
  const [togglingEnrollmentId, setTogglingEnrollmentId] = useState<string | null>(null);

  // Password Reset state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [resetWALink, setResetWALink] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const unassignedCourses = availableCourses.filter(
    (ac) => !student.enrollments.some((e) => e.course.id === ac.id)
  );

  const handleToggleAccountStatus = async () => {
    const nextStatus = student.status === "FROZEN" ? "ACTIVE" : "FROZEN";
    setIsTogglingAccountStatus(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update student account status.");
      }
    } catch {
      alert("Error updating student status.");
    } finally {
      setIsTogglingAccountStatus(false);
    }
  };

  const handleToggleEnrollmentStatus = async (enrollmentId: string, currentStatus: string = "ACTIVE") => {
    const nextStatus = currentStatus === "FROZEN" ? "ACTIVE" : "FROZEN";
    setTogglingEnrollmentId(enrollmentId);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/enrollments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, status: nextStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update course status.");
      }
    } catch {
      alert("Error updating course status.");
    } finally {
      setTogglingEnrollmentId(null);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourseToAssign) return;
    setIsAssigning(true);

    try {
      const res = await fetch(`/api/admin/students/${student.id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseToAssign }),
      });

      if (res.ok) {
        setSelectedCourseToAssign("");
        router.refresh();
      } else {
        alert("Failed to assign course.");
      }
    } catch (e) {
      alert("Error assigning course.");
    } finally {
      setIsAssigning(false);
    }
  };

  const generateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "IMHS-";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(pass);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassword) return;

    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const waLink = createPasswordResetWALink(
          student.phone,
          student.name,
          student.email,
          tempPassword
        );
        setResetWALink(waLink);
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (e) {
      alert("Error resetting password.");
    } finally {
      setIsResetting(false);
    }
  };

  const isAccountFrozen = student.status === "FROZEN";

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
      {/* Back Navigation Link */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Student Directory
      </Link>

      {/* ── 1. Profile Header Card ── */}
      <div className="bg-surface border border-chart-grid p-4 sm:p-6 md:p-8 rounded-card space-y-5 shadow-paper">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-chart-grid pb-5">
          
          <div className="space-y-2 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-clinical-teal uppercase font-bold tracking-wider">
                STUDENT PROFILE RECORD
              </span>

              {isAccountFrozen ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-chart-red bg-chart-red/10 border border-chart-red/20 px-2 py-0.5 rounded-full font-bold">
                  <Snowflake className="w-3 h-3" /> ACCOUNT FROZEN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3 h-3 text-green-600" /> ACCOUNT ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink break-words leading-tight">
              {student.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-mono text-ink-muted">
              {student.studentId && (
                <span className="inline-flex items-center gap-1 font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 rounded">
                  <IdCard className="w-3.5 h-3.5" /> Reg ID: {student.studentId}
                </span>
              )}
              <span className="flex items-center gap-1 truncate max-w-full">
                <Mail className="w-3.5 h-3.5 text-clinical-teal shrink-0" /> {student.email}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Phone className="w-3.5 h-3.5 text-clinical-teal shrink-0" /> {student.phone}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <Button
              size="sm"
              variant={isAccountFrozen ? "default" : "outline"}
              onClick={handleToggleAccountStatus}
              disabled={isTogglingAccountStatus}
              className={`gap-1.5 text-xs font-semibold h-9 ${
                isAccountFrozen
                  ? "bg-green-600 hover:bg-green-700 text-white border-0"
                  : "border-chart-red/40 text-chart-red hover:bg-chart-red/10"
              }`}
            >
              {isAccountFrozen ? (
                <><RotateCcw className="w-3.5 h-3.5" /> Reactivate Account</>
              ) : (
                <><Snowflake className="w-3.5 h-3.5" /> Freeze Entire Account</>
              )}
            </Button>

            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(student.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="danger" size="sm" className="w-full gap-1.5 font-semibold text-xs h-9">
                <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp Message
              </Button>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                generateTempPassword();
                setResetWALink(null);
                setResetModalOpen(true);
              }}
              className="gap-1.5 text-xs h-9"
            >
              <KeyRound className="w-4 h-4 text-chart-red" /> Reset Password
            </Button>
          </div>
        </div>

        {/* ── 2. Assign New Course Section ── */}
        <div className="bg-linen/50 border border-chart-grid p-4 rounded-card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-semibold text-ink flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-clinical-teal" /> Assign New Course Program
              </h3>
              <p className="text-[11px] text-sage font-mono">
                Grant immediate access to an additional IMHS course program
              </p>
            </div>
            
            <span className="text-[11px] font-mono text-ink-muted">
              {unassignedCourses.length} courses available to assign
            </span>
          </div>

          {unassignedCourses.length === 0 ? (
            <p className="text-xs font-mono text-sage bg-white p-3 rounded border border-chart-grid text-center">
              ✅ Student is already enrolled in all published course programs.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <CustomSelect
                options={unassignedCourses.map((c) => ({ value: c.id, label: c.title }))}
                value={selectedCourseToAssign}
                onChange={setSelectedCourseToAssign}
                placeholder="-- Select Course to Assign --"
                className="flex-1"
              />

              <Button
                size="sm"
                onClick={handleAssignCourse}
                disabled={!selectedCourseToAssign || isAssigning}
                className="gap-1.5 text-xs font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 h-10 sm:h-9 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                {isAssigning ? "Assigning..." : "Assign Course Access"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Enrolled Courses & Progress Section ── */}
      <div className="bg-surface border border-chart-grid p-4 sm:p-6 md:p-8 rounded-card space-y-6 shadow-paper">
        <div className="border-b border-chart-grid pb-4">
          <h2 className="text-lg font-display font-semibold text-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-clinical-teal" /> Enrolled Courses & Hold Status ({student.enrollments.length})
          </h2>
          <p className="text-xs text-sage font-mono mt-0.5">
            Manage individual course access holds and monitor student lecture completion
          </p>
        </div>

        {student.enrollments.length === 0 ? (
          <div className="text-center py-10 space-y-2 border border-dashed border-chart-grid rounded-card bg-linen/20">
            <BookOpen className="w-8 h-8 text-sage/50 mx-auto" />
            <p className="text-xs font-mono text-sage">
              This student currently has no assigned courses. Use the section above to enroll them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {student.enrollments.map((enr) => {
              const course = enr.course;
              const isCourseFrozen = enr.status === "FROZEN";
              const allLessons = course.chapters.flatMap((ch) => ch.lessons);
              const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
              const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
              const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();

              return (
                <div
                  key={course.id}
                  className={`border rounded-card p-4 sm:p-5 space-y-4 transition-all ${
                    isCourseFrozen || isAccountFrozen
                      ? "bg-chart-red/5 border-chart-red/30"
                      : "bg-linen/30 border-chart-grid"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 max-w-[70%]">
                      <span className="font-mono text-[10px] uppercase font-bold text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 rounded inline-block">
                        {courseCode}
                      </span>
                      <h3 className="text-sm font-semibold text-ink font-sans leading-snug break-words">
                        {course.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {isCourseFrozen || isAccountFrozen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-chart-red bg-chart-red/10 border border-chart-red/30 px-2 py-0.5 rounded-full font-bold">
                          <Snowflake className="w-3 h-3" /> FROZEN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-white p-3 rounded border border-chart-grid/60">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-sage">Syllabus Completion</span>
                      <span className="font-bold text-clinical-teal">{percent}%</span>
                    </div>
                    <VitalLine variant="progress" progress={percent} />
                    <span className="block text-[10px] font-mono text-sage text-right">
                      {completedCount} of {allLessons.length} lessons done
                    </span>
                  </div>

                  {/* Freeze/Reactivate Course Button */}
                  <div className="pt-2 border-t border-chart-grid/60 flex items-center justify-between gap-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      target="_blank"
                      className="text-xs font-mono text-sage hover:text-clinical-teal inline-flex items-center gap-1"
                    >
                      Course Catalogue <ChevronRight className="w-3 h-3" />
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={togglingEnrollmentId === enr.id}
                      onClick={() => handleToggleEnrollmentStatus(enr.id, enr.status)}
                      className={`text-[11px] h-8 px-3 gap-1.5 font-semibold ${
                        isCourseFrozen
                          ? "bg-white border-green-600 text-green-700 hover:bg-green-50"
                          : "bg-white border-chart-red/40 text-chart-red hover:bg-chart-red/10"
                      }`}
                    >
                      {isCourseFrozen ? (
                        <><RotateCcw className="w-3 h-3" /> Reactivate Access</>
                      ) : (
                        <><PauseCircle className="w-3 h-3" /> Freeze Access</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-chart-grid rounded-card max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-display font-semibold text-ink flex items-center gap-2 border-b border-chart-grid pb-2">
              <KeyRound className="w-5 h-5 text-chart-red" /> Reset Password
            </h3>

            {resetWALink ? (
              <div className="space-y-4 text-center">
                <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-4 rounded text-xs space-y-2">
                  <p className="font-semibold text-clinical-teal">Password Reset Successfully!</p>
                  <p className="font-mono bg-linen p-2 rounded border border-chart-grid font-bold text-ink">
                    New Temp Password: {tempPassword}
                  </p>
                </div>

                <a href={resetWALink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button variant="danger" className="w-full gap-2 font-semibold">
                    <MessageCircle className="w-4 h-4 fill-current" /> Send New Password via WhatsApp
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalOpen(false)}
                  className="w-full"
                >
                  Close Window
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-ink font-medium mb-1">
                    New Temporary Password *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-linen/50 border border-chart-grid rounded-input text-xs font-mono text-ink"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateTempPassword}
                      className="text-[11px]"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResetModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isResetting} size="sm" variant="danger">
                    {isResetting ? "Resetting..." : "Save & Generate WhatsApp Link"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
