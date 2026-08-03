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
  ChevronRight,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Layers,
  Smartphone
} from "lucide-react";

interface LessonDetail {
  id: string;
  title: string;
  order: number;
  type?: string | null;
}

interface ChapterDetail {
  id: string;
  title: string;
  order: number;
  lessons: LessonDetail[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  chapters: ChapterDetail[];
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
    deviceSignature?: string | null;
    deviceLockedAt?: string | Date | null;
    enrollments: {
      id: string;
      status?: string; // "ACTIVE" | "FROZEN"
      blockedChapterIds?: string | null;
      blockedLessonIds?: string | null;
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
  const [expandedAccessEnrollmentId, setExpandedAccessEnrollmentId] = useState<string | null>(null);

  // Device reset & devices list state
  const [isResettingDevice, setIsResettingDevice] = useState(false);
  const [deviceResetMsg, setDeviceResetMsg] = useState<string | null>(null);
  const [deviceLocked, setDeviceLocked] = useState(!!student.deviceSignature);
  const [deviceLockedAt, setDeviceLockedAt] = useState<string | Date | null>(student.deviceLockedAt || null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);

  const fetchDevices = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/students/${student.id}/devices`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch {} finally {
      setLoadingDevices(false);
    }
  }, [student.id]);

  React.useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDeviceAction = async (deviceId: string, action: "APPROVE" | "MAKE_PRIMARY" | "BLOCK") => {
    try {
      const res = await fetch(`/api/admin/students/${student.id}/devices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeviceResetMsg(data.message);
        if (action === "MAKE_PRIMARY") {
          setDeviceLocked(true);
          setDeviceLockedAt(new Date());
        }
        fetchDevices();
        router.refresh();
      } else {
        alert(data.error || "Failed to update device status.");
      }
    } catch {
      alert("Error updating device.");
    }
  };

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

  const handleToggleBlockChapter = async (enr: any, chapterId: string) => {
    let currentBlocked: string[] = [];
    try {
      currentBlocked = JSON.parse(enr.blockedChapterIds || "[]");
    } catch {
      currentBlocked = [];
    }
    const isBlocked = currentBlocked.includes(chapterId);
    const nextBlocked = isBlocked
      ? currentBlocked.filter((id: string) => id !== chapterId)
      : [...currentBlocked, chapterId];

    setTogglingEnrollmentId(enr.id);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/enrollments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enr.id, blockedChapterIds: nextBlocked }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update blocked chapters.");
      }
    } catch {
      alert("Error updating blocked chapters.");
    } finally {
      setTogglingEnrollmentId(null);
    }
  };

  const handleToggleBlockLesson = async (enr: any, lessonId: string) => {
    let currentBlocked: string[] = [];
    try {
      currentBlocked = JSON.parse(enr.blockedLessonIds || "[]");
    } catch {
      currentBlocked = [];
    }
    const isBlocked = currentBlocked.includes(lessonId);
    const nextBlocked = isBlocked
      ? currentBlocked.filter((id: string) => id !== lessonId)
      : [...currentBlocked, lessonId];

    setTogglingEnrollmentId(enr.id);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/enrollments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enr.id, blockedLessonIds: nextBlocked }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update blocked lessons.");
      }
    } catch {
      alert("Error updating blocked lessons.");
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

  const handleResetDevice = async () => {
    if (!confirm(`Reset device lock for ${student.name}? Their next login will register their new device.`)) return;
    setIsResettingDevice(true);
    setDeviceResetMsg(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/reset-device`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeviceLocked(false);
        setDeviceLockedAt(null);
        setDeviceResetMsg(data.message || "Device lock cleared successfully.");
      } else {
        setDeviceResetMsg(data.error || "Failed to reset device lock.");
      }
    } catch {
      setDeviceResetMsg("Error resetting device lock.");
    } finally {
      setIsResettingDevice(false);
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

      {/* ── 2b. Security & Device Lock Card ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: deviceLocked ? "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)" : "#F1F5F9" }}
            >
              {deviceLocked
                ? <Lock className="w-4.5 h-4.5 text-white" />
                : <Unlock className="w-4.5 h-4.5 text-slate-400" />
              }
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-ink flex items-center gap-2">
                Device Lock & 2FA Security
                {deviceLocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#EBF3FA] text-[#0E57A4] border border-[#BFDBFE] px-2 py-0.5 rounded-full font-bold">
                    <Lock className="w-2.5 h-2.5" /> DEVICE LOCKED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#F1F5F9] text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                    <Unlock className="w-2.5 h-2.5" /> NO DEVICE REGISTERED
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-sage font-mono mt-0.5">
                {deviceLocked
                  ? `Account locked to one primary device${deviceLockedAt ? ` since ${new Date(deviceLockedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : ""}.`
                  : "No device registered yet. Device will be locked on student's next login."
                }
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                🔒 Email 2FA is enabled — student receives a one-time code on every login.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetDevice}
              disabled={isResettingDevice || !deviceLocked}
              className="gap-1.5 text-xs font-semibold h-9 border-[#0E57A4]/30 text-[#0E57A4] hover:bg-[#EBF3FA] disabled:opacity-40"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResettingDevice ? "animate-spin" : ""}`} />
              {isResettingDevice ? "Resetting…" : "Reset Device Lock"}
            </Button>
            {!deviceLocked && (
              <p className="text-[10px] text-center text-slate-400 font-mono">No device to reset</p>
            )}
          </div>
        </div>

        {/* Success/Error message */}
        {deviceResetMsg && (
          <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs border ${
            deviceResetMsg.toLowerCase().includes("error") || deviceResetMsg.toLowerCase().includes("fail")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{deviceResetMsg}</span>
          </div>
        )}

        {/* Device List Table */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#0E57A4]" /> Registered & Attempted Devices ({devices.length})
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Click &ldquo;Approve&rdquo; or &ldquo;Set as Primary&rdquo; to authorize new device</span>
          </div>

          {loadingDevices ? (
            <div className="text-center py-4 text-xs font-mono text-slate-400">Loading devices…</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-4 text-xs font-mono text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              No device attempts logged yet. Devices are logged automatically when student attempts to log in.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase">
                    <th className="p-3">Device & Browser</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Attempt</th>
                    <th className="p-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {devices.map((dev) => {
                    const isPrimary = dev.status === "PRIMARY" || dev.deviceSignature === student.deviceSignature;
                    const isAllowed = dev.status === "ALLOWED";
                    const isBlocked = dev.status === "BLOCKED" && !isPrimary;

                    return (
                      <tr key={dev.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{dev.deviceInfo || "Unknown Device"}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]" title={dev.deviceSignature}>
                            Sig: {dev.deviceSignature.slice(0, 16)}…
                          </div>
                        </td>
                        <td className="p-3">
                          {isPrimary ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#EBF3FA] text-[#0E57A4] border border-[#BFDBFE] px-2 py-0.5 rounded-full">
                              🔒 PRIMARY DEVICE
                            </span>
                          ) : isAllowed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                              ✓ AUTHORIZED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                              ⚠ BLOCKED ATTEMPT
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          <div>{new Date(dev.lastAttemptAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
                          <div className="text-[10px] text-slate-400">{new Date(dev.lastAttemptAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPrimary && (
                              <button
                                onClick={() => handleDeviceAction(dev.id, "MAKE_PRIMARY")}
                                className="px-2.5 py-1 text-[10px] font-semibold font-mono rounded-lg bg-[#0E57A4] hover:bg-[#0A4685] text-white transition-colors"
                              >
                                Set as Primary
                              </button>
                            )}
                            {!isAllowed && !isPrimary && (
                              <button
                                onClick={() => handleDeviceAction(dev.id, "APPROVE")}
                                className="px-2.5 py-1 text-[10px] font-semibold font-mono rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {!isBlocked && (
                              <button
                                onClick={() => handleDeviceAction(dev.id, "BLOCK")}
                                className="px-2 py-1 text-[10px] font-semibold font-mono rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

                  {/* Freeze/Reactivate Course Button & Granular Access Controls */}
                  <div className="pt-2 border-t border-chart-grid/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAccessEnrollmentId(
                            expandedAccessEnrollmentId === enr.id ? null : enr.id
                          )
                        }
                        className="text-xs font-mono text-clinical-teal font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Granular Content Blocks
                        {expandedAccessEnrollmentId === enr.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

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
                          <><PauseCircle className="w-3 h-3" /> Freeze Course</>
                        )}
                      </Button>
                    </div>

                    {/* Expanded Granular Block Drawer */}
                    {expandedAccessEnrollmentId === enr.id && (
                      <div className="bg-white border border-chart-grid rounded-lg p-3 space-y-3 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-chart-grid pb-2">
                          <span className="font-mono text-[10px] uppercase font-bold text-sage">
                            Block Chapters &amp; Lessons for this Student
                          </span>
                          <span className="text-[10px] font-mono text-chart-red font-semibold">
                            Admin Control
                          </span>
                        </div>

                        {(() => {
                          let blockedChs: string[] = [];
                          let blockedLss: string[] = [];
                          try {
                            blockedChs = JSON.parse(enr.blockedChapterIds || "[]");
                          } catch {
                            blockedChs = [];
                          }
                          try {
                            blockedLss = JSON.parse(enr.blockedLessonIds || "[]");
                          } catch {
                            blockedLss = [];
                          }

                          if (!course.chapters || course.chapters.length === 0) {
                            return (
                              <p className="text-[11px] font-mono text-sage italic">
                                No chapters in this course yet.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                              {course.chapters.map((ch, cIdx) => {
                                const isChBlocked = blockedChs.includes(ch.id);

                                return (
                                  <div
                                    key={ch.id}
                                    className="border border-chart-grid/60 rounded p-2.5 bg-linen/20 space-y-2"
                                  >
                                    <div className="flex items-center justify-between font-mono font-semibold">
                                      <span className="text-ink flex items-center gap-1.5 truncate">
                                        <Layers className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                                        CH {cIdx + 1}: {ch.title}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={togglingEnrollmentId === enr.id}
                                        onClick={() => handleToggleBlockChapter(enr, ch.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                                          isChBlocked
                                            ? "bg-chart-red text-white"
                                            : "bg-white border border-chart-grid text-ink hover:border-chart-red hover:text-chart-red"
                                        }`}
                                      >
                                        {isChBlocked ? "🔒 Chapter Blocked" : "Block Entire Chapter"}
                                      </button>
                                    </div>

                                    {/* Lessons */}
                                    <div className="pl-4 space-y-1.5 border-t border-chart-grid/40 pt-1.5">
                                      {ch.lessons.map((ls) => {
                                        const isLsBlocked = blockedLss.includes(ls.id);
                                        const effectiveBlocked = isChBlocked || isLsBlocked;

                                        return (
                                          <div
                                            key={ls.id}
                                            className="flex items-center justify-between text-[11px] py-1"
                                          >
                                            <span
                                              className={`truncate max-w-[65%] ${
                                                effectiveBlocked ? "text-chart-red line-through" : "text-ink-muted"
                                              }`}
                                            >
                                              {ls.title}
                                            </span>
                                            <button
                                              type="button"
                                              disabled={togglingEnrollmentId === enr.id || isChBlocked}
                                              onClick={() => handleToggleBlockLesson(enr, ls.id)}
                                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                                                isChBlocked
                                                  ? "bg-chart-red/10 text-chart-red opacity-60 cursor-not-allowed"
                                                  : isLsBlocked
                                                  ? "bg-chart-red text-white"
                                                  : "bg-white border border-chart-grid text-sage hover:border-chart-red hover:text-chart-red"
                                              }`}
                                            >
                                              {isChBlocked
                                                ? "Blocked (via Ch)"
                                                : isLsBlocked
                                                ? "🔒 Blocked"
                                                : "Block Lesson"}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
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
