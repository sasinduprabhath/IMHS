"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { FormattedText } from "@/components/ui/formatted-text";
import { cn } from "@/lib/utils";
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
  UserPlus,
  Megaphone,
  X,
  Settings,
  Layers,
  Users,
  Bell,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
}

interface FacultyMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
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
    announcements?: AnnouncementItem[];
    instructors?: {
      id: string;
      facultyMember: FacultyMember;
    }[];
  };
  allFaculty: FacultyMember[];
}

type TabId = "settings" | "syllabus" | "instructors" | "announcements";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "syllabus", label: "Syllabus", icon: Layers },
  { id: "instructors", label: "Instructors", icon: Users },
  { id: "announcements", label: "Announcements", icon: Bell },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function CourseBuilderClient({ course, allFaculty }: CourseBuilderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  // ── Course Metadata State ──
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(course.price);
  const [originalPrice, setOriginalPrice] = useState<number | "">(course.originalPrice || "");
  const [type, setType] = useState(course.type || "Course");
  const [category, setCategory] = useState(course.category || "Modern Pharmacy Course");
  const [level, setLevel] = useState(course.level || "All Levels");
  const [enrollmentValidity, setEnrollmentValidity] = useState(course.enrollmentValidity || "Lifetime Access");
  const [totalEnrolled, setTotalEnrolled] = useState<number | "">(course.totalEnrolled || 450);
  const [published, setPublished] = useState(course.published);
  const [coverImage, setCoverImage] = useState(course.coverImage || "");
  const [imgError, setImgError] = useState(false);

  // ── Syllabus State ──
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
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(course.chapters.map((_, i) => i))
  );

  // ── Announcements State ──
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(course.announcements || []);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [isAddingAnn, setIsAddingAnn] = useState(false);

  // ── Instructors State ──
  const [assignedInstructors, setAssignedInstructors] = useState<FacultyMember[]>(
    course.instructors ? course.instructors.map((i) => i.facultyMember) : []
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [isAssigningFaculty, setIsAssigningFaculty] = useState(false);

  // ── Save State ──
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ─── Chapter / Lesson Helpers ───────────────────────────────────────────────
  const toggleChapter = (idx: number) =>
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const addChapter = () => {
    const newIdx = chapters.length;
    setChapters((prev) => [
      ...prev,
      { title: `Chapter ${newIdx + 1}`, order: newIdx + 1, lessons: [] },
    ]);
    setExpandedChapters((prev) => new Set([...prev, newIdx]));
  };

  const removeChapter = (cIdx: number) => {
    if (!confirm("Delete this chapter and all its lessons?")) return;
    setChapters((prev) => prev.filter((_, i) => i !== cIdx));
  };

  const moveChapter = (cIdx: number, dir: -1 | 1) => {
    if (cIdx + dir < 0 || cIdx + dir >= chapters.length) return;
    setChapters((prev) => {
      const next = [...prev];
      [next[cIdx], next[cIdx + dir]] = [next[cIdx + dir], next[cIdx]];
      return next;
    });
  };

  const updateChapterTitle = (cIdx: number, val: string) =>
    setChapters((prev) => {
      const next = [...prev];
      next[cIdx] = { ...next[cIdx], title: val };
      return next;
    });

  const addLesson = (cIdx: number) =>
    setChapters((prev) => {
      const next = [...prev];
      const ch = { ...next[cIdx] };
      ch.lessons = [
        ...ch.lessons,
        {
          title: `Lesson ${cIdx + 1}.${ch.lessons.length + 1}`,
          order: ch.lessons.length + 1,
          type: "VIDEO",
          vimeoVideoId: "",
          driveFileId: "",
          content: "",
        },
      ];
      next[cIdx] = ch;
      return next;
    });

  const removeLesson = (cIdx: number, lIdx: number) =>
    setChapters((prev) => {
      const next = [...prev];
      const ch = { ...next[cIdx] };
      ch.lessons = ch.lessons.filter((_, i) => i !== lIdx);
      next[cIdx] = ch;
      return next;
    });

  const updateLesson = (cIdx: number, lIdx: number, field: keyof LessonInput, value: string) =>
    setChapters((prev) => {
      const next = [...prev];
      const ch = { ...next[cIdx] };
      ch.lessons = ch.lessons.map((l, i) => (i === lIdx ? { ...l, [field]: value } : l));
      next[cIdx] = ch;
      return next;
    });

  // ─── Announcement Helpers ───────────────────────────────────────────────────
  const handleAddAnnouncement = async () => {
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    setIsAddingAnn(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newAnnTitle, content: newAnnContent }),
      });
      const data = await res.json();
      if (res.ok && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setNewAnnTitle("");
        setNewAnnContent("");
      }
    } finally {
      setIsAddingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(
      `/api/admin/courses/${course.id}/announcements?announcementId=${annId}`,
      { method: "DELETE" }
    );
    if (res.ok) setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
  };

  // ─── Instructor Helpers ─────────────────────────────────────────────────────
  const handleAssignInstructor = async () => {
    if (!selectedFacultyId) return;
    setIsAssigningFaculty(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/instructors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyMemberId: selectedFacultyId }),
      });
      const data = await res.json();
      if (res.ok && data.instructor) {
        const fm = data.instructor.facultyMember;
        setAssignedInstructors((prev) =>
          prev.some((f) => f.id === fm.id) ? prev : [...prev, fm]
        );
        setSelectedFacultyId("");
      }
    } finally {
      setIsAssigningFaculty(false);
    }
  };

  const handleRemoveInstructor = async (fmId: string) => {
    if (!confirm("Remove this instructor from the course?")) return;
    const res = await fetch(
      `/api/admin/courses/${course.id}/instructors?facultyMemberId=${fmId}`,
      { method: "DELETE" }
    );
    if (res.ok) setAssignedInstructors((prev) => prev.filter((f) => f.id !== fmId));
  };

  // ─── Save All ───────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError("");
    try {
      await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, description,
          price: Number(price),
          originalPrice: originalPrice !== "" ? Number(originalPrice) : null,
          type, category, level, enrollmentValidity,
          totalEnrolled: totalEnrolled !== "" ? Number(totalEnrolled) : 450,
          published,
          coverImage: coverImage || null,
        }),
      });

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
        setSaveError("Failed to save syllabus structure.");
      }
    } catch {
      setSaveError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const unassignedFaculty = allFaculty.filter(
    (f) => !assignedInstructors.some((a) => a.id === f.id)
  );
  const facultyOptions = unassignedFaculty.map((f) => ({
    value: f.id,
    label: `${f.name} - ${f.title}`,
  }));

  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-chart-grid mb-6">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Manager
          </Link>
          <h1 className="text-2xl font-display font-semibold text-ink leading-tight">
            {course.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase",
              published
                ? "bg-clinical-teal/15 text-clinical-teal"
                : "bg-chart-grid text-ink-muted"
            )}>
              {published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
              {published ? "Published" : "Draft"}
            </span>
            <span className="text-xs font-mono text-sage">
              {chapters.length} chapters · {totalLessons} lessons
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Publish to Catalog Toggle Button */}
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border shadow-2xs select-none cursor-pointer",
              published
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-300 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-800 border-amber-300 hover:bg-amber-500/20"
            )}
            title={published ? "Currently Live - Click to change status to Draft" : "Currently Draft - Click to Publish to Catalog"}
          >
            {published ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
            <span>{published ? "Published Live" : "Draft (Hidden)"}</span>
            <div className={cn(
              "w-7 h-3.5 rounded-full relative transition-colors ml-1",
              published ? "bg-emerald-600" : "bg-slate-300"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-transform",
                published ? "translate-x-3.5" : "translate-x-0.5"
              )} />
            </div>
          </button>

          {/* Save All Changes Button */}
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            variant="default"
            size="lg"
            className="gap-2 font-semibold shadow-sm bg-[#0E57A4] hover:bg-[#0c4a8e] text-white border-0 shrink-0"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving…" : "Save All Changes"}
          </Button>
        </div>
      </div>

      {/* ── Save Feedback ── */}
      {saveSuccess && (
        <div className="mb-4 bg-clinical-teal-surface border border-clinical-teal/30 p-3.5 rounded-card text-xs font-mono text-clinical-teal flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          All changes saved successfully!
        </div>
      )}
      {saveError && (
        <div className="mb-4 bg-chart-red/8 border border-chart-red/30 p-3.5 rounded-card text-xs font-mono text-chart-red flex items-center gap-2">
          ⚠️ {saveError}
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 bg-linen/60 p-1 rounded-card border border-chart-grid mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const badge =
            id === "instructors" ? assignedInstructors.length :
              id === "announcements" ? announcements.length :
                id === "syllabus" ? chapters.length : null;

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-semibold transition-all whitespace-nowrap",
                activeTab === id
                  ? "bg-white text-clinical-teal shadow-xs border border-chart-grid/60"
                  : "text-ink-muted hover:text-ink hover:bg-white/60"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {badge !== null && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                  activeTab === id
                    ? "bg-clinical-teal/15 text-clinical-teal"
                    : "bg-chart-grid text-ink-muted"
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Identity */}
          <section className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
            <h2 className="text-sm font-semibold text-ink border-b border-chart-grid pb-3 font-mono uppercase tracking-wider text-ink-muted">
              Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-muted">/courses/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-[70px] pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Type</label>
                <CustomSelect
                  options={[{ value: "Course", label: "Course" }, { value: "Bundle", label: "Bundle" }]}
                  value={type}
                  onChange={setType}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Level</label>
                <CustomSelect
                  options={[
                    { value: "All Levels", label: "All Levels" },
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Expert", label: "Expert" },
                  ]}
                  value={level}
                  onChange={setLevel}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
            <h2 className="text-sm font-semibold border-b border-chart-grid pb-3 font-mono uppercase tracking-wider text-ink-muted">
              Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-bold mb-1.5">
                  Current Fee (LKR) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-lg font-mono text-ink font-bold focus:outline-none focus:border-clinical-teal"
                />
                <p className="text-[10px] font-mono text-sage mt-1">Actual price charged to students</p>
              </div>
              <div>
                <label className="block text-xs font-mono text-ink font-bold mb-1.5">
                  Original Price (LKR - Strikethrough)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 65000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-lg font-mono text-sage focus:outline-none focus:border-clinical-teal"
                />
                <p className="text-[10px] font-mono text-sage mt-1">Shown with strikethrough to show a discount</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Enrollment Validity</label>
                <CustomSelect
                  options={[
                    { value: "Lifetime Access", label: "Lifetime Access" },
                    { value: "1 Year Access", label: "1 Year Access" },
                    { value: "6 Month Access", label: "6 Month Access" },
                  ]}
                  value={enrollmentValidity}
                  onChange={setEnrollmentValidity}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Enrolled Count (Display)</label>
                <input
                  type="number"
                  min={0}
                  value={totalEnrolled}
                  onChange={(e) => setTotalEnrolled(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
                />
                <p className="text-[10px] font-mono text-sage mt-1">Public-facing enrollment number on course page</p>
              </div>
            </div>
          </section>

          {/* Cover Image + Visibility */}
          <section className="bg-surface border border-chart-grid rounded-card p-6 space-y-4 shadow-paper">
            <h2 className="text-sm font-semibold border-b border-chart-grid pb-3 font-mono uppercase tracking-wider text-ink-muted">
              Cover Image & Visibility
            </h2>

            <div>
              <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Cover Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.png"
                value={coverImage}
                onChange={(e) => { setImgError(false); setCoverImage(e.target.value); }}
                className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>

            {coverImage && (
              <div className="relative h-44 rounded-card overflow-hidden border border-chart-grid bg-linen">
                {!imgError ? (
                  <Image
                    src={coverImage}
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

            <div className="flex items-center justify-between p-4 rounded-card border border-chart-grid bg-linen/30">
              <div>
                <p className="text-sm font-medium text-ink">Publish to Catalog</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {published ? "Visible to the public and enrollable." : "Hidden - only visible to admins."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-chart-grid rounded-full peer peer-checked:bg-clinical-teal transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: SYLLABUS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "syllabus" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">
                {chapters.length} Chapter{chapters.length !== 1 ? "s" : ""} · {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Add chapters and lessons. Changes are saved with "Save All Changes" above.
              </p>
            </div>
            <Button onClick={addChapter} size="sm" variant="outline" className="gap-1.5 text-xs font-mono shrink-0">
              <Plus className="w-3.5 h-3.5" /> Add Chapter
            </Button>
          </div>

          {chapters.length === 0 ? (
            <div className="border-2 border-dashed border-chart-grid rounded-card p-16 text-center">
              <Layers className="w-10 h-10 mx-auto mb-3 text-ink-muted/30" />
              <p className="text-sm font-mono text-ink-muted">No chapters yet.</p>
              <p className="text-xs text-sage mt-1">Click "Add Chapter" to start building your syllabus.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter, cIdx) => {
                const isOpen = expandedChapters.has(cIdx);
                return (
                  <div
                    key={cIdx}
                    className="border border-chart-grid rounded-card overflow-hidden bg-surface shadow-paper"
                  >
                    {/* Chapter Header - always visible */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-linen/50 border-b border-chart-grid/60">
                      {/* Collapse toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChapter(cIdx)}
                        className="p-0.5 text-ink-muted hover:text-ink transition-colors shrink-0"
                      >
                        {isOpen
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </button>

                      <span className="text-[10px] font-mono font-bold text-clinical-teal bg-clinical-teal/10 px-2 py-0.5 rounded shrink-0">
                        CH {String(cIdx + 1).padStart(2, "0")}
                      </span>

                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => updateChapterTitle(cIdx, e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none min-w-0"
                        placeholder="Chapter title…"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <span className="text-[10px] font-mono text-sage shrink-0 hidden sm:block">
                        {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
                      </span>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveChapter(cIdx, -1)}
                          disabled={cIdx === 0}
                          className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-25 transition-colors"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChapter(cIdx, 1)}
                          disabled={cIdx === chapters.length - 1}
                          className="p-1 rounded text-ink-muted hover:text-ink disabled:opacity-25 transition-colors"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => addLesson(cIdx)}
                          className="p-1 rounded text-clinical-teal hover:bg-clinical-teal/10 transition-colors"
                          title="Add lesson"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeChapter(cIdx)}
                          className="p-1 rounded text-chart-red hover:bg-chart-red/10 transition-colors"
                          title="Delete chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons - collapsible */}
                    {isOpen && (
                      <div>
                        {chapter.lessons.length === 0 ? (
                          <div className="px-5 py-5 text-center">
                            <p className="text-xs font-mono text-sage">
                              No lessons.{" "}
                              <button
                                type="button"
                                onClick={() => addLesson(cIdx)}
                                className="text-clinical-teal hover:underline font-semibold"
                              >
                                Add first lesson →
                              </button>
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-chart-grid/40">
                            {chapter.lessons.map((lesson, lIdx) => (
                              <div
                                key={lIdx}
                                className="px-4 py-3 bg-white hover:bg-linen/20 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-[9px] font-mono text-sage/60 pt-2.5 shrink-0 w-8 text-right">
                                    {cIdx + 1}.{lIdx + 1}
                                  </span>

                                  <div className="flex-1 min-w-0 space-y-2">
                                    {/* Lesson title */}
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(cIdx, lIdx, "title", e.target.value)}
                                      placeholder="Lesson title…"
                                      className="w-full bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:border-clinical-teal font-medium"
                                    />

                                    {/* Type toggle + media ID */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* Type pill buttons */}
                                      <div className="flex items-center rounded-md border border-chart-grid overflow-hidden text-[10px] font-mono font-bold shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => updateLesson(cIdx, lIdx, "type", "VIDEO")}
                                          className={cn(
                                            "flex items-center gap-1 px-2.5 py-1.5 transition-colors",
                                            (lesson.type || "VIDEO") === "VIDEO"
                                              ? "bg-clinical-teal text-white"
                                              : "text-ink-muted hover:bg-linen"
                                          )}
                                        >
                                          <Video className="w-3 h-3" /> Video
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => updateLesson(cIdx, lIdx, "type", "DOCUMENT")}
                                          className={cn(
                                            "flex items-center gap-1 px-2.5 py-1.5 transition-colors border-l border-chart-grid",
                                            lesson.type === "DOCUMENT"
                                              ? "bg-clinical-teal text-white"
                                              : "text-ink-muted hover:bg-linen"
                                          )}
                                        >
                                          <FileText className="w-3 h-3" /> Document
                                        </button>
                                      </div>

                                      {/* Media ID field */}
                                      {(lesson.type || "VIDEO") === "VIDEO" ? (
                                        <input
                                          type="text"
                                          value={lesson.vimeoVideoId}
                                          onChange={(e) => updateLesson(cIdx, lIdx, "vimeoVideoId", e.target.value)}
                                          placeholder="HD Video Stream ID (e.g. 76979871)"
                                          className="flex-1 min-w-[140px] bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={lesson.driveFileId}
                                          onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                                          placeholder="Google Drive File ID"
                                          className="flex-1 min-w-[140px] bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
                                        />
                                      )}

                                      {/* Companion PDF - only shown for video lessons */}
                                      {(lesson.type || "VIDEO") === "VIDEO" && (
                                        <input
                                          type="text"
                                          value={lesson.driveFileId}
                                          onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                                          placeholder="Companion PDF (optional)"
                                          className="flex-1 min-w-[140px] bg-linen/40 border border-chart-grid/60 rounded px-2.5 py-1.5 text-xs font-mono text-sage focus:outline-none focus:border-clinical-teal"
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeLesson(cIdx, lIdx)}
                                    className="p-1 mt-1.5 rounded text-chart-red hover:bg-chart-red/10 transition-colors shrink-0"
                                    title="Remove lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add lesson button at bottom */}
                        <div className="px-4 py-2.5 border-t border-chart-grid/40 bg-linen/20">
                          <button
                            type="button"
                            onClick={() => addLesson(cIdx)}
                            className="flex items-center gap-1.5 text-xs font-mono text-clinical-teal hover:text-clinical-teal/70 font-semibold transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: INSTRUCTORS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "instructors" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Course Instructors</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Assign faculty members who will be shown on the public course page.
            </p>
          </div>

          {/* Assign control */}
          <div className="bg-linen/40 border border-chart-grid rounded-card p-4 flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
                Select Lecturer
              </label>
              <CustomSelect
                options={facultyOptions}
                value={selectedFacultyId}
                onChange={setSelectedFacultyId}
                placeholder={
                  unassignedFaculty.length === 0
                    ? "All faculty already assigned"
                    : "Choose from faculty database…"
                }
              />
            </div>
            <Button
              type="button"
              onClick={handleAssignInstructor}
              disabled={isAssigningFaculty || !selectedFacultyId}
              className="gap-1.5 text-xs font-semibold bg-clinical-teal hover:bg-clinical-teal-hover text-white border-0 shrink-0 h-10"
            >
              <UserPlus className="w-4 h-4" /> Assign
            </Button>
          </div>

          {/* Assigned list */}
          {assignedInstructors.length === 0 ? (
            <div className="border-2 border-dashed border-chart-grid rounded-card p-12 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-ink-muted/30" />
              <p className="text-sm font-mono text-ink-muted">No instructors assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedInstructors.map((faculty) => (
                <div
                  key={faculty.id}
                  className="flex items-center gap-3 p-3.5 border border-chart-grid rounded-card bg-white shadow-xs"
                >
                  <div className="w-10 h-10 relative rounded-full overflow-hidden border border-chart-grid shrink-0">
                    <Image
                      src={faculty.photoUrl || "/lecturer.jpeg"}
                      alt={faculty.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{faculty.name}</p>
                    <p className="text-[11px] font-mono text-clinical-teal truncate">{faculty.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(faculty.id)}
                    className="p-1.5 text-sage hover:text-chart-red transition-colors shrink-0"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: ANNOUNCEMENTS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "announcements" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Course Announcements</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Broadcast updates, exam schedules, and notices to enrolled students.
            </p>
          </div>

          {/* Post form */}
          <div className="bg-surface border border-chart-grid rounded-card p-5 space-y-3 shadow-paper">
            <h3 className="text-xs font-mono font-bold text-ink uppercase flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-chart-red" /> Post New Announcement
            </h3>
            <div>
              <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. 📢 Batch 12 Live Revision Schedule"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink font-semibold mb-1.5">Message</label>
              <textarea
                rows={4}
                placeholder="Dear students, live online revision will be held this Saturday…"
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddAnnouncement}
              disabled={isAddingAnn || !newAnnTitle.trim() || !newAnnContent.trim()}
              className="bg-chart-red hover:bg-chart-red-hover text-white text-xs font-semibold gap-1.5 h-9 px-4 border-0"
            >
              <Megaphone className="w-3.5 h-3.5" />
              {isAddingAnn ? "Posting…" : "Post Announcement"}
            </Button>
          </div>

          {/* Announcements list */}
          {announcements.length === 0 ? (
            <div className="border-2 border-dashed border-chart-grid rounded-card p-12 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-ink-muted/30" />
              <p className="text-sm font-mono text-ink-muted">No announcements posted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-chart-grid rounded-card p-4 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-ink flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5 text-chart-red shrink-0" />
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-mono text-sage block mt-0.5">
                        {new Date(ann.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-sage hover:text-chart-red transition-colors shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <FormattedText content={ann.content} className="text-xs text-ink font-sans pt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
