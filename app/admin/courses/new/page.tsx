"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn, formatGoogleDriveImageUrl } from "@/lib/utils";
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
  Upload,
  Loader2,
  AlertTriangle,
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Course Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Modern Pharmacy Course (SLMC Prep)"
            value={form.title}
            onChange={(e) => handleTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            URL Slug *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">/courses/</span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full pl-[70px] pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Modern Pharmacy Course"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
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
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">
            Discounted Current Fee (LKR) *
          </label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: e.target.value !== "" ? Number(e.target.value) : "" }))
            }
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono text-slate-900 font-bold focus:outline-none focus:border-[#0E57A4] transition-colors"
          />
          <p className="text-[10px] font-mono text-slate-500 mt-1.5">
            This is the actual enrollment price charged to the student.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Original Price (LKR - Strikethrough, optional)
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
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono text-slate-400 focus:outline-none focus:border-[#0E57A4] transition-colors"
          />
          <p className="text-[10px] font-mono text-slate-500 mt-1.5">
            Higher price shown with a strikethrough to indicate a discount (e.g.{" "}
            <span className="line-through">LKR 65,000</span>).
          </p>
        </div>
      </div>

      {/* Preview */}
      {typeof form.price === "number" && (
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center gap-4">
          <div>
            <p className="text-xs font-mono text-slate-500 mb-0.5">Price Display Preview</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-slate-900">
                LKR {Number(form.price).toLocaleString()}
              </span>
              {typeof form.originalPrice === "number" && (
                <span className="text-base text-slate-400 line-through font-mono">
                  LKR {form.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {typeof form.originalPrice === "number" && typeof form.price === "number" && form.originalPrice > form.price && (
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-1">
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setImgError(false);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "courses");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setForm((f) => ({ ...f, coverImage: json.url }));
      } else {
        setUploadError(json.error || "Failed to upload image.");
      }
    } catch {
      setUploadError("Network error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const previewUrl = formatGoogleDriveImageUrl(form.coverImage) || form.coverImage;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Course Description <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            Minimum 5 characters
          </span>
        </div>
        <textarea
          rows={5}
          placeholder="Detailed description of what students will learn in this course..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={cn(
            "w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white resize-none transition-colors",
            form.description.length > 0 && form.description.trim().length < 5
              ? "border-rose-300 focus:border-rose-500 bg-rose-50/20"
              : "border-slate-200 focus:border-[#0E57A4]"
          )}
        />
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
          {form.description.length > 0 && form.description.trim().length < 5 ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Description must be at least 5 characters (currently {form.description.trim().length}/5)
            </span>
          ) : form.description.trim().length >= 5 ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Description length meets requirement
            </span>
          ) : (
            <span className="text-slate-400">Required for course search and student catalog</span>
          )}
          <span className={cn(
            "font-mono",
            form.description.trim().length >= 5 ? "text-slate-500" : "text-slate-400"
          )}>
            {form.description.length} characters
          </span>
        </div>
      </div>

      {/* Cover Image Upload + Direct Link */}
      <div className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Upload Cover Banner (PNG, JPG, WEBP)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-[#0E57A4] bg-slate-50/70 hover:bg-blue-50/20 transition-all rounded-2xl p-6 text-center group cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              disabled={isUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0E57A4]/10 text-[#0E57A4] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#0E57A4] transition-colors">
                  {isUploading ? "Uploading banner image..." : "Click or drag & drop to upload cover banner"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Recommended: 1200x630px (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-rose-600 font-mono mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {uploadError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Or Direct Image URL / Google Drive Share Link
          </label>
          <input
            type="text"
            placeholder="https://drive.google.com/file/d/... or /courses/banner.png"
            value={form.coverImage}
            onChange={(e) => {
              setImgError(false);
              setUploadError(null);
              setForm((f) => ({ ...f, coverImage: e.target.value }));
            }}
            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
          />
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Google Drive share links are automatically transformed into direct image streams.
          </p>
        </div>

        {/* Live preview */}
        {form.coverImage && (
          <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
            {!imgError ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                  unoptimized
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, coverImage: "" }));
                      setImgError(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white text-[11px] font-mono font-bold transition-colors backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-mono text-rose-500 bg-rose-50/50">
                ⚠ Image failed to load - please ensure the Google Drive file access is set to &ldquo;Anyone with the link&rdquo; or use direct upload above.
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
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <p className="text-xs font-mono text-slate-500">
          Build your syllabus chapters here, or skip and customize later in the curriculum builder.
        </p>
        <Button type="button" size="sm" onClick={addChapter} className="gap-1.5 text-xs font-mono font-bold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Chapter
        </Button>
      </div>

      {form.chapters.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 bg-white">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No chapters added yet</p>
          <p className="text-xs mt-1 text-slate-400">Click &ldquo;Add Chapter&rdquo; to begin organizing modules.</p>
        </div>
      )}

      <div className="space-y-3">
        {form.chapters.map((chapter, cIdx) => (
          <div key={chapter.tempId} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Chapter Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-200">
              <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                CH {String(cIdx + 1).padStart(2, "0")}
              </span>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapterTitle(chapter.tempId, e.target.value)}
                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none min-w-0"
                placeholder="Chapter title..."
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.tempId, -1)}
                  disabled={cIdx === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition-colors cursor-pointer"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveChapter(chapter.tempId, 1)}
                  disabled={cIdx === form.chapters.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition-colors cursor-pointer"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => addLesson(chapter.tempId)}
                  className="p-1.5 rounded-lg text-[#0E57A4] hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Add Lesson"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeChapter(chapter.tempId)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lessons */}
            {chapter.lessons.length === 0 ? (
              <div className="px-4 py-3 text-xs font-mono text-slate-500">
                No lessons in this chapter yet - click <Plus className="w-3 h-3 inline text-[#0E57A4]" /> to add one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {chapter.lessons.map((lesson, lIdx) => (
                  <div key={lesson.tempId} className="px-4 py-3 bg-white hover:bg-slate-50/50 flex items-start gap-2.5">
                    <span className="text-[10px] font-mono text-slate-400 pt-2 shrink-0 w-6 font-semibold">{lIdx + 1}.</span>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(chapter.tempId, lesson.tempId, { title: e.target.value })}
                        placeholder="Lesson title..."
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] font-medium transition-colors"
                      />
                      <div className="flex gap-2">
                        <select
                          value={lesson.type}
                          onChange={(e) =>
                            updateLesson(chapter.tempId, lesson.tempId, {
                              type: e.target.value as "VIDEO" | "DOCUMENT",
                            })
                          }
                          className="text-[11px] font-mono font-semibold bg-[#F8FAFC] border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 focus:outline-none"
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
                            className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1 text-[11px] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                          />
                        ) : (
                          <input
                            type="text"
                            value={lesson.driveFileId}
                            onChange={(e) =>
                              updateLesson(chapter.tempId, lesson.tempId, { driveFileId: e.target.value })
                            }
                            placeholder="Google Drive ID..."
                            className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1 text-[11px] font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLesson(chapter.tempId, lesson.tempId)}
                      className="p-1.5 mt-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
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
          <div key={label} className="flex gap-4 px-5 py-3.5">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase shrink-0 w-24 pt-0.5">
              {label}
            </span>
            <span className={cn("text-sm font-semibold text-slate-900 break-all", mono && "font-mono text-xs text-[#0E57A4]")}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Publish toggle */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shadow-xs">
        <div>
          <p className="text-sm font-bold text-slate-900">Publish immediately to catalog</p>
          <p className="text-xs text-slate-500 mt-0.5">
            If enabled, the course will be publicly visible on the IMHS catalog right after creation.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
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
    if (step === 1) return form.title.trim().length >= 3 && form.slug.trim().length >= 3;
    if (step === 2) return form.price !== "" && Number(form.price) >= 0;
    if (step === 3) return form.description.trim().length >= 5;
    return true;
  };

  const handleSubmit = async () => {
    if (form.title.trim().length < 3) {
      setErrorMsg("Title must be at least 3 characters.");
      return;
    }
    if (form.slug.trim().length < 3) {
      setErrorMsg("Slug must be at least 3 characters.");
      return;
    }
    if (form.description.trim().length < 5) {
      setErrorMsg("Description must be at least 5 characters.");
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
          coverImage: form.coverImage ? (formatGoogleDriveImageUrl(form.coverImage) || form.coverImage) : null,
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
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-[#0E57A4] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Manager
        </Link>
        <span className="block font-mono text-[10px] text-[#F16726] uppercase font-bold tracking-wider">
          CURRICULUM CREATION
        </span>
        <h1 className="text-3xl font-display font-bold text-slate-900">
          Create New Course
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete all steps to configure your course program. You can refine everything after creation in the builder.
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
                    "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs",
                    active
                      ? "bg-[#0E57A4] text-white shadow-md"
                      : done
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 border border-slate-200 text-slate-400"
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:block text-[10px] font-mono font-semibold text-center leading-tight">
                  {s.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 max-w-[40px] transition-colors mt-[-16px]",
                    step > s.id ? "bg-emerald-500" : "bg-slate-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Step Title Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          {React.createElement(STEPS[step - 1].icon, { className: "w-4 h-4 text-[#0E57A4]" })}
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              Step {step} of {STEPS.length}
            </p>
            <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
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
            <div className="mb-4 bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-700 font-mono font-bold">
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
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-1.5 text-xs font-mono font-semibold text-slate-600 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="gap-1.5 text-xs font-semibold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shadow-xs"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 font-semibold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shadow-xs"
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
