"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { getEmbeddedDocumentUrl, getDocumentDownloadUrl, getVimeoEmbedUrl } from "@/lib/utils";
import { FormattedText } from "@/components/ui/formatted-text";
import {
  CheckCircle2 as CheckCircleIcon,
  Circle as CircleIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  FileDown as FileDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  BookOpen as BookOpenIcon,
  ArrowLeft as ArrowLeftIcon,
  CheckSquare as CheckSquareIcon,
  Lock as LockIcon,
  HelpCircle as HelpCircleIcon,
  Megaphone as MegaphoneIcon,
  Award as AwardIcon,
  Calendar as CalendarIcon,
  FileCheck as FileCheckIcon,
  ExternalLink as ExternalLinkIcon,
  Play as PlayIcon,
} from "lucide-react";
import { StudentAssignmentsClient } from "@/components/student/StudentAssignmentsClient";

interface Lesson {
  id: string;
  title: string;
  order: number;
  type?: string | null;
  vimeoVideoId?: string | null;
  driveFileId: string | null;
  content: string | null;
  chapterId: string;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CoursePlayerProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    chapters: Chapter[];
    announcements?: {
      id: string;
      title: string;
      content: string;
      createdAt: string | Date;
    }[];
    instructors?: {
      id: string;
      facultyMember: {
        id: string;
        name: string;
        title: string;
        photoUrl: string | null;
      };
    }[];
  };
  initialCompletedLessonIds: string[];
  blockedChapterIds?: string[];
  blockedLessonIds?: string[];
}

