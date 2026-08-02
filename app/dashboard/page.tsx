import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { createCourseInquiryWALink, createFrozenCourseInquiryWALink } from "@/lib/whatsapp";
import {
  BookOpen, PlayCircle, CheckCircle2, MessageSquare,
  ArrowRight, Trophy, Clock, Microscope, GraduationCap,
  FileText, ShieldCheck, Flame, Sparkles, User, Award
} from "lucide-react";

export const metadata = { title: "Student Clinical Learning Portal — IMHS" };

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
  const completedCoursesCount = enrollments.filter((e) => {
    const allL = e.course.chapters.flatMap((ch: any) => ch.lessons);
    return allL.length > 0 && allL.every((l: any) => completedLessonIds.has(l.id));
  }).length;

  const studentFirstName = session?.user?.name?.split(" ")[0] || "Learner";
  const studentInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ST";

  return (
    <div className="space-y-8">

      {/* ── Student Hero Banner ── */}
      <div className="relative bg-clinical-teal-surface border border-clinical-teal/20 rounded-card overflow-hidden p-5 sm:p-6 md:p-8 shadow-paper">
        <div className="absolute top-0 right-0 w-80 h-80 bg-clinical-teal/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-clinical-teal text-white flex items-center justify-center font-mono font-bold text-lg sm:text-xl shadow-md border-2 border-white shrink-0">
                {studentInitials}
              </div>
              <div className="sm:hidden space-y-1">
                <span className="font-mono text-[10px] text-clinical-teal font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-clinical-teal/20 block w-fit">
                  IMHS CLINICAL CANDIDATE
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-clinical-teal font-semibold uppercase tracking-wider bg-white px-2.5 py-0.5 rounded border border-clinical-teal/20">
                  IMHS CLINICAL CANDIDATE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
                Welcome back, {studentFirstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted font-sans max-w-xl leading-relaxed">
                Your portal gives you full access to video lectures, lab references, and certification progress.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-chart-grid/60">
            <div className="bg-surface border border-chart-grid rounded-card px-2.5 sm:px-4 py-3 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-mono font-bold text-ink">{enrollments.length}</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-sage uppercase mt-0.5">Enrolled</div>
            </div>
            <div className="bg-surface border border-chart-grid rounded-card px-2.5 sm:px-4 py-3 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-mono font-bold text-clinical-teal">{completedCount}</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-sage uppercase mt-0.5">Lessons Done</div>
            </div>
            <div className="bg-surface border border-chart-grid rounded-card px-2.5 sm:px-4 py-3 text-center shadow-sm">
              <div className="text-xl sm:text-2xl font-mono font-bold text-chart-red">{overallProgress}%</div>
              <div className="text-[9px] sm:text-[10px] font-mono text-sage uppercase mt-0.5">Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Enrolled Programs ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-chart-grid">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-clinical-teal/10 border border-clinical-teal/20 rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-clinical-teal" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-ink">My Enrolled Programs</h2>
              <p className="text-xs text-sage font-mono">Access your active course syllabus and modules</p>
            </div>
          </div>
          <span className="text-xs font-mono text-sage bg-linen border border-chart-grid px-3 py-1 rounded-full hidden sm:inline-block">
            {completedCount} of {totalLessons} total lessons completed
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-surface border border-chart-grid rounded-card p-12 text-center space-y-5 max-w-lg mx-auto shadow-paper">
            <div className="w-16 h-16 bg-linen border border-chart-grid rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-sage/60" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-ink font-display">No Active Course Assigned Yet</h3>
              <p className="text-xs text-ink-muted leading-relaxed font-sans max-w-sm mx-auto">
                Your account is set up. Contact our desk if your course enrollment needs manual provisioning.
              </p>
            </div>
            <Link href="/contact" className="inline-block">
              <Button className="gap-2 bg-chart-red hover:bg-chart-red-hover text-white border-0 font-semibold">
                <MessageSquare className="w-4 h-4" />
                Contact Admissions Desk
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enr: any) => {
              const course = enr.course;
              const isFrozen = enr.status === "FROZEN";
              const allLessons = course.chapters.flatMap((ch: any) => ch.lessons);
              const totalLessonsCount = allLessons.length;
              const doneCount = allLessons.filter((l: any) => completedLessonIds.has(l.id)).length;
              const pct = totalLessonsCount > 0 ? Math.round((doneCount / totalLessonsCount) * 100) : 0;
              const courseCode = course.slug.split("-").slice(0, 2).join("-").toUpperCase();
              const isComplete = pct === 100;
              const isStarted = doneCount > 0;

              const cardContent = (
                <div
                  className={`bg-surface border rounded-card overflow-hidden transition-all duration-300 group flex flex-col shadow-paper h-full ${
                    isFrozen
                      ? "border-chart-red/40 bg-chart-red/5 cursor-not-allowed"
                      : "border-chart-grid hover:border-clinical-teal hover:shadow-xl cursor-pointer"
                  }`}
                >
                  {/* Top Progress Indicator Bar */}
                  <div className="h-1.5 bg-linen relative overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                        isFrozen
                          ? "bg-chart-red"
                          : isComplete
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-clinical-teal to-chart-red"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="p-6 space-y-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-chart-red uppercase tracking-wider font-bold bg-chart-red-light px-2.5 py-0.5 rounded">
                          {courseCode}
                        </span>
                        {isFrozen ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-chart-red bg-chart-red/10 border border-chart-red/30 px-2.5 py-0.5 rounded-full font-bold">
                            Access Frozen
                          </span>
                        ) : isComplete ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-bold">
                            <Trophy className="w-3 h-3 text-green-600" /> Complete
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-base font-semibold font-sans text-ink leading-snug line-clamp-2 group-hover:text-clinical-teal transition-colors">
                        {course.title}
                      </h3>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-sage flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-clinical-teal" /> Module Progress
                        </span>
                        <span className={`font-bold ${isFrozen ? "text-chart-red" : isComplete ? "text-green-600" : "text-clinical-teal"}`}>
                          {pct}%
                        </span>
                      </div>
                      <VitalLine variant="progress" progress={pct} />
                      <div className="flex items-center justify-between text-[11px] font-mono text-sage">
                        <span>{course.chapters.length} Chapters</span>
                        <span className="font-semibold">{doneCount} / {totalLessonsCount} lessons</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-chart-grid/60 mt-auto">
                      {isFrozen ? (
                        <Link
                          href={createFrozenCourseInquiryWALink(
                            course.title,
                            courseCode,
                            session?.user?.name || undefined,
                            session?.user?.email || undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            className="w-full gap-2 font-semibold text-xs bg-chart-red hover:bg-chart-red-hover text-white border-0"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Access Frozen — Contact Admin
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          className={`w-full gap-2 font-semibold group/btn text-xs ${
                            isComplete
                              ? "bg-green-600 hover:bg-green-700 text-white border-0"
                              : "bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0"
                          }`}
                          size="sm"
                        >
                          <PlayCircle className="w-4 h-4" />
                          {!isStarted ? "Start Learning" : isComplete ? "Review Syllabus" : "Continue Program"}
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform ml-auto" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );

              return isFrozen ? (
                <React.Fragment key={course.id}>{cardContent}</React.Fragment>
              ) : (
                <Link key={course.id} href={`/dashboard/courses/${course.slug}`} className="block">
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Student Portal Resource Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-surface border border-chart-grid rounded-card p-5 space-y-3 hover:border-clinical-teal/40 transition-colors shadow-paper">
          <div className="w-9 h-9 bg-clinical-teal/10 border border-clinical-teal/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-clinical-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink font-sans">Official Certification</h3>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Upon 100% completion of all video lessons, contact administration to receive your verified IMHS Certificate.
            </p>
          </div>
        </div>

        <div className="bg-surface border border-chart-grid rounded-card p-5 space-y-3 hover:border-clinical-teal/40 transition-colors shadow-paper">
          <div className="w-9 h-9 bg-clinical-teal/10 border border-clinical-teal/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-clinical-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink font-sans">PDF Reference Manuals</h3>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Each course chapter includes downloadable PDF lab reference manuals and clinical case studies.
            </p>
          </div>
        </div>

        <div className="bg-surface border border-chart-grid rounded-card p-5 space-y-3 hover:border-clinical-teal/40 transition-colors shadow-paper">
          <div className="w-9 h-9 bg-chart-red/10 border border-chart-red/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-chart-red" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink font-sans">Academic Help Desk</h3>
            <p className="text-xs text-ink-muted leading-relaxed mt-1">
              Need assistance with your portal password or course syllabus? Reach out to our administrative desk.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
