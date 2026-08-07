"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  BookOpen,
  DollarSign,
  FileText,
  Layers,
  Eye,
  Plus,
  Trash2,
  Video,
  MoveUp,
  MoveDown,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LessonDraft {
  tempId: string;
  title: string;
  type: "VIDEO" | "DOCUMENT";
  vimeoVideoId: string;
  driveFileId: string;
}

interface ChapterDraft {
  tempId: string;
  title: string;
  lessons: LessonDraft[];
}

interface CourseForm {
  // Step 1 - Identity
  title: string;
  slug: string;
  type: string;
  category: string;
  // Step 2 - Pricing
  price: number | "";
  originalPrice: number | "";
  // Step 3 - Details
  level: string;
  description: string;
  coverImage: string;
  // Step 4 - Syllabus
  chapters: ChapterDraft[];
  // Step 5 - Publish
  published: boolean;
}

const INITIAL_FORM: CourseForm = {
  title: "",
  slug: "",
  type: "Course",
  category: "Modern Pharmacy Course",
  price: 45000,
  originalPrice: 65000,
  level: "All Levels",
  description: "",
  coverImage: "",
  chapters: [],
  published: false,
};

const STEPS = [
  { id: 1, label: "Identity", icon: BookOpen },
  { id: 2, label: "Pricing", icon: DollarSign },
  { id: 3, label: "Details", icon: FileText },
  { id: 4, label: "Syllabus", icon: Layers },
  { id: 5, label: "Review", icon: Eye },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function slugify(val: string) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: React.Dispatch<React.SetStateAction<CourseForm>>;
}) {
  const handleTitle = (val: string) => {
    setForm((f) => ({ ...f, title: val, slug: slugify(val) }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
            Course Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Modern Pharmacy Course (SLMC Prep)"
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal/20"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
            URL Slug *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-muted select-none">/courses/</span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full pl-[70px] pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
            Course Type
          </label>
          <CustomSelect
            options={[
              { value: "Course", label: "Course" },
              { value: "Bundle", label: "Bundle" },
            ]}
            value={form.type}
            onChange={(val) => setForm((f) => ({ ...f, type: val }))}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Modern Pharmacy Course"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: React.Dispatch<React.SetStateAction<CourseForm>>;
}) {
  return (
    <div className="space-y-5">
      <div className="bg-linen/40 p-5 rounded-card border border-chart-grid space-y-5">
        <div>
          <label className="block text-xs font-mono text-ink font-bold mb-1.5">
            Discounted Current Fee (රු) *
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: e.target.value !== "" ? Number(e.target.value) : "" }))
            }
            className="w-full px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-lg font-mono text-ink font-bold focus:outline-none focus:border-clinical-teal"
          />
          <p className="text-[10px] font-mono text-sage mt-1.5">
            This is the actual price charged to the student.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono text-ink font-bold mb-1.5">
            Original Price (රු - Strikethrough, optional)
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 65000"
            value={form.originalPrice}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                originalPrice: e.target.value !== "" ? Number(e.target.value) : "",
              }))
            }
            className="w-full px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-lg font-mono text-sage focus:outline-none focus:border-clinical-teal"
          />
          <p className="text-[10px] font-mono text-sage mt-1.5">
            Higher price shown with a strikethrough to show a discount (e.g.{" "}
            <span className="line-through">LKR 65,000</span>).
          </p>
        </div>
      </div>

      {/* Preview */}
      {typeof form.price === "number" && (
        <div className="p-4 rounded-card border border-clinical-teal/30 bg-clinical-teal-surface/30 flex items-center gap-4">
          <div>
            <p className="text-xs font-mono text-sage mb-0.5">Preview</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-ink">
                LKR {Number(form.price).toLocaleString()}
              </span>
              {typeof form.originalPrice === "number" && (
                <span className="text-base text-sage line-through font-mono">
                  LKR {form.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {typeof form.originalPrice === "number" && typeof form.price === "number" && (
              <span className="text-[10px] font-mono text-chart-red font-bold">
                Save LKR {(form.originalPrice - form.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: React.Dispatch<React.SetStateAction<CourseForm>>;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Level
        </label>
        <CustomSelect
          options={[
            { value: "All Levels", label: "All Levels" },
            { value: "Beginner", label: "Beginner" },
            { value: "Intermediate", label: "Intermediate" },
            { value: "Expert", label: "Expert" },
          ]}
          value={form.level}
          onChange={(val) => setForm((f) => ({ ...f, level: val }))}
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Course Description *
        </label>
        <textarea
          rows={5}
          required
          placeholder="Detailed overview of what students will master in this course..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal resize-none"
        />
        <p className="text-[10px] font-mono text-sage mt-1">
          {form.description.length} characters
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Cover Image URL
        </label>
        <input
          type="url"
          placeholder="https://example.com/image.png"
          value={form.coverImage}
          onChange={(e) => {
            setImgError(false);
            setForm((f) => ({ ...f, coverImage: e.target.value }));
          }}
          className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
        />

        {/* Live preview */}
        {form.coverImage && (
          <div className="mt-3 relative h-44 w-full rounded-card overflow-hidden border border-chart-grid bg-linen">
            {!imgError ? (
              <Image
                src={form.coverImage}
                alt="Cover preview"
                fill
                className="object-cover"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-mono text-ink-muted">
                ⚠ Image failed to load - check the URL
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: React.Dispatch<React.SetStateAction<CourseForm>>;
}) {
  const addChapter = () => {
    setForm((f) => ({
      ...f,
      chapters: [
        ...f.chapters,
        { tempId: uid(), title: `Chapter ${f.chapters.length + 1}`, lessons: [] },
      ],
    }));
  };

  const removeChapter = (cId: string) =>
    setForm((f) => ({ ...f, chapters: f.chapters.filter((c) => c.tempId !== cId) }));

  const updateChapterTitle = (cId: string, title: string) =>
    setForm((f) => ({
      ...f,
      chapters: f.chapters.map((c) => (c.tempId === cId ? { ...c, title } : c)),
    }));

  const moveChapter = (cId: string, dir: -1 | 1) => {
    setForm((f) => {
      const arr = [...f.chapters];
      const idx = arr.findIndex((c) => c.tempId === cId);
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return f;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return { ...f, chapters: arr };
    });
  };

  const addLesson = (cId: string) =>
    setForm((f) => ({
      ...f,
      chapters: f.chapters.map((c) =>
        c.tempId === cId
          ? {
            ...c,
            lessons: [
              ...c.lessons,
              {
                tempId: uid(),
                title: `Lesson ${c.lessons.length + 1}`,
                type: "VIDEO",
                vimeoVideoId: "",
                driveFileId: "",
              },
            ],
          }
          : c
      ),
    }));

  const updateLesson = (cId: string, lId: string, patch: Partial<LessonDraft>) =>
    setForm((f) => ({
      ...f,
      chapters: f.chapters.map((c) =>
        c.tempId === cId
          ? {
            ...c,
            lessons: c.lessons.map((l) => (l.tempId === lId ? { ...l, ...patch } : l)),
          }
          : c
      ),
    }));

  const removeLesson = (cId: string, lId: string) =>
    setForm((f) => ({
      ...f,
      chapters: f.chapters.map((c) =>
        c.tempId === cId
          ? { ...c, lessons: c.lessons.filter((l) => l.tempId !== lId) }
          : c
      ),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-ink-muted">
          Build your syllabus here, or skip and add it later in the course editor.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={addChapter} className="gap-1.5 text-xs font-mono shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Chapter
        </Button>
      </div>

      {form.chapters.length === 0 && (
        <div className="border-2 border-dashed border-chart-grid rounded-card p-10 text-center text-ink-muted">
          <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-mono">No chapters yet.</p>
          <p className="text-xs mt-1 text-sage">Click "Add Chapter" to start building your syllabus.</p>
        </div>
      )}

      <div className="space-y-3">
        {form.chapters.map((chapter, cIdx) => (
          <div key={chapter.tempId} className="border border-chart-grid rounded-card overflow-hidden">
            {/* Chapter Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-linen/60 border-b border-chart-grid">
              <span className="text-[10px] font-mono text-sage shrink-0">CH {String(cIdx + 1).padStart(2, "0")}</span>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapterTitle(chapter.tempId, e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none min-w-0"
                placeholder="Chapter title..."
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.tempId, -1)}
                  disabled={cIdx === 0}
                  className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.tempId, 1)}
                  disabled={cIdx === form.chapters.length - 1}
                  className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => addLesson(chapter.tempId)}
                  className="p-1 rounded text-clinical-teal hover:bg-clinical-teal/10 transition-colors"
                  title="Add Lesson"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeChapter(chapter.tempId)}
                  className="p-1 rounded text-chart-red hover:bg-chart-red/10 transition-colors"
                  title="Remove Chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lessons */}
            {chapter.lessons.length === 0 ? (
              <div className="px-4 py-3 text-xs font-mono text-sage">
                No lessons - click <Plus className="w-3 h-3 inline" /> to add one.
              </div>
            ) : (
              <div className="divide-y divide-chart-grid/60">
                {chapter.lessons.map((lesson, lIdx) => (
                  <div key={lesson.tempId} className="px-3 py-2.5 bg-surface flex items-start gap-2">
                    <span className="text-[9px] font-mono text-sage/70 pt-2 shrink-0 w-5">{lIdx + 1}</span>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(chapter.tempId, lesson.tempId, { title: e.target.value })}
                        placeholder="Lesson title..."
                        className="w-full bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-clinical-teal"
                      />
                      <div className="flex gap-2">
                        <select
                          value={lesson.type}
                          onChange={(e) =>
                            updateLesson(chapter.tempId, lesson.tempId, {
                              type: e.target.value as "VIDEO" | "DOCUMENT",
                            })
                          }
                          className="text-[10px] font-mono bg-linen/40 border border-chart-grid/60 rounded px-2 py-1 text-ink focus:outline-none"
                        >
                          <option value="VIDEO">📹 Video</option>
                          <option value="DOCUMENT">📄 Document</option>
                        </select>

                        {lesson.type === "VIDEO" ? (
                          <input
                            type="text"
                            value={lesson.vimeoVideoId}
                            onChange={(e) =>
                              updateLesson(chapter.tempId, lesson.tempId, { vimeoVideoId: e.target.value })
                            }
                            placeholder="HD Video Stream ID..."
                            className="flex-1 bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1 text-[10px] font-mono text-ink focus:outline-none focus:border-clinical-teal"
                          />
                        ) : (
                          <input
                            type="text"
                            value={lesson.driveFileId}
                            onChange={(e) =>
                              updateLesson(chapter.tempId, lesson.tempId, { driveFileId: e.target.value })
                            }
                            placeholder="Google Drive ID..."
                            className="flex-1 bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1 text-[10px] font-mono text-ink focus:outline-none focus:border-clinical-teal"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(chapter.tempId, lesson.tempId)}
                      className="p-1 mt-1 rounded text-chart-red hover:bg-chart-red/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: React.Dispatch<React.SetStateAction<CourseForm>>;
}) {
  const totalLessons = form.chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-linen/50 border border-chart-grid rounded-card divide-y divide-chart-grid overflow-hidden">
        {[
          { label: "Title", value: form.title },
          { label: "Slug", value: `/courses/${form.slug}`, mono: true },
          { label: "Type", value: form.type },
          { label: "Category", value: form.category },
          {
            label: "Price",
            value:
              form.originalPrice !== ""
                ? `LKR ${Number(form.price).toLocaleString()} (was LKR ${Number(form.originalPrice).toLocaleString()})`
                : `LKR ${Number(form.price).toLocaleString()}`,
          },
          { label: "Level", value: form.level },
          {
            label: "Description",
            value: form.description
              ? `${form.description.slice(0, 120)}${form.description.length > 120 ? "…" : ""}`
              : "(none)",
          },
          {
            label: "Syllabus",
            value:
              form.chapters.length > 0
                ? `${form.chapters.length} chapter${form.chapters.length !== 1 ? "s" : ""}, ${totalLessons} lesson${totalLessons !== 1 ? "s" : ""}`
                : "No syllabus (can be added later)",
          },
          {
            label: "Cover Image",
            value: form.coverImage ? "Set ✓" : "None (can be set later)",
          },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex gap-4 px-4 py-3">
            <span className="text-[10px] font-mono text-sage font-bold uppercase shrink-0 w-24 pt-0.5">
              {label}
            </span>
            <span className={cn("text-sm text-ink break-all", mono && "font-mono text-xs")}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Publish toggle */}
      <div className="p-4 rounded-card border border-chart-grid bg-surface flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">Publish immediately</p>
          <p className="text-xs text-ink-muted mt-0.5">
            If enabled, the course will be visible on the public catalog right after creation.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-chart-grid rounded-full peer peer-checked:bg-clinical-teal transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
        </label>
      </div>
    </div>
  );
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────
export default function NewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CourseForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canAdvance = () => {
    if (step === 1) return form.title.trim() !== "" && form.slug.trim() !== "";
    if (step === 2) return form.price !== "" && Number(form.price) >= 0;
    if (step === 3) return form.description.trim().length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.description) {
      setErrorMsg("Please complete all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          description: form.description,
          price: typeof form.price === "number" ? form.price : Number(form.price) || 0,
          originalPrice: form.originalPrice !== "" && form.originalPrice !== null ? Number(form.originalPrice) : null,
          type: form.type,
          category: form.category,
          level: form.level,
          published: form.published,
          coverImage: form.coverImage || null,
          chapters: form.chapters.map((ch) => ({
            title: ch.title,
            lessons: ch.lessons.map((l) => ({
              title: l.title,
              type: l.type,
              vimeoVideoId: l.vimeoVideoId || null,
              driveFileId: l.driveFileId || null,
            })),
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/admin/courses/${data.course.id}/edit`);
      } else {
        setErrorMsg(data.message || "Failed to create course.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Manager
        </Link>
        <span className="block font-mono text-xs text-chart-red uppercase font-semibold">
          CURRICULUM CREATION
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Create New Course
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Complete all steps to build your course. You can edit everything after creation.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 flex-1 cursor-default transition-all",
                  active ? "opacity-100" : done ? "opacity-80" : "opacity-40"
                )}
                onClick={() => done && setStep(s.id)}
                style={{ cursor: done ? "pointer" : "default" }}
                title={done ? `Back to Step ${s.id}` : undefined}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    active
                      ? "bg-clinical-teal text-white shadow-md"
                      : done
                        ? "bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/30"
                        : "bg-linen border border-chart-grid text-ink-muted"
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block text-[10px] font-mono text-center leading-tight">
                  {s.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 max-w-[40px] transition-colors mt-[-16px]",
                    step > s.id ? "bg-clinical-teal" : "bg-chart-grid"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        {/* Step Title Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-chart-grid bg-linen/40">
          {React.createElement(STEPS[step - 1].icon, { className: "w-4 h-4 text-clinical-teal" })}
          <div>
            <p className="text-[10px] font-mono text-sage uppercase">
              Step {step} of {STEPS.length}
            </p>
            <p className="text-sm font-semibold text-ink leading-none mt-0.5">
              {step === 1 && "Course Identity"}
              {step === 2 && "Pricing Configuration"}
              {step === 3 && "Course Details"}
              {step === 4 && "Syllabus Builder"}
              {step === 5 && "Review & Publish"}
            </p>
          </div>
        </div>

        {/* Step Body */}
        <div className="px-6 py-6">
          {errorMsg && (
            <div className="mb-4 bg-chart-red/8 border border-chart-red/30 p-3 rounded text-xs text-chart-red font-mono">
              ⚠️ {errorMsg}
            </div>
          )}
          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && <Step2 form={form} setForm={setForm} />}
          {step === 3 && <Step3 form={form} setForm={setForm} />}
          {step === 4 && <Step4 form={form} setForm={setForm} />}
          {step === 5 && <Step5 form={form} setForm={setForm} />}
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-chart-grid flex items-center justify-between bg-linen/20">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-1.5 text-xs font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              variant="default"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="gap-1.5 text-xs font-semibold"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 font-semibold"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