function CoursePlayerContent({
  course,
  initialCompletedLessonIds,
  blockedChapterIds = [],
  blockedLessonIds = [],
}: CoursePlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeLessonId = searchParams.get("lessonId");
  const activeAnnouncementId = searchParams.get("announcementId");
  const activeTab = searchParams.get("tab"); // "assignments"

  const allLessons = course.chapters.flatMap((ch) => ch.lessons);

  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Pending Assignment Stats for Hub Card
  const [assignmentSummary, setAssignmentSummary] = useState<{
    pendingCount: number;
    nextTitle?: string;
    nextDueDate?: string;
  }>({ pendingCount: 0 });

  React.useEffect(() => {
    fetch(`/api/student/assignments?courseId=${course.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.assignments && Array.isArray(data.assignments)) {
          const pending = data.assignments.filter(
            (a: any) => !a.submission || a.status === "PENDING" || a.status === "OVERDUE"
          );
          if (pending.length > 0) {
            pending.sort(
              (a: any, b: any) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
            setAssignmentSummary({
              pendingCount: pending.length,
              nextTitle: pending[0].title,
              nextDueDate: pending[0].dueDate,
            });
          } else {
            setAssignmentSummary({ pendingCount: 0 });
          }
        }
      })
      .catch(() => {});
  }, [course.id]);

  // Active Lesson lookup
  const currentLesson = allLessons.find((l) => l.id === activeLessonId) || null;
  const currentIndex = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const currentAnnouncement = course.announcements?.find((a) => a.id === activeAnnouncementId) || null;

  const isCurrentCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;
  const progressPercent = Math.round((completedLessonIds.size / Math.max(1, allLessons.length)) * 100);

  const handleToggleComplete = async (lessonId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCompletedLessonIds((prev) => {
          const next = new Set(prev);
          if (data.completed) {
            next.add(lessonId);
          } else {
            next.delete(lessonId);
          }
          return next;
        });
      }
    } catch {
      // Ignore
    } finally {
      setIsUpdating(false);
    }
  };

  // ── 1. DEDICATED FULL-SCREEN LESSON PLAYER VIEW ──────────────────────────
  if (currentLesson) {
    const currentCh = course.chapters.find((ch) => ch.lessons.some((l) => l.id === currentLesson.id));
    const isChLocked = currentCh ? (blockedChapterIds.includes(currentCh.id) || (currentCh as any).isLocked) : false;
    const isLsLocked = isChLocked || blockedLessonIds.includes(currentLesson.id) || (currentLesson as any).isLocked;

    const isQuiz = currentLesson.type === "QUIZ" || currentLesson.title?.startsWith("Quiz Q");
    const isDocument = !isQuiz && (currentLesson.type === "DOCUMENT" || (!currentLesson.vimeoVideoId && !!currentLesson.driveFileId));
    const isPptx = currentLesson.title?.toLowerCase().includes("pptx") || currentLesson.driveFileId?.toLowerCase().includes("pptx");
    const docBadge = isPptx ? "PPTX" : "PDF";

    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Header Bar with Back to Syllabus button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-chart-grid p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <Link
              href={`/dashboard/courses/${course.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E57A4] hover:underline"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Back to Course Syllabus
            </Link>
            <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-tight">
              {currentLesson.title}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Module: {currentCh?.title || "Course Module"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => handleToggleComplete(currentLesson.id)}
              disabled={isUpdating}
              variant={isCurrentCompleted ? "outline" : "default"}
              size="sm"
              className={`gap-2 font-semibold rounded-xl shrink-0 text-xs px-4 py-2.5 ${
                isCurrentCompleted
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  : "bg-[#0E57A4] hover:bg-[#0c4a8e] text-white border-0 shadow-xs"
              }`}
            >
              <CheckSquareIcon className="w-4 h-4" />
              {isCurrentCompleted ? "✓ Completed" : "Mark as Completed"}
            </Button>
          </div>
        </div>

        {/* Locked Check */}
        {isLsLocked ? (
          <div className="bg-white rounded-3xl border-2 border-red-200 p-8 sm:p-12 space-y-6 shadow-md text-center min-h-[450px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <LockIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                🔒 ACCESS RESTRICTED BY ADMIN
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 pt-2">
                {currentLesson.title} is Blocked
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-sans">
                Access to this specific {isChLocked ? "chapter" : "lesson"} has been locked for your account by IMHS administration. If you require access, please contact administration via WhatsApp.
              </p>
            </div>
          </div>
        ) : (
          /* Main Stage: Player Content */
          <div className="space-y-6">
            {isQuiz ? (
              <div className="bg-white rounded-3xl border border-chart-grid p-6 sm:p-8 space-y-6 shadow-sm min-h-[450px]">
                <div className="flex items-center gap-3 border-b border-chart-grid pb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                    <HelpCircleIcon className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-purple-700 font-bold uppercase tracking-wider block bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded w-max">
                      PRACTICE QUESTION &amp; CLINICAL RATIONALE
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mt-0.5">
                      {currentLesson.title}
                    </h3>
                  </div>
                </div>

                {currentLesson.content ? (
                  <div
                    className="prose prose-sm text-slate-800 max-w-none font-sans leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                ) : (
                  <p className="text-xs font-mono text-slate-400">No detailed explanation provided for this practice question.</p>
                )}
              </div>
            ) : isDocument ? (
              /* PDF / PPTX Document Viewer Stage */
              <div className="bg-white rounded-3xl overflow-hidden border border-chart-grid relative shadow-sm flex flex-col min-h-[650px] sm:min-h-[750px] w-full">
                <div className="bg-slate-50 border-b border-chart-grid p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#0E57A4]/10 flex items-center justify-center shrink-0">
                      <FileTextIcon className="w-4 h-4 text-[#0E57A4]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] text-[#0E57A4] font-bold uppercase tracking-wider block">
                        EMBEDDED {docBadge} LECTURE DOCUMENT
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-sans truncate">
                        {currentLesson.title}
                      </h3>
                    </div>
                  </div>

                  {currentLesson.driveFileId && (
                    <a
                      href={getDocumentDownloadUrl(currentLesson.driveFileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold bg-white hover:bg-[#0E57A4]/10 hover:text-[#0E57A4] border-[#0E57A4]/30 rounded-xl">
                        <FileDownIcon className="w-3.5 h-3.5 text-[#0E57A4]" /> Download PDF Document
                      </Button>
                    </a>
                  )}
                </div>

                <div className="flex-1 w-full h-[650px] sm:h-[750px] bg-slate-900">
                  {currentLesson.driveFileId ? (
                    <iframe
                      src={getEmbeddedDocumentUrl(currentLesson.driveFileId)}
                      className="w-full h-full min-h-[650px] sm:min-h-[750px] border-0"
                      title={currentLesson.title}
                      allow="autoplay"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2 text-white">
                      <FileTextIcon className="w-12 h-12 opacity-40" />
                      <p className="text-xs font-mono opacity-60">No PDF / PPTX document attached to this lesson.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Vimeo Video Stream Stage */
              <div className="bg-white border border-chart-grid rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-chart-grid bg-slate-50">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <VideoIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Video Lecture</p>
                    <p className="text-xs font-bold text-slate-900">{currentLesson.title}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <LockIcon className="w-3 h-3 text-[#0E57A4]" />
                    Domain Protected Stream
                  </div>
                </div>
                <div
                  onContextMenu={(e) => e.preventDefault()}
                  className="bg-black aspect-video relative select-none group/player"
                >
                  <iframe
                    src={getVimeoEmbedUrl(currentLesson.vimeoVideoId)}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                    title="Protected Clinical Stream"
                  />
                </div>
              </div>
            )}

            {/* Lesson Content / Notes Section (Cleaned, no duplicate PDF embeds) */}
            {currentLesson.content && (() => {
              const cleanedNotes = currentLesson.content
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'")
                .replace(/\\/g, "")
                .replace(/<!--[\s\S]*?-->/g, "")
                .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
                .replace(/<p[^>]*>\s*Your browser does not support PDFs[\s\S]*?<\/p>/gi, "")
                .replace(/<a[^>]*>\s*Download the PDF[\s\S]*?<\/a>/gi, "")
                .replace(/<p>\s*<\/p>/gi, "")
                .trim();

              const textOnly = cleanedNotes.replace(/<[^>]*>/g, "").trim();
              if (!textOnly) return null;

              const hasRemainingHtml = cleanedNotes.startsWith("<") || cleanedNotes.includes("<p") || cleanedNotes.includes("<div") || cleanedNotes.includes("<a");

              return (
                <div className="bg-white border border-chart-grid p-6 rounded-3xl space-y-3 shadow-xs">
                  <h4 className="font-mono text-xs text-slate-500 uppercase tracking-wider font-bold">
                    Clinical Notes &amp; Guidance
                  </h4>
                  {hasRemainingHtml ? (
                    <div
                      className="prose prose-sm text-slate-800 max-w-none font-sans leading-relaxed space-y-3"
                      dangerouslySetInnerHTML={{ __html: cleanedNotes }}
                    />
                  ) : (
                    <FormattedText
                      content={cleanedNotes}
                      className="text-sm text-slate-800 font-sans"
                    />
                  )}
                </div>
              );
            })()}

            {/* Next / Previous Lesson Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {prevLesson ? (
                <Link href={`/dashboard/courses/${course.slug}?lessonId=${prevLesson.id}`} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto gap-2 text-xs font-bold justify-center sm:justify-start rounded-xl px-4 py-2.5"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">Prev: {prevLesson.title}</span>
                  </Button>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextLesson ? (
                <Link href={`/dashboard/courses/${course.slug}?lessonId=${nextLesson.id}`} className="w-full sm:w-auto">
                  <Button
                    variant={isCurrentCompleted ? "default" : "outline"}
                    size="sm"
                    className={`w-full sm:w-auto gap-2 text-xs font-bold justify-center sm:justify-end rounded-xl px-4 py-2.5 ${
                      isCurrentCompleted
                        ? "bg-[#0E57A4] hover:bg-[#0c4a8e] text-white border-0 shadow-xs"
                        : ""
                    }`}
                  >
                    <span className="truncate max-w-[200px]">Next: {nextLesson.title}</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 2. DEDICATED ASSIGNMENTS TAB VIEW ────────────────────────────────────
  if (activeTab === "assignments") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between bg-white border border-chart-grid p-4 rounded-2xl">
          <Link
            href={`/dashboard/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E57A4] hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Course Syllabus
          </Link>
        </div>
        <StudentAssignmentsClient courseId={course.id} />
      </div>
    );
  }

  // ── 3. DEDICATED ANNOUNCEMENTS TAB VIEW ─────────────────────────────────
  if (activeTab === "announcements") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between bg-white border border-chart-grid p-4 rounded-2xl">
          <Link
            href={`/dashboard/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E57A4] hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Course Syllabus
          </Link>
          <span className="text-xs font-mono font-semibold text-slate-500">
            Total Announcements ({course.announcements?.length || 0})
          </span>
        </div>

        {/* Header Widget */}
        <div
          className="relative rounded-3xl overflow-hidden border border-white/20 p-7 sm:p-8 text-white space-y-2 shadow-xl"
          style={{
            background: "linear-gradient(135deg, #500713 0%, #881337 45%, #be123c 80%, #9f1239 100%)",
            boxShadow: "0 12px 36px rgba(159,18,57,.35), 0 4px 12px rgba(159,18,57,.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold text-white/90 bg-white/15 border border-white/25 px-3 py-0.5 rounded-full shadow-xs">
              Notice Hub
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">Official Batch Announcements &amp; Notices</h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-3xl leading-relaxed">
            Read all official batch announcements, timetable updates, coursework releases, and administrative notices for {course.title}.
          </p>
        </div>

        {/* Announcements Cards List */}
        {!course.announcements || course.announcements.length === 0 ? (
          <div className="bg-white border border-chart-grid p-12 rounded-3xl text-center space-y-3 shadow-xs">
            <MegaphoneIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Announcements Published</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are no official batch notices published for this course yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {course.announcements.map((a, idx) => (
              <div
                key={a.id}
                className="bg-white border-2 border-rose-100/90 hover:border-rose-300 rounded-3xl p-6 sm:p-7 space-y-4 transition-all duration-200 shadow-xs hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-rose-700 font-bold uppercase tracking-wider inline-block bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full shadow-2xs">
                      Notice #{course.announcements!.length - idx}
                    </span>
                    <h3 className="text-base sm:text-xl font-display font-bold text-slate-900 mt-1">
                      {a.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 shrink-0 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                    <CalendarIcon className="w-4 h-4 text-rose-500" />
                    <span>
                      {new Date(a.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <FormattedText
                  content={a.content}
                  className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── 3. DEDICATED ANNOUNCEMENT VIEW ──────────────────────────────────────
  if (activeAnnouncementId && currentAnnouncement) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between bg-white border border-chart-grid p-4 rounded-2xl">
          <Link
            href={`/dashboard/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#0E57A4] hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Course Syllabus
          </Link>
          {course.announcements && course.announcements.length > 0 && (
            <span className="text-xs font-mono text-slate-500 font-semibold">
              Announcement {course.announcements.findIndex((a) => a.id === currentAnnouncement.id) + 1} of {course.announcements.length}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Active Announcement Detail Stage */}
          <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 space-y-6 shadow-sm min-h-[450px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-red-600 font-bold uppercase tracking-wider inline-block bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                  📢 OFFICIAL BATCH ANNOUNCEMENT
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-1">
                  {currentAnnouncement.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 shrink-0">
                <CalendarIcon className="w-4 h-4 text-red-500" />
                <span>
                  {new Date(currentAnnouncement.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <FormattedText
              content={currentAnnouncement.content}
              className="text-sm text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Right Sidebar: All Batch Announcements List */}
          <div className="bg-white rounded-3xl border border-chart-grid p-5 space-y-4 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                <MegaphoneIcon className="w-4 h-4 text-red-600" />
                All Batch Notices ({course.announcements?.length || 0})
              </h3>
            </div>

            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="space-y-2 max-h-[500px] overflow-y-auto pr-1 touch-pan-y overscroll-contain"
            >
              {course.announcements?.map((a, idx) => {
                const isActive = a.id === currentAnnouncement.id;
                return (
                  <Link
                    key={a.id}
                    href={`/dashboard/courses/${course.slug}?announcementId=${a.id}`}
                    className={`block p-3 rounded-2xl border transition-all ${
                      isActive
                        ? "bg-red-50 border-red-300 shadow-xs font-bold"
                        : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] text-red-600 font-bold uppercase">
                        Notice #{course.announcements!.length - idx}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 line-clamp-2 leading-snug">
                      {a.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 4. DEFAULT: FULL COURSE SYLLABUS & HUB OVERVIEW PAGE ────────────────
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ── Top Header Banner ── */}
      <div
        className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 sm:p-9 rounded-3xl text-white shadow-xl overflow-hidden border border-white/20"
        style={{
          background: "linear-gradient(135deg, #093972 0%, #0E57A4 45%, #1868c2 80%, #0c4887 100%)",
          boxShadow: "0 12px 36px rgba(14,87,164,.35), 0 4px 12px rgba(14,87,164,.2)",
        }}
      >
        <div className="space-y-2.5 max-w-3xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-white/80 hover:text-white transition-colors bg-white/15 px-3 py-1 rounded-full border border-white/25 shadow-xs"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Student Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight tracking-tight pt-1">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-sans">
            Access your course lectures, video recordings, downloadable PDF documents, assignments hub, and official batch notices.
          </p>
        </div>

        {/* Progress Bar Widget */}
        <div className="w-full md:w-72 bg-white/12 backdrop-blur-md p-5 rounded-2xl border border-white/25 shrink-0 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-white/85 uppercase tracking-wider text-[10px]">Overall Completion</span>
            <span className="text-white font-mono text-sm font-bold">{progressPercent}%</span>
          </div>
          <VitalLine variant="progress" progress={progressPercent} />
          <p className="text-[11px] font-mono text-white/75 text-right font-medium">
            {completedLessonIds.size} of {allLessons.length} items completed
          </p>
        </div>
      </div>

      {/* ── Hub Action Cards Bar (Assignments & Announcements) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignments Hub Card */}
        <Link
          href={`/dashboard/courses/${course.slug}?tab=assignments`}
          className="bg-white border-2 border-[#0E57A4]/20 hover:border-[#0E57A4] p-5 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md group relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#0E57A4]/10 text-[#0E57A4] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileCheckIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] uppercase font-bold text-[#0E57A4] bg-[#0E57A4]/10 px-2 py-0.5 rounded-full">
                  Coursework Portal
                </span>
                {assignmentSummary.pendingCount > 0 ? (
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-700 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    ⚡ {assignmentSummary.pendingCount} Pending
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ All Up To Date
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate">Assignments &amp; Worksheets Hub</h3>
              {assignmentSummary.nextTitle && assignmentSummary.nextDueDate ? (
                <p className="text-xs font-medium text-amber-700 truncate flex items-center gap-1">
                  <span className="font-bold">🚨 Next Due:</span>
                  <span className="font-semibold text-slate-900">{assignmentSummary.nextTitle.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\/g, "")}</span>
                  <span className="font-mono text-[11px] text-slate-500">({new Date(assignmentSummary.nextDueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })})</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500">Submit coursework &amp; view qualitative grades</p>
              )}
            </div>
          </div>

          <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-[#0E57A4] shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Batch Announcements Card */}
        {course.announcements && course.announcements.length > 0 ? (
          <Link
            href={`/dashboard/courses/${course.slug}?tab=announcements`}
            className="bg-white border-2 border-red-200 hover:border-red-400 p-5 rounded-2xl flex items-center justify-between gap-4 transition-all shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MegaphoneIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Official Notice Hub
                  </span>
                  <span className="font-mono text-[10px] uppercase font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                    {course.announcements.length} Published
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 truncate">Batch Announcements Portal</h3>
                <p className="text-xs text-slate-600 truncate">
                  Latest: <span className="font-semibold text-slate-900">{course.announcements[0].title}</span>
                </p>
              </div>
            </div>

            <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-red-600 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="bg-white border border-chart-grid p-5 rounded-2xl flex items-center gap-3 text-slate-400 text-xs">
            <MegaphoneIcon className="w-5 h-5 shrink-0 text-slate-300" />
            <span>No pending batch announcements for this course.</span>
          </div>
        )}
      </div>

      {/* ── Main Syllabus Modules & Lessons Container ── */}
      <div className="bg-white border-2 border-slate-200/80 rounded-3xl shadow-sm overflow-hidden space-y-0">
        <div className="p-6 sm:p-7 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-slate-100/60 to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0E57A4]/10 text-[#0E57A4] flex items-center justify-center border border-[#0E57A4]/20 shrink-0 shadow-2xs">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                Course Syllabus &amp; Curriculum Outline
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Click any lesson below to open in dedicated viewer
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#0E57A4] bg-[#0E57A4]/10 border border-[#0E57A4]/20 px-3.5 py-1 rounded-full shrink-0 shadow-2xs">
            {course.chapters.length} Modules · {allLessons.length} Lessons
          </span>
        </div>

        {/* Modules & Lessons List */}
        <div className="divide-y divide-slate-200/70">
          {course.chapters.map((chapter, idx) => {
            const isChBlocked = blockedChapterIds.includes(chapter.id) || (chapter as any).isLocked;

            return (
              <div key={chapter.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#0E57A4] text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                      M{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {chapter.title}
                    </h3>
                  </div>
                  {isChBlocked ? (
                    <span className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                      <LockIcon className="w-3 h-3" /> MODULE LOCKED
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                      {chapter.lessons.length} item{chapter.lessons.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {chapter.lessons.map((lesson) => {
                    const isDone = completedLessonIds.has(lesson.id);
                    const isBlocked = isChBlocked || blockedLessonIds.includes(lesson.id) || (lesson as any).isLocked;
                    const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                    const isDocument = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                    const isPptx = lesson.title?.toLowerCase().includes("pptx") || lesson.driveFileId?.toLowerCase().includes("pptx");
                    const docBadge = isPptx ? "PPTX" : "PDF";

                    const lessonUrl = `/dashboard/courses/${course.slug}?lessonId=${lesson.id}`;

                    return (
                      <Link
                        key={lesson.id}
                        href={isBlocked ? "#" : lessonUrl}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                          isBlocked
                            ? "bg-red-50/40 border-red-200/80 text-red-700 cursor-not-allowed opacity-75"
                            : isDone
                            ? "bg-emerald-50/40 border-emerald-200/70 hover:bg-emerald-100/60 hover:border-emerald-400 hover:shadow-md cursor-pointer"
                            : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-[#0E57A4]/60 hover:shadow-md cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {isBlocked ? (
                            <LockIcon className="w-4 h-4 text-red-500 shrink-0" />
                          ) : isDone ? (
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <CircleIcon className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-[#0E57A4]" />
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#0E57A4] transition-colors">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 flex items-center gap-1.5 ${
                                  isBlocked
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : isQuiz
                                    ? "bg-purple-50 text-purple-800 border border-purple-200/80"
                                    : isDocument
                                    ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                                    : "bg-blue-50 text-blue-800 border border-blue-200/80"
                                }`}
                              >
                                {isQuiz ? (
                                  <>
                                    <HelpCircleIcon className="w-3 h-3 text-purple-700" /> QUESTION
                                  </>
                                ) : isDocument ? (
                                  <>
                                    <FileTextIcon className="w-3 h-3 text-amber-700" /> {docBadge}
                                  </>
                                ) : (
                                  <>
                                    <VideoIcon className="w-3 h-3 text-blue-700" /> VIDEO
                                  </>
                                )}
                              </span>

                              {isDone && <span className="text-emerald-700 font-bold">✓ Completed</span>}
                            </div>
                          </div>
                        </div>

                        {/* Open Lesson Action */}
                        {!isBlocked && (
                          <div className="shrink-0">
                            <div
                              className="w-full sm:w-auto gap-2 text-xs font-bold bg-[#0E57A4] group-hover:bg-[#0c4a8e] text-white rounded-2xl px-4 py-2.5 shadow-xs group-hover:shadow-md transition-all inline-flex items-center justify-center"
                            >
                              <PlayIcon className="w-3.5 h-3.5 fill-white" /> Open Lesson
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Assigned Course Instructors Card ── */}
      {course.instructors && course.instructors.length > 0 && (
        <div className="bg-white border border-chart-grid p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <AwardIcon className="w-4 h-4 text-[#0E57A4]" /> Course Faculty &amp; Instructors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {course.instructors.map((ins) => (
              <div key={ins.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 relative rounded-full overflow-hidden border border-slate-300 shrink-0">
                  <img
                    src={ins.facultyMember.photoUrl || "/lecturer.jpeg"}
                    alt={ins.facultyMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{ins.facultyMember.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 truncate">{ins.facultyMember.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CoursePlayerClient(props: CoursePlayerProps) {
  return (
    <Suspense fallback={
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-mono">
        Loading Course Portal...
      </div>
    }>
      <CoursePlayerContent {...props} />
    </Suspense>
  );
}
