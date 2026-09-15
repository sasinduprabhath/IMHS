import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { createFrozenCourseInquiryWALink } from "@/lib/whatsapp";
import { DashboardTour } from "@/components/student/DashboardTour";
import { StudentAssignmentsClient } from "@/components/student/StudentAssignmentsClient";
import {
  BookOpen, PlayCircle, MessageSquare, ArrowRight,
  Trophy, GraduationCap, FileText, Lock, Sparkles,
  Target, Zap, CheckCircle2, TrendingUp, ShieldCheck,
} from "lucide-react";

export const metadata = { title: "My Courses - IMHS Student Portal" };
export const revalidate = 0;

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tour?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isForcedTour = resolvedParams.tour === "true";

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let enrollments: any[] = [];
  let userProgress: any[] = [];
  let dbUser: any = null;

  try {
    if (userId) {
      const [userEnrollments, progressList, userRecord] = await Promise.all([
        prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: {
              include: {
                chapters: {
                  orderBy: { order: "asc" },
                  include: { lessons: { orderBy: { order: "asc" } } },
                },
              },
            },
          },
        }),
        prisma.lessonProgress.findMany({
          where: { userId },
          select: { lessonId: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { hasCompletedTour: true },
        }),
      ]);
      enrollments = userEnrollments;
      userProgress = progressList;
      dbUser = userRecord;
    }
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
  }

  const shouldRunTour = isForcedTour || (dbUser ? !dbUser.hasCompletedTour : false);

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
  const totalLessons = enrollments.reduce(
    (sum: number, e: any) =>
      sum + e.course.chapters.reduce((s: number, ch: any) => s + ch.lessons.length, 0),
    0
  );
  const completedCount = completedLessonIds.size;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const studentFirstName = session?.user?.name?.split(" ")[0] || "Learner";
  const studentInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";
  const regId = (session?.user as any)?.studentId || null;
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCourses = enrollments.filter((e) => {
    const allL = e.course.chapters.flatMap((ch: any) => ch.lessons);
    return allL.length > 0 && allL.every((l: any) => completedLessonIds.has(l.id));
  }).length;

  return (
    <div className="space-y-8">

      {/* ── Hero Welcome Banner ──────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #093972 0%, #0E57A4 45%, #1868c2 80%, #0c4887 100%)",
          boxShadow: "0 12px 36px rgba(14,87,164,.35), 0 4px 12px rgba(14,87,164,.2)",
        }}
      >
        {/* Mesh radial background glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.22) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(241,103,38,0.25) 0%, transparent 45%)",
          }}
        />

        <div className="relative z-10 p-7 sm:p-8 md:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
            {/* 3D Student Avatar */}
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ring-4 ring-white/25 border-2 border-white bg-white/10 backdrop-blur-md flex items-center justify-center font-display font-bold text-white text-2xl shadow-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <img
                  src={(session?.user as any)?.image || dbUser?.image || "/student-avatar.png"}
                  alt={session?.user?.name || "Student"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-400 border-2 border-[#0E57A4] rounded-full z-10 shadow-sm" />
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span id="tour-device-badge" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/35 px-3 py-0.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Device Security Locked
                </span>
                {regId && (
                  <span className="font-mono text-[10px] text-white/80 bg-white/15 border border-white/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    ID: {regId}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight tracking-tight">
                Welcome back, {studentFirstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed max-w-xl">
                Your portal gives you full access to video lectures, lab references, and certification progress.
              </p>
            </div>
          </div>

          {/* Overall Completion Glass Widget */}
          {totalLessons > 0 && (
            <div className="hidden sm:flex flex-col items-center justify-center shrink-0 bg-white/12 border border-white/25 rounded-2xl px-6 py-4.5 backdrop-blur-md shadow-inner text-center min-w-[120px]">
              <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">{overallProgress}%</div>
              <div className="text-[9px] font-mono uppercase text-white/75 tracking-widest font-bold pt-0.5">Overall Complete</div>
              <div className="w-20 bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden p-0.5">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bento Stats Grid ─────────────────────────────────────────────── */}
      <div id="tour-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Enrolled",
            value: enrollments.length,
            icon: BookOpen,
            color: "#0E57A4",
            bg: "rgba(14,87,164,.06)",
            border: "rgba(14,87,164,.14)",
            suffix: "",
          },
          {
            label: "Active Courses",
            value: activeCount,
            icon: Zap,
            color: "#10B981",
            bg: "rgba(16,185,129,.06)",
            border: "rgba(16,185,129,.14)",
            suffix: "",
          },
          {
            label: "Lessons Done",
            value: completedCount,
            icon: CheckCircle2,
            color: "#6366F1",
            bg: "rgba(99,102,241,.06)",
            border: "rgba(99,102,241,.14)",
            suffix: "",
          },
          {
            label: "Overall Progress",
            value: overallProgress,
            icon: TrendingUp,
            color: "#F16726",
            bg: "rgba(241,103,38,.06)",
            border: "rgba(241,103,38,.14)",
            suffix: "%",
          },
        ].map(({ label, value, icon: Icon, color, bg, border, suffix }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-card group"
            style={{ border: `1px solid ${border}`, boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-widest font-bold"
                style={{ color }}>
                {label}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-ink">
              {value}{suffix}
            </p>
            {label === "Overall Progress" && totalLessons > 0 && (
              <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${value}%`, background: color }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Enrolled Programs Grid ──────────────────────────────────────── */}
      <div id="tour-courses-section" className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-ink">My Enrolled Programs</h2>
            <p className="text-sm text-ink-muted mt-0.5">
              {activeCount} active course{activeCount !== 1 ? "s" : ""} · {completedCourses} completed
            </p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-14 text-center space-y-4"
            style={{ boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}>
            <div className="w-16 h-16 bg-[#F5F7FA] border border-[#E2E8F0] rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-sage" />
            </div>
            <div>
              <h3 className="text-base font-display font-semibold text-ink">No courses yet</h3>
              <p className="text-sm text-ink-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
                Your administrator will assign your first program shortly. Message us on WhatsApp if this looks wrong.
              </p>
            </div>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") || "94766506621"}?text=${encodeURIComponent("Hello, I have not been assigned a course yet on my IMHS Student Portal.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2 bg-[#F16726] hover:bg-[#D95316] text-white border-0 font-semibold mt-1 rounded-btn">
                <MessageSquare className="w-4 h-4" />
                Message Support
              </Button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrollments.map((enr: any) => {
              const course = enr.course;
              const isFrozen = enr.status === "FROZEN";
              const allLessons = course.chapters.flatMap((ch: any) => ch.lessons);
              const totalLessonsCount = allLessons.length;
              const doneCount = allLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
              const pct = totalLessonsCount > 0 ? Math.round((doneCount / totalLessonsCount) * 100) : 0;
              const isComplete = pct === 100 && totalLessonsCount > 0;
              const isStarted = doneCount > 0;

              const progressColor = isFrozen
                ? "#EF4444"
                : isComplete
                  ? "#10B981"
                  : "#0E57A4";

              const CardInner = (
                <div className={`bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-250 group ${isFrozen
                    ? "border border-[#FECACA]"
                    : "border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-card-hover"
                  }`}
                  style={{ boxShadow: "0 2px 8px rgba(10,18,30,.05)" }}>
                  {/* Progress bar top accent */}
                  <div className="h-1 bg-[#F1F5F9] relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-700"
                      style={{
                        width: `${isFrozen ? 100 : pct}%`,
                        background: isFrozen
                          ? "linear-gradient(90deg, #EF4444, #F87171)"
                          : isComplete
                            ? "linear-gradient(90deg, #10B981, #34D399)"
                            : "linear-gradient(90deg, #0E57A4, #2172C9)",
                      }}
                    />
                  </div>

                  {/* Cover Image */}
                  {course.coverImage ? (
                    <div className="relative h-36 bg-[#F5F7FA] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isFrozen ? "group-hover:scale-105" : "opacity-40"}`}
                      />
                      {isFrozen && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex items-center gap-1.5 bg-[#EF4444] text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-pill uppercase tracking-wider">
                            <Lock className="w-3 h-3" /> Access Frozen
                          </div>
                        </div>
                      )}
                      {isComplete && !isFrozen && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-pill">
                          <Trophy className="w-3 h-3" /> Complete
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-28 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(14,87,164,.06) 0%, rgba(14,87,164,.02) 100%)" }}>
                      <BookOpen className="w-10 h-10 text-[#0E57A4]/20" />
                    </div>
                  )}

                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.category && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#0E57A4] bg-[#EBF3FA] border border-[#BFDBFE] px-2 py-0.5 rounded font-bold">
                          {course.category}
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sage bg-[#F5F7FA] border border-[#E2E8F0] px-2 py-0.5 rounded">
                        {course.enrollmentValidity || "Lifetime Access"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-display font-semibold text-ink leading-snug flex-1">
                      {course.title}
                    </h3>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-sage">{course.chapters.length} Chapters</span>
                        <span className="font-bold text-ink">{doneCount}/{totalLessonsCount} Lessons</span>
                      </div>
                      <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${isFrozen ? 100 : pct}%`, background: progressColor }}
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="pt-3 border-t border-[#F1F5F9] mt-auto">
                      {isFrozen ? (
                        <a
                          href={createFrozenCourseInquiryWALink(
                            course.title,
                            undefined,
                            session?.user?.name || undefined,
                            session?.user?.email || undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 text-xs font-semibold font-mono border border-[#FECACA] text-[#EF4444] hover:bg-[#EF4444] hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Access Frozen - Contact Administration
                        </a>
                      ) : (
                        <button className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-white px-4 py-2.5 rounded-xl transition-all duration-200 group-hover:shadow-glow"
                          style={{ background: "linear-gradient(135deg, #0E57A4 0%, #2172C9 100%)" }}>
                          <PlayCircle className="w-3.5 h-3.5" />
                          {!isStarted ? "Start Learning" : isComplete ? "Review Syllabus" : "Continue Learning"}
                          <ArrowRight className="w-3 h-3 ml-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );

              return isFrozen ? (
                <div key={course.id} className="group">{CardInner}</div>
              ) : (
                <Link key={course.id} href={`/dashboard/courses/${course.slug}`} className="block group">
                  {CardInner}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Coursework Assignments Section ───────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
        <h2 className="text-xl font-display font-bold text-ink">My Coursework Assignments</h2>
        <StudentAssignmentsClient />
      </div>

      {/* ── Info Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: GraduationCap,
            color: "#0E57A4",
            bg: "rgba(14,87,164,.06)",
            title: "Official Certification",
            desc: "Upon 100% completion, contact administration to receive your verified IMHS Certificate.",
          },
          {
            icon: FileText,
            color: "#6366F1",
            bg: "rgba(99,102,241,.06)",
            title: "PDF Reference Manuals",
            desc: "Each chapter includes downloadable PDF lab references and clinical case studies.",
          },
          {
            icon: MessageSquare,
            color: "#F16726",
            bg: "rgba(241,103,38,.06)",
            title: "Academic Help Desk",
            desc: "Need portal support or course access help? Reach our administrative desk anytime.",
          },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div
            key={title}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3 transition-all duration-200 hover:shadow-card group"
            style={{ boxShadow: "0 2px 8px rgba(10,18,30,.04)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-ink">{title}</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Driver.js Interactive Onboarding Tour ── */}
      <DashboardTour shouldRun={shouldRunTour} forceRun={isForcedTour} />
    </div>
  );
}
