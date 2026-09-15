"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { FormattedText } from "@/components/ui/formatted-text";
import { cn, formatGoogleDriveImageUrl } from "@/lib/utils";
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
  AlertTriangle,
  Upload,
  ImageIcon,
  Camera,
  Loader2,
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
  const [enrollmentValidity, setEnrollmentValidity] = useState(course.enrollmentValidity && !course.enrollmentValidity.toLowerCase().includes("lifetime") ? course.enrollmentValidity : "Batch Intake Access");
  const [totalEnrolled, setTotalEnrolled] = useState<number | "">(course.totalEnrolled || 450);
  const [published, setPublished] = useState(course.published);
  const [coverImage, setCoverImage] = useState(course.coverImage || "");
  const [imgError, setImgError] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        setImgError(false);
      } else {
        setCoverUploadError(data.error || "Failed to upload image.");
      }
    } catch {
      setCoverUploadError("Network error while uploading cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

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

  // ── Save State & Unsaved Changes Tracking ──
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  // Helper to generate a standardized JSON string of all editable form values
  const getSnapshot = React.useCallback(() => {
    return JSON.stringify({
      title: (title || "").trim(),
      slug: (slug || "").trim(),
      description: (description || "").trim(),
      price: Number(price) || 0,
      originalPrice: originalPrice !== "" && originalPrice !== null ? Number(originalPrice) : "",
      type: type || "Course",
      category: category || "Modern Pharmacy Course",
      level: level || "All Levels",
      enrollmentValidity: enrollmentValidity || "Batch Intake Access",
      totalEnrolled: totalEnrolled !== "" ? Number(totalEnrolled) : 450,
      published: Boolean(published),
      coverImage: (coverImage || "").trim(),
      chapters: chapters.map((ch, chIdx) => ({
        title: (ch.title || "").trim(),
        order: typeof ch.order === "number" ? ch.order : chIdx,
        lessons: (ch.lessons || []).map((l, lIdx) => ({
          title: (l.title || "").trim(),
          order: typeof l.order === "number" ? l.order : lIdx,
          type: l.type || "VIDEO",
          vimeoVideoId: (l.vimeoVideoId || "").trim(),
          driveFileId: (l.driveFileId || "").trim(),
          content: (l.content || "").trim(),
        })),
      })),
      announcements: (announcements || []).map((a) => ({
        title: (a.title || "").trim(),
        content: (a.content || "").trim(),
      })),
      assignedInstructors: (assignedInstructors || []).map((i) => i.id).sort(),
    });
  }, [
    title, slug, description, price, originalPrice, type, category, level,
    enrollmentValidity, totalEnrolled, published, coverImage, chapters,
    announcements, assignedInstructors,
  ]);

  // Capture baseline snapshot on initial mount
  React.useEffect(() => {
    if (!initialSnapshot) {
      setInitialSnapshot(getSnapshot());
    }
  }, [getSnapshot, initialSnapshot]);

  // Current real-time snapshot
  const currentSnapshot = getSnapshot();

  const isDirty = initialSnapshot !== "" && initialSnapshot !== currentSnapshot;

  // Browser beforeunload event listener
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

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

  // ─── Save All & Unsaved Navigation Handlers ─────────────────────────────────────
  const handleSaveAll = async (): Promise<boolean> => {
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
        setInitialSnapshot(getSnapshot());
        setSaveSuccess(true);
        router.refresh();
        setTimeout(() => setSaveSuccess(false), 3000);
        return true;
      } else {
        setSaveError("Failed to save syllabus structure.");
        return false;
      }
    } catch {
      setSaveError("An error occurred while saving.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackNavigation = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      router.push("/admin/courses");
    }
  };

  const handleSaveAndExit = async () => {
    const ok = await handleSaveAll();
    if (ok) {
      setShowUnsavedModal(false);
      router.push("/admin/courses");
    }
  };

  const handleDiscardAndExit = () => {
    setShowUnsavedModal(false);
    router.push("/admin/courses");
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
      {/* ── Sticky Top Navigation & Header Bar ── */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md -mt-8 pt-6 pb-4 mb-6 border-b border-slate-200 shadow-xs transition-all">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
          <div>
            <button
              type="button"
              onClick={handleBackNavigation}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-[#0E57A4] mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Course Manager</span>
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-[9px] font-bold uppercase animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </button>

            {/* Course Title + Quick Cover Thumbnail */}
            <div className="flex items-start gap-4">
              <div className="relative group shrink-0 w-24 h-16 sm:w-28 sm:h-18 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                {coverImage && !imgError ? (
                  (() => {
                    const resolvedSrc = formatGoogleDriveImageUrl(coverImage) || coverImage;
                    const isExternal = resolvedSrc.startsWith("http");
                    return isExternal ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={resolvedSrc}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={() => setImgError(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Image
                        src={resolvedSrc}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                    );
                  })()
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] font-mono">
                    <ImageIcon className="w-5 h-5 mb-0.5" />
                    <span>No Cover</span>
                  </div>
                )}
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white text-[10px] font-bold gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {/* Hover Overlay to Change Image */}
                {!isUploadingCover && (
                  <label className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity backdrop-blur-xs select-none">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverUpload(f);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-display font-bold text-slate-900 leading-tight">
                  {course.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase",
                    published
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    {published ? "Published Live" : "Draft (Hidden)"}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {chapters.length} chapters · {totalLessons} lessons
                  </span>
                  <span className="text-xs font-mono text-slate-400">·</span>
                  <span className="text-xs font-mono font-semibold text-clinical-teal">
                    LKR {price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Publish to Catalog Toggle Button */}
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border shadow-xs select-none cursor-pointer",
                published
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
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
              className="gap-2 font-semibold shadow-xs bg-[#0E57A4] hover:bg-[#0c4a8e] text-white border-0 shrink-0 cursor-pointer rounded-xl"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving…" : "Save All Changes"}
            </Button>
          </div>
        </div>

        {/* Save Feedback */}
        {saveSuccess && (
          <div className="mb-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs font-mono font-bold text-emerald-700 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            All changes saved successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-3 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-mono font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" /> {saveError}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
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
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer",
                  activeTab === id
                    ? "bg-white text-[#0E57A4] shadow-xs font-bold border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {badge !== null && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                    activeTab === id
                      ? "bg-[#0E57A4]/10 text-[#0E57A4]"
                      : "bg-slate-200 text-slate-600"
                  )}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Identity */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold border-b border-slate-200 pb-3 font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#0E57A4]" /> Course Identity & Categorization
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">/courses/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-[70px] pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                <CustomSelect
                  options={[{ value: "Course", label: "Course" }, { value: "Bundle", label: "Bundle" }]}
                  value={type}
                  onChange={setType}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] resize-none transition-colors"
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold border-b border-slate-200 pb-3 font-mono uppercase tracking-wider text-slate-500">
              Pricing & Enrollment Validity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Current Fee (LKR) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono text-slate-900 font-bold focus:outline-none focus:border-[#0E57A4] transition-colors"
                />
                <p className="text-[10px] font-mono text-slate-500 mt-1">Actual price charged to students</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Original Price (LKR - Strikethrough)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 65000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono text-slate-400 focus:outline-none focus:border-[#0E57A4] transition-colors"
                />
                <p className="text-[10px] font-mono text-slate-500 mt-1">Shown with strikethrough to illustrate promotional discount</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enrollment Validity</label>
                <CustomSelect
                  options={[
                    { value: "Batch Intake Access", label: "Batch Intake Access" },
                    { value: "1 Year Access", label: "1 Year Access" },
                    { value: "6 Month Access", label: "6 Month Access" },
                    { value: "Exam Intake Period", label: "Exam Intake Period" },
                  ]}
                  value={enrollmentValidity && !enrollmentValidity.toLowerCase().includes("lifetime") ? enrollmentValidity : "Batch Intake Access"}
                  onChange={setEnrollmentValidity}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enrolled Count (Display)</label>
                <input
                  type="number"
                  min={0}
                  value={totalEnrolled}
                  onChange={(e) => setTotalEnrolled(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                />
                <p className="text-[10px] font-mono text-slate-500 mt-1">Public-facing enrollment badge number on course page</p>
              </div>
            </div>
          </section>

          {/* Cover Image + Visibility */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                Cover Image & Branding
              </h2>
              {coverImage && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Image Configured
                </span>
              )}
            </div>

            {/* Direct File Drag & Drop Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload New Cover Image (PNG, JPG, WEBP)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-[#0E57A4] bg-slate-50/70 hover:bg-blue-50/20 transition-all rounded-2xl p-6 text-center group cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  disabled={isUploadingCover}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverUpload(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0E57A4]/10 text-[#0E57A4] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {isUploadingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#0E57A4] transition-colors">
                      {isUploadingCover ? "Uploading banner image..." : "Click or drag & drop to upload new cover"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Recommended: 1200x630px (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {coverUploadError && (
                <p className="text-xs text-rose-600 font-mono mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {coverUploadError}
                </p>
              )}
            </div>

            {/* Image URL Manual Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Or Direct Image URL / Local Path
              </label>
              <input
                type="text"
                placeholder="e.g. /courses/my-course-banner.png or https://..."
                value={coverImage}
                onChange={(e) => { setImgError(false); setCoverImage(e.target.value); }}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
              />
            </div>

            {/* Live Banner Preview */}
            {coverImage && (
              <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                {!imgError ? (
                  <>
                    {(() => {
                      const resolvedSrc = formatGoogleDriveImageUrl(coverImage) || coverImage;
                      const isExternal = resolvedSrc.startsWith("http");
                      return isExternal ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={resolvedSrc}
                          alt="Cover preview"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={() => setImgError(true)}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Image
                          src={resolvedSrc}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                          onError={() => setImgError(true)}
                          unoptimized
                        />
                      );
                    })()}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage("");
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
                    ⚠ Image failed to load - check the URL or path
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-900">Publish to Catalog</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {published ? "Visible to the public and enrollable." : "Hidden - only visible to administrators."}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
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
          {/* Course Cover Banner Quick Manager in Syllabus */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-28 h-20 sm:w-36 sm:h-22 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs group">
                {coverImage && !imgError ? (
                  (() => {
                    const resolvedSrc = formatGoogleDriveImageUrl(coverImage) || coverImage;
                    const isExternal = resolvedSrc.startsWith("http");
                    return isExternal ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={resolvedSrc}
                        alt="Course cover"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={() => setImgError(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Image
                        src={resolvedSrc}
                        alt="Course cover"
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                    );
                  })()
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-mono">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span>No Image</span>
                  </div>
                )}
                {isUploadingCover && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Course Cover Image
                  </span>
                  {coverImage && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-600 truncate max-w-xs sm:max-w-md" title={coverImage || "No cover image set"}>
                  {coverImage || "No cover image set for this course."}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Banner displayed on student portal, catalog, and curriculum headers.
                </p>
                {coverUploadError && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {coverUploadError}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              {/* Upload Button */}
              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-[#0E57A4] border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer select-none">
                {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isUploadingCover ? "Uploading..." : "Upload New Cover"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  disabled={isUploadingCover}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverUpload(f);
                  }}
                  className="hidden"
                />
              </label>

              {/* Edit URL / Settings shortcut */}
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Image Settings</span>
              </button>

              {coverImage && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage("");
                    setImgError(false);
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  title="Remove Cover Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {chapters.length} Chapter{chapters.length !== 1 ? "s" : ""} · {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize curriculum structure. Save changes with &ldquo;Save All Changes&rdquo; above.
              </p>
            </div>
            <Button onClick={addChapter} size="sm" className="gap-1.5 text-xs font-mono font-bold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shrink-0 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Chapter
            </Button>
          </div>

          {chapters.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center bg-white shadow-xs">
              <Layers className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No curriculum chapters created yet</p>
              <p className="text-xs text-slate-400 mt-1">Click &ldquo;Add Chapter&rdquo; to build your syllabus curriculum.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, cIdx) => {
                const isOpen = expandedChapters.has(cIdx);
                return (
                  <div
                    key={cIdx}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                  >
                    {/* Chapter Header - always visible */}
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80 border-b border-slate-200">
                      {/* Collapse toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChapter(cIdx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
                      >
                        {isOpen
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </button>

                      <span className="text-[10px] font-mono font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                        CH {String(cIdx + 1).padStart(2, "0")}
                      </span>

                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => updateChapterTitle(cIdx, e.target.value)}
                        className="flex-1 bg-transparent text-sm font-semibold text-slate-900 focus:outline-none min-w-0"
                        placeholder="Chapter title…"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <span className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:block">
                        {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveChapter(cIdx, -1)}
                          disabled={cIdx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition-colors cursor-pointer"
                          title="Move up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChapter(cIdx, 1)}
                          disabled={cIdx === chapters.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition-colors cursor-pointer"
                          title="Move down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => addLesson(cIdx)}
                          className="p-1.5 rounded-lg text-[#0E57A4] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Add lesson"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeChapter(cIdx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
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
                          <div className="px-5 py-6 text-center bg-slate-50/40">
                            <p className="text-xs font-mono text-slate-500">
                              No lessons in this chapter yet.{" "}
                              <button
                                type="button"
                                onClick={() => addLesson(cIdx)}
                                className="text-[#0E57A4] hover:underline font-bold"
                              >
                                Add first lesson →
                              </button>
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {chapter.lessons.map((lesson, lIdx) => (
                              <div
                                key={lIdx}
                                className="px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-[10px] font-mono text-slate-400 pt-2.5 shrink-0 w-8 text-right font-semibold">
                                    {cIdx + 1}.{lIdx + 1}
                                  </span>

                                  <div className="flex-1 min-w-0 space-y-2">
                                    {/* Lesson title */}
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(cIdx, lIdx, "title", e.target.value)}
                                      placeholder="Lesson title…"
                                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] font-medium transition-colors"
                                    />

                                    {/* Type toggle + media ID */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* Type pill buttons */}
                                      <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden text-[10px] font-mono font-bold shrink-0 bg-slate-50">
                                        <button
                                          type="button"
                                          onClick={() => updateLesson(cIdx, lIdx, "type", "VIDEO")}
                                          className={cn(
                                            "flex items-center gap-1 px-2.5 py-1.5 transition-colors cursor-pointer",
                                            (lesson.type || "VIDEO") === "VIDEO"
                                              ? "bg-[#0E57A4] text-white font-bold"
                                              : "text-slate-600 hover:bg-slate-100"
                                          )}
                                        >
                                          <Video className="w-3 h-3" /> Video
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => updateLesson(cIdx, lIdx, "type", "DOCUMENT")}
                                          className={cn(
                                            "flex items-center gap-1 px-2.5 py-1.5 transition-colors border-l border-slate-200 cursor-pointer",
                                            lesson.type === "DOCUMENT"
                                              ? "bg-[#0E57A4] text-white font-bold"
                                              : "text-slate-600 hover:bg-slate-100"
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
                                          className="flex-1 min-w-[140px] bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={lesson.driveFileId}
                                          onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                                          placeholder="Google Drive File ID"
                                          className="flex-1 min-w-[140px] bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                                        />
                                      )}

                                      {/* Companion PDF - only shown for video lessons */}
                                      {(lesson.type || "VIDEO") === "VIDEO" && (
                                        <input
                                          type="text"
                                          value={lesson.driveFileId}
                                          onChange={(e) => updateLesson(cIdx, lIdx, "driveFileId", e.target.value)}
                                          placeholder="Companion PDF File ID (optional)"
                                          className="flex-1 min-w-[140px] bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-600 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeLesson(cIdx, lIdx)}
                                    className="p-1.5 mt-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
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
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                          <button
                            type="button"
                            onClick={() => addLesson(cIdx)}
                            className="flex items-center gap-1.5 text-xs font-mono text-[#0E57A4] hover:text-[#0A4482] font-bold transition-colors cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Course Instructors & Lecturers</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign faculty members who will be displayed on the public course page.
            </p>
          </div>

          {/* Assign control */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Lecturer from Database
              </label>
              <CustomSelect
                options={facultyOptions}
                value={selectedFacultyId}
                onChange={setSelectedFacultyId}
                placeholder={
                  unassignedFaculty.length === 0
                    ? "All faculty members are already assigned"
                    : "Choose from faculty database…"
                }
              />
            </div>
            <Button
              type="button"
              onClick={handleAssignInstructor}
              disabled={isAssigningFaculty || !selectedFacultyId}
              className="gap-1.5 text-xs font-semibold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl border-0 shrink-0 h-10"
            >
              <UserPlus className="w-4 h-4" /> Assign Instructor
            </Button>
          </div>

          {/* Assigned list */}
          {assignedInstructors.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white shadow-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No instructors assigned yet</p>
              <p className="text-xs text-slate-400 mt-1">Select and assign a faculty member above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedInstructors.map((faculty) => (
                <div
                  key={faculty.id}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl bg-white shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="w-10 h-10 relative rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <Image
                      src={faculty.photoUrl || "/lecturer.jpeg"}
                      alt={faculty.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{faculty.name}</p>
                    <p className="text-[11px] font-mono text-[#0E57A4] truncate">{faculty.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(faculty.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Course Broadcast Announcements</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Broadcast updates, exam schedules, and notices directly to enrolled students.
            </p>
          </div>

          {/* Post form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#F16726]" /> Post New Announcement
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. 📢 Batch 12 Live Revision Schedule"
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message Content</label>
              <textarea
                rows={4}
                placeholder="Dear students, live online revision will be held this Saturday…"
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0E57A4] resize-none transition-colors"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddAnnouncement}
              disabled={isAddingAnn || !newAnnTitle.trim() || !newAnnContent.trim()}
              className="bg-[#F16726] hover:bg-[#d95316] text-white text-xs font-semibold gap-1.5 h-10 px-5 rounded-xl border-0 shadow-xs"
            >
              <Megaphone className="w-3.5 h-3.5" />
              {isAddingAnn ? "Posting…" : "Post Announcement"}
            </Button>
          </div>

          {/* Announcements list */}
          {announcements.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white shadow-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No announcements posted yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first broadcast update using the form above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5 text-[#F16726] shrink-0" />
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {new Date(ann.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <FormattedText content={ann.content} className="text-xs text-slate-700 font-sans pt-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Unsaved Changes Confirmation Modal ── */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-slate-900">
                  Unsaved Changes Detected
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  You have unsaved changes in <strong className="text-slate-900">&ldquo;{title}&rdquo;</strong>. Would you like to save your edits before exiting back to the Course Manager?
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUnsavedModal(false)}
                className="w-full sm:w-auto text-xs font-semibold rounded-xl text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscardAndExit}
                className="w-full sm:w-auto text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                Discard &amp; Exit
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAndExit}
                className="w-full sm:w-auto text-xs font-bold bg-[#0E57A4] hover:bg-[#0c4a8e] text-white rounded-xl shadow-xs gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving…" : "Save & Exit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
