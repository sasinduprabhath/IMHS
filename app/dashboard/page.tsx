import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { createFrozenCourseInquiryWALink } from "@/lib/whatsapp";
import {
  BookOpen, PlayCircle, MessageSquare, ArrowRight,
  Trophy, GraduationCap, FileText, Lock,
} from "lucide-react";

export const metadata = { title: "My Courses — IMHS Student Portal" };
export const revalidate = 0;

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let enrollments: any[] = [];
  let userProgress: any[] = [];

  try {
    if (userId) {
      const [userEnrollments, progressList] = await Promise.all([
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
      ]);
      enrollments = userEnrollments;
      userProgress = progressList;
    }
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
  }

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

  return (
    <div className="space-y-8">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative bg-clinical-teal-surface border border-clinical-teal/20 rounded-2xl overflow-hidden p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-clinical-teal/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-xl shadow-md border-2 border-white shrink-0">
            {studentInitials}
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block font-mono text-[10px] uppercase font-bold tracking-widest text-clinical-teal bg-white/80 border border-clinical-teal/20 px-2.5 py-0.5 rounded mb-1.5">
              IMHS CLINICAL CANDIDATE
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink leading-tight">
              Welcome back, {studentFirstName}! 👋
            </h1>
            <p className="text-sm text-ink-muted font-sans mt-1 leading-relaxed">
              Your portal gives you full access to video lectures, lab references, and certification progress.
            </p>
          </div>
        </div>
      </div>

      {/* ── Vitals Strip ────────────────────────────────────────────────── */}
      <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-chart-grid">
          {/* Enrolled */}
          <div className="px-5 py-4 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold mb-1">Enrolled</p>
            <p className="text-3xl font-mono font-bold text-ink">{enrollments.length}</p>
            <div className="mt-2 flex justify-center">
              <div className="w-8 h-0.5 bg-clinical-teal/30 rounded-full" />
            </div>
          </div>

          {/* Lessons Done */}
          <div className="px-5 py-4 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold mb-1">Lessons Done</p>
            <p className="text-3xl font-mono font-bold text-clinical-teal">{completedCount}</p>
            <div className="mt-2 flex justify-center">
              <VitalLine variant="divider" className="w-8 h-3 opacity-40" />
            </div>
          </div>

          {/* Overall Progress */}
          <div className="px-5 py-4 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-sage font-bold mb-1">Overall Progress</p>
            <p className="text-3xl font-mono font-bold text-chart-red">{overallProgress}%</p>
            <div className="mt-2 flex justify-center">
              <div className="w-8 h-0.5 bg-chart-red/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Full-width progress bar */}
        {totalLessons > 0 && (
          <div className="px-5 pb-4 border-t border-chart-grid/60 pt-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-sage mb-1.5">
              <span>Curriculum Completion</span>
              <span className="font-bold text-ink">{completedCount} / {totalLessons} lessons</span>
            </div>
            <VitalLine variant="progress" progress={overallProgress} />
          </div>
        )}
      </div>

      {/* ── Enrolled Programs Grid ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">My Enrolled Programs</h2>
          <span className="text-xs font-mono text-sage hidden sm:block">
            {enrollments.filter((e) => e.status === "ACTIVE").length} active course{enrollments.filter((e) => e.status === "ACTIVE").length !== 1 ? "s" : ""}
          </span>
        </div>

        {enrollments.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-chart-grid rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-linen border border-chart-grid rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-sage/50" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">No courses yet</h3>
              <p className="text-sm text-ink-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
                Your administrator will assign your first program shortly. Message us on WhatsApp if this looks wrong.
              </p>
            </div>
            <a
              href={`https://wa.me/94778025050?text=${encodeURIComponent("Hello, I have not been assigned a course yet on my IMHS Student Portal.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold mt-1">
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

              const CardInner = (
                <div
                  className={`bg-white border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm transition-all duration-200 ${
                    isFrozen
                      ? "border-chart-red/30"
                      : "border-chart-grid hover:border-clinical-teal/40 hover:shadow-md"
                  }`}
                >
                  {/* Top progress accent */}
                  <div className="h-1 bg-linen relative overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                        isFrozen ? "bg-chart-red/40" : isComplete ? "bg-clinical-teal" : "bg-clinical-teal"
                      }`}
                      style={{ width: `${Math.max(isFrozen ? 100 : 0, pct)}%` }}
                    />
                  </div>

                  {/* Cover image */}
                  {course.coverImage ? (
                    <div className="relative h-36 bg-linen overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isFrozen ? "group-hover:scale-105" : "opacity-50"}`}
                      />
                      {isFrozen && (
                        <div className="absolute inset-0 bg-linen/70 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex items-center gap-1.5 bg-chart-red text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            <Lock className="w-3 h-3" /> Access Frozen
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.category && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 rounded font-bold">
                          {course.category}
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sage bg-linen border border-chart-grid px-2 py-0.5 rounded">
                        {course.enrollmentValidity || "Lifetime Access"}
                      </span>
                      {isComplete && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-clinical-teal bg-clinical-teal/10 border border-clinical-teal/20 px-2 py-0.5 rounded-full font-bold">
                          <Trophy className="w-2.5 h-2.5" /> Complete
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-ink leading-snug flex-1">
                      {course.title}
                    </h3>

                    {/* Progress */}
                    <div className="space-y-2">
                      <VitalLine variant="progress" progress={pct} />
                      <div className="flex items-center justify-between text-[11px] font-mono text-sage">
                        <span>{course.chapters.length} Chapters</span>
                        <span className="font-bold text-ink">{doneCount} / {totalLessonsCount} Lessons</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-3 border-t border-chart-grid/60 mt-auto">
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
                          onClick={(e) => e.stopPropagation()}
                          className="flex w-full items-center justify-center gap-2 text-xs font-semibold font-mono border border-chart-red text-chart-red hover:bg-chart-red hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Access Frozen — Contact Administration
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white px-4 py-2 rounded-xl transition-colors duration-200">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {!isStarted ? "Start Learning" : isComplete ? "Review Syllabus" : "Continue Learning"}
                            <ArrowRight className="w-3 h-3 ml-auto" />
                          </button>
                        </div>
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

      {/* ── Resource Info Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {[
          {
            icon: GraduationCap,
            color: "clinical-teal",
            title: "Official Certification",
            desc: "Upon 100% completion, contact administration to receive your verified IMHS Certificate.",
          },
          {
            icon: FileText,
            color: "clinical-teal",
            title: "PDF Reference Manuals",
            desc: "Each chapter includes downloadable PDF lab references and clinical case studies.",
          },
          {
            icon: MessageSquare,
            color: "chart-red",
            title: "Academic Help Desk",
            desc: "Need portal support or course access help? Reach our administrative desk anytime.",
          },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-white border border-chart-grid rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 bg-${color}/10 border border-${color}/20 rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${color}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">{title}</h3>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
