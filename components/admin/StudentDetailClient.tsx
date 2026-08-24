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
    } catch { } finally {
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
        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-[#0E57A4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Student Directory
      </Link>

      {/* ── 1. Profile Header Card ── */}
      <div className="bg-white border border-slate-200 p-5 sm:p-7 md:p-8 rounded-2xl space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">

          <div className="space-y-2.5 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-[#0E57A4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                STUDENT PROFILE RECORD
              </span>

              {isAccountFrozen ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                  <Snowflake className="w-3 h-3 text-rose-600" /> ACCOUNT FROZEN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> ACCOUNT ACTIVE
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 break-words leading-tight">
              {student.name}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-mono text-slate-500">
              {student.studentId && (
                <span className="inline-flex items-center gap-1 font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                  <IdCard className="w-3.5 h-3.5 text-[#0E57A4]" /> Reg ID: {student.studentId}
                </span>
              )}
              <span className="flex items-center gap-1 truncate max-w-full text-slate-600">
                <Mail className="w-3.5 h-3.5 text-[#0E57A4] shrink-0" /> {student.email}
              </span>
              <span className="flex items-center gap-1 shrink-0 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-[#0E57A4] shrink-0" /> {student.phone}
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
              className={`gap-1.5 text-xs font-semibold h-10 rounded-xl ${isAccountFrozen
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  : "border-rose-200 text-rose-700 hover:bg-rose-50"
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
              <Button size="sm" className="w-full gap-1.5 font-semibold text-xs h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
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
              className="gap-1.5 text-xs h-10 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <KeyRound className="w-4 h-4 text-[#F16726]" /> Reset Password
            </Button>
          </div>
        </div>

        {/* ── 2. Assign New Course Section ── */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-[#0E57A4]" /> Assign New Course Program
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Grant immediate access to an additional IMHS course program
              </p>
            </div>

            <span className="text-[11px] font-mono font-semibold text-slate-500">
              {unassignedCourses.length} courses available to assign
            </span>
          </div>

          {unassignedCourses.length === 0 ? (
            <p className="text-xs font-mono text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center font-bold">
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
                className="gap-1.5 text-xs font-semibold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl border-0 h-10 shrink-0 shadow-xs"
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
                🔒 Email 2FA is enabled - student receives a one-time code on every login.
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
          <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs border ${deviceResetMsg.toLowerCase().includes("error") || deviceResetMsg.toLowerCase().includes("fail")
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
                    const isPrimary = dev.status === "PRIMARY";
                    const isAllowed = dev.status === "ALLOWED";
                    const isBlocked = dev.status === "BLOCKED";

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

      {/* ── 3. Enrolled Courses & Hold Status Section ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-7 md:p-8 space-y-6 shadow-sm">
        
        {/* Section Header & Global Status Counters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#EBF3FA] flex items-center justify-center text-[#0E57A4]">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                Enrolled Courses &amp; Hold Status
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {student.enrollments.length}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans pl-10">
              Manage individual student course access holds, inspect completion progress, and configure granular lesson blocks.
            </p>
          </div>

          {/* Quick Stats Ribbon */}
          {student.enrollments.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pl-10 md:pl-0">
              {(() => {
                const activeCount = student.enrollments.filter(
                  (e) => e.status !== "FROZEN" && !isAccountFrozen
                ).length;
                const frozenCount = student.enrollments.length - activeCount;

                return (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeCount} Active Access</span>
                    </div>

                    {frozenCount > 0 && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full shadow-xs animate-pulse">
                        <Snowflake className="w-3.5 h-3.5 text-rose-600" />
                        <span>{frozenCount} on Hold</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {student.enrollments.length === 0 ? (
          <div className="text-center py-12 space-y-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-slate-700">No Course Enrollments Found</p>
              <p className="text-xs font-mono text-slate-400">
                This student currently has no assigned courses. Use the &ldquo;Assign New Course Program&rdquo; form above to grant immediate portal access.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {student.enrollments.map((enr) => {
              const course = enr.course;
              const isCourseFrozen = enr.status === "FROZEN";
              const isEffectivelyFrozen = isCourseFrozen || isAccountFrozen;
              const allLessons = course.chapters.flatMap((ch) => ch.lessons);
              const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
              const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
              const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();

              // Calculate total blocked items
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
              const totalBlockedItems = blockedChs.length + blockedLss.length;
              const isDrawerOpen = expandedAccessEnrollmentId === enr.id;

              return (
                <div
                  key={course.id}
                  className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                    isEffectivelyFrozen
                      ? "bg-gradient-to-br from-white via-rose-50/20 to-rose-50/50 border-rose-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md shadow-xs"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    
                    {/* Course Header & Status Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 max-w-[72%]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {courseCode}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {course.chapters.length} Chapters &bull; {allLessons.length} Lessons
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans leading-snug break-words">
                          {course.title}
                        </h3>
                      </div>

                      {/* Prominent Status Indicator */}
                      <div className="shrink-0">
                        {isEffectivelyFrozen ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-xs">
                            <Snowflake className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: "12s" }} />
                            <span>{isAccountFrozen ? "ACCOUNT FROZEN" : "ACCESS ON HOLD"}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ACTIVE ACCESS</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Metrics Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans font-semibold text-slate-700 flex items-center gap-1.5">
                          Syllabus Completion
                        </span>
                        <span className="font-mono font-bold text-[#0E57A4] text-xs">
                          {percent}%
                        </span>
                      </div>

                      {/* Custom Smooth Multi-Layer Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{
                            width: `${percent}%`,
                            background: percent === 100
                              ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                              : "linear-gradient(90deg, #0E57A4 0%, #38BDF8 100%)",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                        <span>{completedCount} of {allLessons.length} lessons completed</span>
                        <span className="text-slate-400">{allLessons.length - completedCount} remaining</span>
                      </div>
                    </div>

                    {/* Granular Block Summary Chip if any items are blocked */}
                    {totalBlockedItems > 0 && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          <strong>{totalBlockedItems} granular block{totalBlockedItems > 1 ? "s" : ""} active</strong> ({blockedChs.length} chapter{blockedChs.length !== 1 ? "s" : ""}, {blockedLss.length} lesson{blockedLss.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                    )}

                  </div>

                  {/* ── Card Footer Action Bar ── */}
                  <div className="bg-slate-50/80 border-t border-slate-200/80 px-5 py-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Toggle Granular Content Drawer */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAccessEnrollmentId(
                            isDrawerOpen ? null : enr.id
                          )
                        }
                        className={`text-xs font-mono font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          isDrawerOpen
                            ? "bg-[#0E57A4] text-white border-[#0E57A4] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Granular Locks</span>
                        {totalBlockedItems > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isDrawerOpen ? "bg-white text-[#0E57A4]" : "bg-rose-100 text-rose-700"
                          }`}>
                            {totalBlockedItems}
                          </span>
                        )}
                        {isDrawerOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Primary Course Hold / Reactivate Button */}
                      <Button
                        size="sm"
                        disabled={togglingEnrollmentId === enr.id}
                        onClick={() => handleToggleEnrollmentStatus(enr.id, enr.status)}
                        className={`text-xs h-9 px-3.5 gap-1.5 font-semibold transition-all shadow-xs ${
                          isCourseFrozen
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            : "bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 hover:border-rose-300"
                        }`}
                      >
                        {togglingEnrollmentId === enr.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Updating...
                          </span>
                        ) : isCourseFrozen ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" /> Release Hold / Reactivate
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-rose-600" /> Put Course on Hold
                          </>
                        )}
                      </Button>
                    </div>

                    {/* ── Expanded Granular Permission Matrix Drawer ── */}
                    {isDrawerOpen && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] uppercase font-bold text-slate-800 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#0E57A4]" /> Content Lock Matrix
                            </span>
                            <p className="text-[10px] font-sans text-slate-500">
                              Select specific chapters or lessons to restrict from student view
                            </p>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {course.chapters.length} Modules Total
                          </span>
                        </div>

                        {(() => {
                          if (!course.chapters || course.chapters.length === 0) {
                            return (
                              <p className="text-xs font-mono text-slate-400 italic text-center py-3">
                                No chapters published in this course yet.
                              </p>
                            );
                          }

                          return (
                            <div
                              data-lenis-prevent="true"
                              onWheel={(e) => e.stopPropagation()}
                              className="space-y-3 max-h-72 overflow-y-auto pr-1 overscroll-contain touch-pan-y"
                            >
                              {course.chapters.map((ch, cIdx) => {
                                const isChBlocked = blockedChs.includes(ch.id);

                                return (
                                  <div
                                    key={ch.id}
                                    className={`border rounded-xl p-3 transition-colors space-y-2.5 ${
                                      isChBlocked
                                        ? "bg-rose-50/40 border-rose-200"
                                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    {/* Chapter Bar */}
                                    <div className="flex items-center justify-between gap-2 font-mono">
                                      <span className="text-slate-900 font-bold flex items-center gap-1.5 truncate text-xs">
                                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-[#0E57A4] shrink-0">
                                          {cIdx + 1}
                                        </span>
                                        <span className="truncate">{ch.title}</span>
                                      </span>

                                      <button
                                        type="button"
                                        disabled={togglingEnrollmentId === enr.id}
                                        onClick={() => handleToggleBlockChapter(enr, ch.id)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 flex items-center gap-1 ${
                                          isChBlocked
                                            ? "bg-rose-600 text-white shadow-xs hover:bg-rose-700"
                                            : "bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-700"
                                        }`}
                                      >
                                        <Lock className="w-3 h-3" />
                                        {isChBlocked ? "Chapter Locked" : "Lock Chapter"}
                                      </button>
                                    </div>

                                    {/* Lessons List in Chapter */}
                                    <div className="pl-6 space-y-1.5 border-t border-slate-200/60 pt-2">
                                      {ch.lessons.map((ls) => {
                                        const isLsBlocked = blockedLss.includes(ls.id);
                                        const effectiveBlocked = isChBlocked || isLsBlocked;

                                        return (
                                          <div
                                            key={ls.id}
                                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white transition-colors"
                                          >
                                            <span
                                              className={`truncate max-w-[65%] font-sans ${
                                                effectiveBlocked
                                                  ? "text-rose-700 line-through font-medium"
                                                  : "text-slate-700"
                                              }`}
                                            >
                                              {ls.title}
                                            </span>

                                            <button
                                              type="button"
                                              disabled={togglingEnrollmentId === enr.id || isChBlocked}
                                              onClick={() => handleToggleBlockLesson(enr, ls.id)}
                                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all ${
                                                isChBlocked
                                                  ? "bg-rose-100 text-rose-600 opacity-60 cursor-not-allowed"
                                                  : isLsBlocked
                                                    ? "bg-rose-600 text-white font-bold"
                                                    : "bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600"
                                              }`}
                                            >
                                              {isChBlocked
                                                ? "Locked (via Ch)"
                                                : isLsBlocked
                                                  ? "🔒 Locked"
                                                  : "Lock Lesson"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-5 h-5 text-[#F16726]" /> Reset Account Password
            </h3>

            {resetWALink ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password Reset Successfully!
                  </p>
                  <p className="font-mono bg-white p-2.5 rounded-lg border border-emerald-200 font-bold text-slate-900 text-sm">
                    New Temp Password: <span className="text-[#F16726]">{tempPassword}</span>
                  </p>
                </div>

                <a href={resetWALink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-xs">
                    <MessageCircle className="w-4 h-4 fill-current" /> Send New Password via WhatsApp
                  </Button>
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalOpen(false)}
                  className="w-full rounded-xl h-10 border-slate-200"
                >
                  Close Window
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Temporary Password *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateTempPassword}
                      className="text-xs rounded-xl border-slate-200 font-mono font-semibold"
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
                    className="rounded-xl text-slate-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResetting}
                    size="sm"
                    className="bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl font-semibold shadow-xs"
                  >
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
