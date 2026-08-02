"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VitalLine } from "@/components/ui/vital-line";
import { Button } from "@/components/ui/button";
import { getEmbeddedDocumentUrl, getDocumentDownloadUrl, getVimeoEmbedUrl } from "@/lib/utils";
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
} from "lucide-react";

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
  };
  initialCompletedLessonIds: string[];
}

export function CoursePlayerClient({
  course,
  initialCompletedLessonIds,
}: CoursePlayerProps) {
  const router = useRouter();
  const allLessons = course.chapters.flatMap((ch) => ch.lessons);

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

  const isCurrentCompleted = completedLessonIds.has(currentLesson?.id || "");
  const progressPercent = Math.round((completedLessonIds.size / allLessons.length) * 100);

  const handleToggleComplete = async () => {
    if (!currentLesson || isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/student/lessons/${currentLesson.id}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setCompletedLessonIds((prev) => {
          const next = new Set(prev);
          if (data.completed) {
            next.add(currentLesson.id);
          } else {
            next.delete(currentLesson.id);
          }
          return next;
        });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-chart-grid pb-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Courses
          </Link>
          <h1 className="text-2xl font-display font-semibold text-ink">
            {course.title}
          </h1>
        </div>

        {/* Vital Line Progress Widget */}
        <div className="bg-surface border border-chart-grid p-3 px-5 rounded-card shrink-0 w-full md:w-64 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sage">Course Completion</span>
            <span className="font-bold text-clinical-teal">{progressPercent}%</span>
          </div>
          <VitalLine variant="progress" progress={progressPercent} />
        </div>
      </div>

      {/* Main Layout: Left Sidebar Chapters & Right Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Chapter Accordion (4 Cols) */}
        <div className="lg:col-span-4 bg-surface border border-chart-grid rounded-card overflow-hidden">
          <div className="p-4 border-b border-chart-grid bg-linen/50 flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold uppercase text-ink flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-clinical-teal" /> Course Syllabus
            </h2>
            <span className="text-[11px] font-mono text-sage">
              {completedLessonIds.size} / {allLessons.length} Done
            </span>
          </div>

          <div className="divide-y divide-chart-grid/60 max-h-[600px] overflow-y-auto">
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="p-3 space-y-2">
                <h3 className="text-xs font-mono font-semibold text-ink px-1">
                  {chapter.title}
                </h3>
                <div className="space-y-1">
                  {chapter.lessons.map((lesson) => {
                    const isSelected = lesson.id === currentLessonId;
                    const isDone = completedLessonIds.has(lesson.id);
                    const isQuiz = lesson.type === "QUIZ" || lesson.title?.startsWith("Quiz Q");
                    const isDocument = !isQuiz && (lesson.type === "DOCUMENT" || (!lesson.vimeoVideoId && !!lesson.driveFileId));
                    const isPptx = lesson.title?.toLowerCase().includes("pptx") || lesson.driveFileId?.toLowerCase().includes("pptx");
                    const docBadge = isPptx ? "PPTX" : "PDF";

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full text-left p-2.5 rounded text-xs transition-colors flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-clinical-teal text-white font-semibold shadow-sm"
                            : "hover:bg-linen text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? "text-white" : "text-clinical-teal"
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? "text-white" : "text-sage"
                              }`}
                            />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        <span className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isQuiz
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : isDocument
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {isQuiz ? <HelpCircle className="w-3 h-3 text-purple-700" /> : isDocument ? <FileText className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                          {isQuiz ? "QUESTION" : isDocument ? docBadge : "VIDEO"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Video & Lesson Content Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
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
                        PRACTICE QUESTION & CLINICAL RATIONALE
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
                /* Domain-Locked Vimeo Video Frame with Anti-Piracy Protection Shield */
                <div
                  onContextMenu={(e) => e.preventDefault()}
                  className="bg-ink rounded-card overflow-hidden border border-chart-grid aspect-video relative shadow-paper-stack select-none group/player"
                >
                  <iframe
                    src={getVimeoEmbedUrl(currentLesson.vimeoVideoId)}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                    title="Protected Clinical Stream"
                  />

                  {/* Top Invisible Shield to prevent clicking external Vimeo header links */}
                  <div className="absolute top-0 inset-x-0 h-12 bg-transparent pointer-events-auto z-10" />

                  {/* Anti-Piracy Watermark Badge */}
                  <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-40 group-hover/player:opacity-90 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5 shadow-md">
                    <Lock className="w-3 h-3 text-clinical-teal" />
                    <span>Domain Locked Stream</span>
                  </div>
                </div>
              )}

              {/* Lesson Controls & Completion Action */}
              <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-4">
                  <div>
                    <span className="font-mono text-[10px] text-sage uppercase font-semibold">
                      CURRENT LESSON
                    </span>
                    <h2 className="text-xl font-display font-semibold text-ink">
                      {currentLesson.title}
                    </h2>
                  </div>

                  <Button
                    onClick={handleToggleComplete}
                    disabled={isUpdating}
                    variant={isCurrentCompleted ? "outline" : "default"}
                    size="sm"
                    className={`gap-2 font-semibold ${
                      isCurrentCompleted ? "border-clinical-teal text-clinical-teal" : ""
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    {isCurrentCompleted ? "Completed (Click to Unmark)" : "Mark as Complete"}
                  </Button>
                </div>

                {/* Lesson Description & Text Content */}
                {currentLesson.content && (
                  <div className="space-y-2">
                    <h4 className="font-mono text-xs text-sage uppercase tracking-wider font-semibold">
                      Clinical Notes & Guidance
                    </h4>
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-line font-sans">
                      {currentLesson.content}
                    </p>
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentLessonId(prevLesson.id)}
                    className="w-full sm:w-auto gap-2 text-xs font-semibold justify-center sm:justify-start"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{prevLesson.title}</span>
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextLesson ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentLessonId(nextLesson.id)}
                    className="w-full sm:w-auto gap-2 text-xs font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 justify-center sm:justify-end"
                  >
                    <span className="truncate max-w-[200px]">{nextLesson.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-chart-grid p-12 rounded-card text-center">
              <p className="text-xs font-mono text-sage">Select a lesson from the syllabus to view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
