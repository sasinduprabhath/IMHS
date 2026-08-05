"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { getEmbeddedDocumentUrl, getDocumentDownloadUrl, getVimeoEmbedUrl } from "@/lib/utils";
import { FormattedText } from "@/components/ui/formatted-text";
import {
  CheckCircle2,
  Circle,
  Video,
  FileText,
  FileDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  CheckSquare,
  Lock,
  HelpCircle,
  Megaphone,
  Award,
  Calendar,
  MessageCircle,
  FileCheck,
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

export function CoursePlayerClient({
  course,
  initialCompletedLessonIds,
  blockedChapterIds = [],
  blockedLessonIds = [],
}: CoursePlayerProps) {
  const router = useRouter();
  const allLessons = course.chapters.flatMap((ch) => ch.lessons);

  // Selection mode: "LESSON" | "ANNOUNCEMENT" | "ASSIGNMENTS"
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    allLessons[0]?.id || ""
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set(initialCompletedLessonIds)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLesson = allLessons.find((l) => l.id === currentLessonId) || allLessons[0];
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const currentAnnouncement = course.announcements?.find(
    (a) => a.id === selectedAnnouncementId
  );

  const isCurrentCompleted = completedLessonIds.has(currentLesson?.id || "");
  const progressPercent = Math.round((completedLessonIds.size / Math.max(1, allLessons.length)) * 100);

  const handleToggleComplete = async () => {
    if (!currentLesson || isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/student/lessons/${currentLesson.id}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCompletedLessonIds((prev) => {
          const next = new Set(prev);
          if (data.completed) {
            next.add(currentLesson.id);
          } else {
            next.delete(currentLesson.id);
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

  const handleSelectLesson = (lessonId: string) => {
    setShowAssignments(false);
    setSelectedAnnouncementId(null);
    setCurrentLessonId(lessonId);
  };

  const handleSelectAnnouncement = (announcementId: string) => {
    setShowAssignments(false);
    setSelectedAnnouncementId(announcementId);
  };

  const handleSelectAssignments = () => {
    setSelectedAnnouncementId(null);
    setShowAssignments(true);
  };

  // Determine main right content
  let mainContent: React.ReactNode = null;

  if (showAssignments) {
    mainContent = <StudentAssignmentsClient courseId={course.id} />;
  } else if (selectedAnnouncementId && currentAnnouncement) {
    mainContent = (
      <div className="bg-surface rounded-card overflow-hidden border-2 border-chart-red/30 p-6 sm:p-8 space-y-6 shadow-paper-stack min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-chart-grid pb-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-chart-red font-bold uppercase tracking-wider block bg-chart-red/10 border border-chart-red/20 px-2.5 py-0.5 rounded w-max">
              📢 OFFICIAL BATCH ANNOUNCEMENT
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-ink mt-1">
              {currentAnnouncement.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-sage shrink-0">
            <Calendar className="w-4 h-4 text-chart-red" />
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
          className="text-sm text-ink leading-relaxed font-sans"
        />
      </div>
    );
  } else if (currentLesson) {
    const currentCh = course.chapters.find((ch) => ch.lessons.some((l) => l.id === currentLesson.id));
    const isChLocked = currentCh ? (blockedChapterIds.includes(currentCh.id) || (currentCh as any).isLocked) : false;
    const isLsLocked = isChLocked || blockedLessonIds.includes(currentLesson.id) || (currentLesson as any).isLocked;

    if (isLsLocked) {
      mainContent = (
        <div className="bg-surface rounded-card overflow-hidden border-2 border-chart-red/30 p-8 sm:p-12 space-y-6 shadow-paper text-center min-h-[450px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-chart-red/10 border border-chart-red/20 flex items-center justify-center text-chart-red mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-chart-red font-bold uppercase tracking-wider bg-chart-red/10 border border-chart-red/20 px-3 py-1 rounded-full">
              🔒 ACCESS RESTRICTED BY ADMIN
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-ink pt-2">
              {currentLesson.title} is Blocked
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed font-sans">
              Access to this specific {isChLocked ? "chapter" : "lesson"} has been locked for your account by IMHS administration. If you require access or have fee inquiries, please contact administration via WhatsApp.
            </p>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/94770000000?text=Hello%20IMHS%20Admin,%20my%20access%20to%20${encodeURIComponent(currentLesson.title)}%20is%20blocked`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="danger" size="sm" className="gap-2 font-semibold text-xs">
                Contact Administration on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      );
    } else {
      mainContent = (
        <div className="space-y-6">
          {/* Conditional Renderer: QUIZ vs DOCUMENT (PDF / PPTX) vs VIDEO */}
          {currentLesson.type === "QUIZ" || currentLesson.title?.startsWith("Quiz Q") ? (
            <div className="bg-surface rounded-card overflow-hidden border-2 border-chart-grid p-6 sm:p-8 space-y-6 shadow-paper-stack min-h-[500px]">
              <div className="flex items-center gap-3 border-b border-chart-grid pb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-purple-700 font-bold uppercase tracking-wider block bg-purple-50 border border-purple-200 px-2 py-0.5 rounded w-max">
                    PRACTICE QUESTION &amp; CLINICAL RATIONALE
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-ink font-sans mt-0.5">
                    {currentLesson.title}
                  </h3>
                </div>
              </div>

              {currentLesson.content ? (
                <div
                  className="prose prose-sm text-ink max-w-none font-sans leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              ) : (
                <p className="text-xs font-mono text-sage">No detailed explanation provided for this practice question.</p>
              )}
            </div>
          ) : currentLesson.type === "DOCUMENT" || (!currentLesson.vimeoVideoId && currentLesson.driveFileId) ? (
            <div className="bg-surface rounded-card overflow-hidden border-2 border-chart-grid relative shadow-paper-stack flex flex-col min-h-[600px] sm:min-h-[700px] w-full">
              <div className="bg-linen border-b border-chart-grid p-3 sm:p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded bg-clinical-teal/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-clinical-teal" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] text-clinical-teal font-bold uppercase tracking-wider block">
                      EMBEDDED PDF / PPTX LECTURE
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-ink font-sans truncate">
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
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold bg-white hover:bg-clinical-teal/10 hover:text-clinical-teal border-clinical-teal/30">
                      <FileDown className="w-3.5 h-3.5 text-clinical-teal" /> Download PDF
                    </Button>
                  </a>
                )}
              </div>

              <div className="flex-1 w-full h-[600px] sm:h-[700px] bg-linen">
                {currentLesson.driveFileId ? (
                  <iframe
                    src={getEmbeddedDocumentUrl(currentLesson.driveFileId)}
                    className="w-full h-full min-h-[600px] sm:min-h-[700px] border-0"
                    title={currentLesson.title}
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2">
                    <FileText className="w-12 h-12 text-sage/40" />
                    <p className="text-xs font-mono text-sage">No PDF / PPTX document attached to this lesson.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Domain-Locked Vimeo Video Frame */
            <div className="bg-white border border-chart-grid rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-chart-grid bg-linen/40">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-sage font-bold">Video Lecture</p>
                  <p className="text-xs font-semibold text-ink">{currentLesson.title}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-sage">
                  <Lock className="w-3 h-3 text-clinical-teal" />
                  Domain Locked
                </div>
              </div>
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="bg-ink aspect-video relative select-none group/player"
              >
                <iframe
                  src={getVimeoEmbedUrl(currentLesson.vimeoVideoId)}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full border-0"
                  title="Protected Clinical Stream"
                />
                <div className="absolute top-0 inset-x-0 h-12 bg-transparent pointer-events-auto z-10" />
              </div>
            </div>
          )}

          {/* Lesson Controls & Completion Action */}
          <div className="bg-white border border-chart-grid p-5 rounded-2xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-4">
              <div>
                <span className="font-mono text-[10px] text-sage uppercase font-bold tracking-wider">
                  Current Lesson
                </span>
                <h2 className="text-base font-semibold text-ink mt-0.5">
                  {currentLesson.title}
                </h2>
              </div>

              <Button
                onClick={handleToggleComplete}
                disabled={isUpdating}
                variant={isCurrentCompleted ? "outline" : "default"}
                size="sm"
                className={`gap-2 font-semibold rounded-xl shrink-0 ${isCurrentCompleted
                    ? "border-clinical-teal text-clinical-teal hover:bg-clinical-teal/5"
                    : "bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0"
                  }`}
              >
                <CheckSquare className="w-4 h-4" />
                {isCurrentCompleted ? "✓ Completed (click to undo)" : "Mark as Completed"}
              </Button>
            </div>

            {/* Lesson Description */}
            {currentLesson.content && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs text-sage uppercase tracking-wider font-semibold">
                  Clinical Notes &amp; Guidance
                </h4>
                <FormattedText
                  content={currentLesson.content}
                  className="text-sm text-ink font-sans"
                />
              </div>
            )}

            {/* Download PDF Resource Link */}
            {currentLesson.driveFileId && (
              <div className="pt-2">
                <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-3.5 sm:p-4 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="w-9 h-9 bg-clinical-teal/15 border border-clinical-teal/30 rounded-lg flex items-center justify-center shrink-0">
                      <FileDown className="w-5 h-5 text-clinical-teal shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-ink font-mono truncate">
                        Resource File: {currentLesson.driveFileId.includes("drive.google.com") || currentLesson.driveFileId.length > 30 ? "Official PDF Reference File" : currentLesson.driveFileId}
                      </h5>
                      <p className="text-[11px] text-ink-muted leading-snug">
                        Official PDF reference file for this lecture.
                      </p>
                    </div>
                  </div>

                  <a
                    href={getDocumentDownloadUrl(currentLesson.driveFileId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto shrink-0"
                  >
                    <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1.5 text-xs font-semibold bg-white hover:bg-clinical-teal/10 hover:text-clinical-teal border-clinical-teal/30 py-2.5 sm:py-1.5">
                      <FileDown className="w-4 h-4 text-clinical-teal" /> Download PDF Reference
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Prev / Next Lesson Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {prevLesson ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectLesson(prevLesson.id)}
                className="w-full sm:w-auto gap-2 text-xs font-semibold justify-center sm:justify-start rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate max-w-[180px]">{prevLesson.title}</span>
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {nextLesson ? (
              <Button
                variant={isCurrentCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectLesson(nextLesson.id)}
                className={`w-full sm:w-auto gap-2 text-xs font-semibold justify-center sm:justify-end rounded-xl ${isCurrentCompleted
                    ? "bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0"
                    : ""
                  }`}
              >
                <span className="truncate max-w-[180px]">{nextLesson.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </div>
      );
    }
  } else {
    mainContent = (
      <div className="bg-surface border border-chart-grid p-12 rounded-card text-center">
        <p className="text-xs font-mono text-sage">Select a lesson or announcement from the syllabus to view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Bar: Back Link + Progress Indicator */}
      <div className="bg-surface border border-chart-grid p-4 sm:p-5 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-paper">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-sage hover:text-clinical-teal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-display font-semibold text-ink leading-tight">
            {course.title}
          </h1>
        </div>

        {/* Progress Bar Widget */}
        <div className="w-full md:w-64 space-y-1 bg-linen/50 p-2.5 rounded border border-chart-grid">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage">Course Progress</span>
            <span className="font-bold text-clinical-teal">{progressPercent}%</span>
          </div>
          <VitalLine variant="progress" progress={progressPercent} />
        </div>
      </div>

      {/* Main Player Grid Layout (4 Cols Sidebar + 8 Cols Stage) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Syllabus Outline (4 Cols) */}
        <div className="lg:col-span-4 bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden space-y-0">
          <div className="p-4 border-b border-chart-grid bg-linen/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-clinical-teal" />
              <h2 className="text-sm font-display font-semibold text-ink">
                Syllabus &amp; Announcements
              </h2>
            </div>
            <span className="text-[10px] font-mono text-sage">
              {allLessons.length} items
            </span>
          </div>

          {/* Assignments & Worksheets Button */}
          <div className="p-3 bg-[#0E57A4]/5 border-b border-[#0E57A4]/15">
            <button
              onClick={handleSelectAssignments}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 border-l-2 ${
                showAssignments
                  ? "bg-[#0E57A4] text-white shadow-sm border-l-white"
                  : "bg-white text-[#0E57A4] border-l-[#0E57A4] hover:bg-[#0E57A4]/10 shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-2 font-mono font-bold">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>Assignments &amp; Worksheets</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                  showAssignments ? "bg-white/20 text-white" : "bg-[#0E57A4]/15 text-[#0E57A4]"
                }`}
              >
                HUB
              </span>
            </button>
          </div>

          <div className="divide-y divide-chart-grid max-h-[600px] overflow-y-auto">
            {/* Official Announcements Section */}
            {course.announcements && course.announcements.length > 0 && (
              <div className="p-3 space-y-2 bg-chart-red/5 border-b border-chart-red/20">
                <h3 className="text-xs font-mono font-bold text-chart-red flex items-center gap-1.5 px-1">
                  <Megaphone className="w-3.5 h-3.5" /> Batch Notices &amp; Updates ({course.announcements.length})
                </h3>
                <div className="space-y-1">
                  {course.announcements.map((ann) => {
                    const isSelected = selectedAnnouncementId === ann.id;
                    return (
                      <button
                        key={ann.id}
                        onClick={() => handleSelectAnnouncement(ann.id)}
                        className={`w-full text-left p-2.5 rounded text-xs transition-colors flex items-center justify-between gap-2 border-l-2 ${isSelected
                            ? "bg-chart-red text-white font-semibold shadow-sm border-l-white/40"
                            : "hover:bg-chart-red/10 text-ink border-l-chart-red"
                          }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <Megaphone
                            className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-chart-red"
                              }`}
                          />
                          <span className="truncate">{ann.title}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${isSelected
                              ? "bg-white/20 text-white"
                              : "bg-chart-red/10 text-chart-red border border-chart-red/20"
                            }`}
                        >
                          NOTICE
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Syllabus Chapters */}
            {course.chapters.map((chapter) => {
              const isChBlocked = blockedChapterIds.includes(chapter.id) || (chapter as any).isLocked;

              return (
                <div key={chapter.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-mono font-semibold text-ink">
                      {chapter.title}
                    </h3>
                    {isChBlocked && (
                      <span className="text-[9px] font-mono text-chart-red bg-chart-red/10 border border-chart-red/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> CH LOCKED
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {chapter.lessons.map((lesson) => {
                      const isSelected = !selectedAnnouncementId && lesson.id === currentLessonId;
                      const isDone = completedLessonIds.has(lesson.id);
                      const isBlocked = isChBlocked || blockedLessonIds.includes(lesson.id) || (lesson as any).isLocked;
                      const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                      const isDocument = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                      const isPptx = lesson.title?.toLowerCase().includes("pptx") || lesson.driveFileId?.toLowerCase().includes("pptx");
                      const docBadge = isPptx ? "PPTX" : "PDF";

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          className={`w-full text-left p-2.5 rounded text-xs transition-colors flex items-center justify-between gap-2 border-l-2 ${
                            isSelected
                              ? isBlocked
                                ? "bg-chart-red text-white font-semibold shadow-sm border-l-white/40"
                                : "bg-clinical-teal text-white font-semibold shadow-sm border-l-white/40"
                              : isBlocked
                              ? "bg-chart-red/5 text-chart-red border-l-chart-red/40 hover:bg-chart-red/10"
                              : isDone
                              ? "hover:bg-linen text-ink border-l-clinical-teal/30"
                              : "hover:bg-linen text-ink border-l-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            {isBlocked ? (
                              <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-chart-red"}`} />
                            ) : isDone ? (
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-clinical-teal"}`} />
                            ) : (
                              <Circle className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-sage"}`} />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : isBlocked
                                ? "bg-chart-red/10 text-chart-red border border-chart-red/20 font-bold"
                                : isQuiz
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : isDocument
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isBlocked ? (
                              <>🔒 BLOCKED</>
                            ) : (
                              <>
                                {isQuiz ? <HelpCircle className="w-3 h-3 text-purple-700" /> : isDocument ? <FileText className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                {isQuiz ? "QUESTION" : isDocument ? docBadge : "VIDEO"}
                              </>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Course Instructors Widget */}
          {course.instructors && course.instructors.length > 0 && (
            <div className="p-4 bg-surface border-t border-chart-grid space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase text-ink flex items-center gap-1.5 border-b border-chart-grid pb-2">
                <Award className="w-4 h-4 text-clinical-teal" /> Course Instructors
              </h3>
              <div className="space-y-2">
                {course.instructors.map((ins) => (
                  <div key={ins.id} className="flex items-center gap-2.5 p-2 bg-linen/30 rounded border border-chart-grid/60">
                    <div className="w-8 h-8 relative rounded-full overflow-hidden border border-chart-grid shrink-0">
                      <img
                        src={ins.facultyMember.photoUrl || "/lecturer.jpeg"}
                        alt={ins.facultyMember.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-ink truncate font-sans">
                        {ins.facultyMember.name}
                      </div>
                      <div className="text-[10px] font-mono text-clinical-teal truncate">
                        {ins.facultyMember.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Video & Lesson Content Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {mainContent}
        </div>
      </div>
    </div>
  );
}
