"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Video,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface LessonInput {
  id?: string;
  title: string;
  order: number;
  type?: "VIDEO" | "DOCUMENT";
  vimeoVideoId: string;
  driveFileId: string;
  content: string;
}

interface ChapterInput {
  id?: string;
  title: string;
  order: number;
  lessons: LessonInput[];
}

interface CourseBuilderProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    type?: string | null;
    category?: string | null;
    level?: string | null;
    enrollmentValidity?: string | null;
    totalEnrolled?: number | null;
    published: boolean;
    coverImage: string | null;
    chapters: {
      id: string;
      title: string;
      order: number;
      lessons: {
        id: string;
        title: string;
        order: number;
        type?: string | null;
        vimeoVideoId?: string | null;
        driveFileId?: string | null;
        content?: string | null;
      }[];
    }[];
  };
}

export function CourseBuilderClient({ course }: CourseBuilderProps) {
  const router = useRouter();

  // Course Metadata State
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(course.price);
  const [originalPrice, setOriginalPrice] = useState<number | "">(
    course.originalPrice || ""
  );
  const [type, setType] = useState(course.type || "Course");
  const [category, setCategory] = useState(course.category || "Modern Pharmacy Course");
  const [level, setLevel] = useState(course.level || "All Levels");
  const [enrollmentValidity, setEnrollmentValidity] = useState(course.enrollmentValidity || "Lifetime Access");
  const [totalEnrolled, setTotalEnrolled] = useState<number | "">(course.totalEnrolled || 450);
  const [published, setPublished] = useState(course.published);
  const [coverImage, setCoverImage] = useState(course.coverImage || "");

  // Lecture Chapters State
  const [chapters, setChapters] = useState<ChapterInput[]>(
    course.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      order: ch.order,
      lessons: ch.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        type: (l.type as any) || (l.vimeoVideoId ? "VIDEO" : "DOCUMENT"),
        vimeoVideoId: l.vimeoVideoId || "",
        driveFileId: l.driveFileId || "",
        content: l.content || "",
      })),
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Chapter Manipulation
  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `Chapter ${prev.length + 1}: New Lecture Chapter`,
        order: prev.length + 1,
        lessons: [
          {
            title: `Lesson ${prev.length + 1}.1: Clinical Lecture Title`,
            order: 1,
            type: "VIDEO",
            vimeoVideoId: "76979871",
            driveFileId: "",
            content: "",
          },
        ],
      },
    ]);
  };

  const removeChapter = (cIdx: number) => {
    if (confirm("Are you sure you want to delete this chapter and all its lessons?")) {
      setChapters((prev) => prev.filter((_, idx) => idx !== cIdx));
    }
  };

  const moveChapter = (cIdx: number, dir: -1 | 1) => {
    if (cIdx + dir < 0 || cIdx + dir >= chapters.length) return;
    setChapters((prev) => {
      const next = [...prev];
      const temp = next[cIdx];
      next[cIdx] = next[cIdx + dir];
      next[cIdx + dir] = temp;
      return next;
    });
  };

  // Lesson Manipulation
  const addLesson = (cIdx: number) => {
    setChapters((prev) => {
      const next = [...prev];
      const targetCh = { ...next[cIdx] };
      targetCh.lessons = [
        ...targetCh.lessons,
        {
          title: `Lesson ${cIdx + 1}.${targetCh.lessons.length + 1}: Lecture Title`,
          order: targetCh.lessons.length + 1,
          type: "VIDEO",
          vimeoVideoId: "76979871",
          driveFileId: "",
          content: "",
        },
      ];
      next[cIdx] = targetCh;
      return next;
    });
  };

  const removeLesson = (cIdx: number, lIdx: number) => {
    setChapters((prev) => {
      const next = [...prev];
      const targetCh = { ...next[cIdx] };
      targetCh.lessons = targetCh.lessons.filter((_, idx) => idx !== lIdx);
      next[cIdx] = targetCh;
      return next;
    });
  };

  const updateLesson = (
    cIdx: number,
    lIdx: number,
    field: keyof LessonInput,
    value: string
  ) => {
    setChapters((prev) => {
      const next = [...prev];
      const targetCh = { ...next[cIdx] };
      const targetLesson = { ...targetCh.lessons[lIdx], [field]: value };
      targetCh.lessons[lIdx] = targetLesson;
      next[cIdx] = targetCh;
      return next;
    });
  };

  // Save All Changes to Server
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update Course Metadata
      await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          price: Number(price),
          originalPrice: originalPrice !== "" ? Number(originalPrice) : null,
          type,
          category,
          level,
          enrollmentValidity,
          totalEnrolled: totalEnrolled !== "" ? Number(totalEnrolled) : 450,
          published,
          coverImage,
        }),
      });

      // 2. Save Chapter/Lesson Builder Structure
      const res = await fetch(`/api/admin/courses/${course.id}/builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        router.refresh();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save syllabus structure.");
      }
    } catch (e) {
      alert("Error saving course syllabus");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-4">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Course Manager
          </Link>
          <h1 className="text-3xl font-display font-semibold text-ink">
            Syllabus & Course Builder
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Editing: <span className="font-semibold text-ink">{course.title}</span>
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          variant="default"
          size="lg"
          className="gap-2 font-semibold shadow-md bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving Structure..." : "Save All Changes"}
        </Button>
      </div>

      {saveSuccess && (
        <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-4 rounded text-xs font-mono text-clinical-teal flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-clinical-teal" />
          <span>Course metadata and syllabus chapters saved successfully!</span>
        </div>
      )}

      {/* ── Section 01: Course Metadata Form ── */}
      <div className="bg-surface border border-chart-grid p-6 rounded-card space-y-4 shadow-paper">
        <h2 className="text-lg font-display font-semibold text-ink border-b border-chart-grid pb-3">
          01 / Course Settings & Metadata
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-mono text-ink mb-1 font-medium">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded text-ink font-sans font-medium"
            />
          </div>

          <div>
            <label className="block font-mono text-ink mb-1 font-medium">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded font-mono text-ink"
            />
          </div>
        </div>

        {/* Pricing Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-linen/40 p-3.5 rounded border border-chart-grid">
          <div>
            <label className="block font-mono text-ink mb-1 font-bold">Discounted Current Fee (රු)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-chart-grid rounded font-mono text-ink font-bold"
            />
            <span className="block text-[10px] font-mono text-sage mt-1">Fee charged to students</span>
          </div>

          <div>
            <label className="block font-mono text-ink mb-1 font-bold">Original Price (රු - Strikethrough)</label>
            <input
              type="number"
              placeholder="e.g. 65000"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 bg-white border border-chart-grid rounded font-mono text-sage"
            />
            <span className="block text-[10px] font-mono text-sage mt-1">Strikethrough original price (~~LKR 65,000~~)</span>
          </div>
        </div>

        {/* Type, Category, Level */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-mono text-ink mb-1 font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded font-mono text-ink"
            >
              <option value="Course">Course</option>
              <option value="Bundle">Bundle</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-ink mb-1 font-medium">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded text-ink font-sans"
            />
          </div>

          <div>
            <label className="block font-mono text-ink mb-1 font-medium">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded font-mono text-ink"
            >
              <option value="All Levels">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-ink mb-1 font-medium">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded text-xs text-ink font-sans"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-clinical-teal"
            />
            <span className="text-xs font-mono font-semibold text-ink">
              Published Mode (Visible in Public Catalog & Enrollable)
            </span>
          </label>
        </div>
      </div>

      {/* ── Section 02: Chapter & Lesson Sequence Builder ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-chart-grid pb-3">
          <h2 className="text-xl font-display font-semibold text-ink">
            02 / Chapter & Lesson Sequence Builder ({chapters.length} Chapters)
          </h2>
          <Button onClick={addChapter} size="sm" variant="outline" className="gap-1 text-xs">
            <Plus className="w-4 h-4 text-clinical-teal" /> Add Lecture Chapter
          </Button>
        </div>

        {chapters.map((chapter, cIdx) => (
          <div
            key={cIdx}
            className="bg-surface border-2 border-chart-grid p-6 rounded-card space-y-4 shadow-paper relative"
          >
            <div className="flex items-center justify-between gap-4 border-b border-chart-grid pb-3 bg-linen/40 -mx-6 -mt-6 p-4 rounded-t-card">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-mono text-xs font-bold bg-clinical-teal text-white px-2 py-1 rounded">
                  0{cIdx + 1}
                </span>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setChapters((prev) => {
                      const next = [...prev];
                      next[cIdx] = { ...next[cIdx], title: val };
                      return next;
                    });
                  }}
                  className="flex-1 px-3 py-1.5 bg-surface border border-chart-grid rounded font-mono text-sm font-semibold text-ink"
                  placeholder="Chapter Title"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveChapter(cIdx, -1)}
                  disabled={cIdx === 0}
                  className="p-1 text-ink-muted hover:text-ink disabled:opacity-30"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(cIdx, 1)}
                  disabled={cIdx === chapters.length - 1}
                  className="p-1 text-ink-muted hover:text-ink disabled:opacity-30"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeChapter(cIdx)}
                  className="p-1 text-chart-red hover:text-chart-red-hover ml-2"
                  title="Delete Chapter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lessons List inside Chapter */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-sage uppercase font-semibold">
                  Lessons in 0{cIdx + 1} ({chapter.lessons.length})
                </span>
                <button
                  type="button"
                  onClick={() => addLesson(cIdx)}
                  className="text-xs font-mono text-clinical-teal hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                </button>
              </div>

              {chapter.lessons.map((lesson, lIdx) => (
                <div
                  key={lIdx}
                  className="bg-linen/40 border border-chart-grid p-4 rounded space-y-3 relative"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-chart-grid/60 pb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-[11px] text-sage font-bold">
                        0{cIdx + 1}.0{lIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(cIdx, lIdx, "title", e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-surface border border-chart-grid rounded font-sans text-xs font-semibold text-ink"
                        placeholder="Lesson Title"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(cIdx, lIdx)}
                      className="text-chart-red hover:text-chart-red-hover text-xs font-mono"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Format Selector */}
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <span className="font-mono text-sage text-[10px] uppercase font-bold">FORMAT:</span>
                    <button
                      type="button"
                      onClick={() => updateLesson(cIdx, lIdx, "type", "VIDEO")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border ${
                        (lesson.type || "VIDEO") === "VIDEO"
                          ? "bg-clinical-teal text-white border-clinical-teal shadow-sm"
                          : "bg-surface text-ink border-chart-grid hover:border-clinical-teal"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Video Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLesson(cIdx, lIdx, "type", "DOCUMENT")}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all border ${
                        lesson.type === "DOCUMENT"
                          ? "bg-clinical-teal text-white border-clinical-teal shadow-sm"
                          : "bg-surface text-ink border-chart-grid hover:border-clinical-teal"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> PDF / PPTX Lesson
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {(lesson.type || "VIDEO") === "VIDEO" ? (
                      <>
                        <div>
                          <label className="block font-mono text-sage text-[10px] uppercase mb-0.5 flex items-center gap-1">
                            <Video className="w-3 h-3 text-clinical-teal" /> Vimeo Video ID *
                          </label>
                          <input
                            type="text"
                            value={lesson.vimeoVideoId}
                            onChange={(e) => updateLesson(cIdx, lIdx, "vimeoVideoId", e.target.value)}
                            placeholder="e.g. 76979871"
                            className="w-full px-2.5 py-1 bg-surface border border-chart-grid rounded font-mono text-xs text-ink"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-sage text-[10px] uppercase mb-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-clinical-teal" /> Companion PDF/PPTX File (Optional)
                          </label>
                          <input
                            type="text"
                            value={lesson.driveFileId}
                            onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                            placeholder="e.g. 11A_Sample_Reference.pdf"
                            className="w-full px-2.5 py-1 bg-surface border border-chart-grid rounded font-mono text-xs text-ink"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block font-mono text-sage text-[10px] uppercase mb-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-clinical-teal" /> Google Drive File ID / PDF / PPTX Document *
                        </label>
                        <input
                          type="text"
                          value={lesson.driveFileId}
                          onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                          placeholder="e.g. 11B_Lecture_Presentation.pdf"
                          className="w-full px-2.5 py-1 bg-surface border border-chart-grid rounded font-mono text-xs text-ink"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
