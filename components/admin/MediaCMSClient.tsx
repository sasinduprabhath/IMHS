"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Award,
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Check,
  X,
  Play,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Layers,
  Clock,
  Tag,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AchievementItem {
  id: string;
  youtubeId: string;
  title: string;
  category: string;
  duration?: string | null;
  views?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryItemData {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  category: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  tag?: string | null;
  date?: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

export function MediaCMSClient() {
  const [activeTab, setActiveTab] = useState<"achievements" | "gallery">("achievements");

  // Achievements State
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItemData | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<"ALL" | "PHOTO" | "VIDEO">("ALL");

  // Form State - Achievements
  const [achForm, setAchForm] = useState({
    youtubeUrlOrId: "",
    title: "",
    category: "Convocation",
    duration: "",
    views: "",
    thumbnailUrl: "",
    description: "",
    order: 0,
    isPublished: true,
  });

  // Form State - Gallery
  const [galForm, setGalForm] = useState({
    type: "PHOTO" as "PHOTO" | "VIDEO",
    title: "",
    category: "Campus Life",
    mediaUrl: "",
    thumbnailUrl: "",
    description: "",
    tag: "",
    date: new Date().getFullYear().toString(),
    order: 0,
    isPublished: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<GalleryItemData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Achievements
  const fetchAchievements = async () => {
    try {
      setIsLoadingAchievements(true);
      const res = await fetch("/api/admin/media/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  // Fetch Gallery
  const fetchGallery = async () => {
    try {
      setIsLoadingGallery(true);
      const res = await fetch("/api/admin/media/gallery");
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
    fetchGallery();
  }, []);

  // ── ACHIEVEMENT HANDLERS ──
  const handleOpenAchievementModal = (item?: AchievementItem) => {
    if (item) {
      setEditingAchievement(item);
      setAchForm({
        youtubeUrlOrId: item.youtubeId,
        title: item.title,
        category: item.category,
        duration: item.duration || "",
        views: item.views || "",
        thumbnailUrl: item.thumbnailUrl || "",
        description: item.description || "",
        order: item.order,
        isPublished: item.isPublished,
      });
    } else {
      setEditingAchievement(null);
      setAchForm({
        youtubeUrlOrId: "",
        title: "",
        category: "Convocation",
        duration: "",
        views: "",
        thumbnailUrl: "",
        description: "",
        order: achievements.length + 1,
        isPublished: true,
      });
    }
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achForm.youtubeUrlOrId.trim() || !achForm.title.trim()) return;

    setIsSaving(true);
    try {
      const url = editingAchievement
        ? `/api/admin/media/achievements/${editingAchievement.id}`
        : `/api/admin/media/achievements`;
      const method = editingAchievement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achForm),
      });

      if (res.ok) {
        setIsAchievementModalOpen(false);
        fetchAchievements();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save video highlight.");
      }
    } catch (err: any) {
      alert("Error saving highlight.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/media/achievements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAchievements((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      alert("Error deleting highlight.");
    }
  };

  const handleToggleAchievementPublish = async (item: AchievementItem) => {
    try {
      const res = await fetch(`/api/admin/media/achievements/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (res.ok) {
        setAchievements((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
        );
      }
    } catch (e) { }
  };

  // ── GALLERY HANDLERS ──
  const handleOpenGalleryModal = (item?: GalleryItemData) => {
    if (item) {
      setEditingGalleryItem(item);
      setGalForm({
        type: item.type,
        title: item.title,
        category: item.category,
        mediaUrl: item.mediaUrl,
        thumbnailUrl: item.thumbnailUrl || "",
        description: item.description || "",
        tag: item.tag || "",
        date: item.date || new Date().getFullYear().toString(),
        order: item.order,
        isPublished: item.isPublished,
      });
    } else {
      setEditingGalleryItem(null);
      setGalForm({
        type: "PHOTO",
        title: "",
        category: "Campus Life",
        mediaUrl: "",
        thumbnailUrl: "",
        description: "",
        tag: "",
        date: new Date().getFullYear().toString(),
        order: galleryItems.length + 1,
        isPublished: true,
      });
    }
    setIsGalleryModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
        setGalForm((prev) => ({
          ...prev,
          mediaUrl: data.url,
          thumbnailUrl: prev.type === "PHOTO" ? data.url : prev.thumbnailUrl,
        }));
      } else {
        alert(data.error || "File upload failed.");
      }
    } catch (err: any) {
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galForm.mediaUrl.trim() || !galForm.title.trim()) return;

    setIsSaving(true);
    try {
      const url = editingGalleryItem
        ? `/api/admin/media/gallery/${editingGalleryItem.id}`
        : `/api/admin/media/gallery`;
      const method = editingGalleryItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galForm),
      });

      if (res.ok) {
        setIsGalleryModalOpen(false);
        fetchGallery();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save gallery item.");
      }
    } catch (err: any) {
      alert("Error saving gallery item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/media/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      alert("Error deleting gallery item.");
    }
  };

  const handleToggleGalleryPublish = async (item: GalleryItemData) => {
    try {
      const res = await fetch(`/api/admin/media/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (res.ok) {
        setGalleryItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
        );
      }
    } catch (e) { }
  };

  const filteredGallery = galleryItems.filter((item) => {
    if (galleryFilter === "ALL") return true;
    return item.type === galleryFilter;
  });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="font-mono text-xs font-bold text-[#F16726] uppercase tracking-wider">
            Marketing Content & Media Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight mt-0.5">
            Media & Gallery CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
            Manage your homepage video highlights, YouTube links, campus gallery photos, and institutional videos.
          </p>
        </div>

        {/* Top Action Button */}
        {activeTab === "achievements" ? (
          <Button
            onClick={() => handleOpenAchievementModal()}
            className="gap-2 bg-[#0E57A4] hover:bg-[#0A4482] text-white font-semibold text-xs rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Video Highlight
          </Button>
        ) : (
          <Button
            onClick={() => handleOpenGalleryModal()}
            className="gap-2 bg-[#0E57A4] hover:bg-[#0A4482] text-white font-semibold text-xs rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Gallery Item
          </Button>
        )}
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("achievements")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer",
            activeTab === "achievements"
              ? "border-[#0E57A4] text-[#0E57A4] bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <Award className="w-4 h-4" />
          <span>Our Achievements & Highlights ({achievements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer",
            activeTab === "gallery"
              ? "border-[#0E57A4] text-[#0E57A4] bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Campus Photo & Video Gallery ({galleryItems.length})</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: ACHIEVEMENTS & VIDEO HIGHLIGHTS ── */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "achievements" && (
        <div className="space-y-4">
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0E57A4] shrink-0" />
              <span>
                These videos appear in the <strong>&quot;Our Achievements & Highlights&quot;</strong> cinema playlist section on the homepage.
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#0E57A4] font-bold">
              {achievements.filter((a) => a.isPublished).length} Published
            </span>
          </div>

          {isLoadingAchievements ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0E57A4]" />
              <span>Loading video highlights...</span>
            </div>
          ) : achievements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Video className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Video Highlights Added</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add YouTube videos from the IMHS channel to showcase convocations, lectures, and exams.
              </p>
              <Button
                onClick={() => handleOpenAchievementModal()}
                className="gap-1.5 text-xs bg-[#0E57A4] text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group shadow-xs",
                    item.isPublished ? "border-slate-200 hover:border-[#0E57A4]" : "border-slate-200 opacity-60 bg-slate-50"
                  )}
                >
                  <div>
                    {/* Video Thumbnail Preview */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <Image
                        src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />

                      {/* YouTube Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                        <span>{item.category}</span>
                      </span>

                      {item.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Order #{item.order}</span>
                        {item.views && <span>{item.views}</span>}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span>YouTube ID:</span>
                        <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {item.youtubeId}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAchievementPublish(item)}
                      title={item.isPublished ? "Unpublish video" : "Publish video"}
                      className={cn(
                        "p-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                        item.isPublished
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      )}
                    >
                      {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{item.isPublished ? "Live" : "Draft"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Watch on YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenAchievementModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E57A4] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Highlight"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: CAMPUS PHOTO & VIDEO GALLERY ── */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Filter:</span>
              <div className="flex items-center gap-1">
                {(["ALL", "PHOTO", "VIDEO"] as const).map((filterType) => (
                  <button
                    key={filterType}
                    type="button"
                    onClick={() => setGalleryFilter(filterType)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                      galleryFilter === filterType
                        ? "bg-[#0E57A4] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {filterType === "ALL" ? "All Media" : filterType === "PHOTO" ? "📷 Photos" : "🎬 Videos"}
                  </button>
                ))}
              </div>
            </div>

            <span className="font-mono text-xs text-slate-500">
              Showing {filteredGallery.length} of {galleryItems.length} items
            </span>
          </div>

          {isLoadingGallery ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0E57A4]" />
              <span>Loading gallery items...</span>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Gallery Items Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload photos and videos of convocations, student workshops, and pharmaceutical labs.
              </p>
              <Button
                onClick={() => handleOpenGalleryModal()}
                className="gap-1.5 text-xs bg-[#0E57A4] text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group shadow-xs",
                    item.isPublished ? "border-slate-200 hover:border-[#0E57A4]" : "border-slate-200 opacity-60 bg-slate-50"
                  )}
                >
                  <div>
                    {/* Media Container */}
                    <div
                      onClick={() => setPreviewMedia(item)}
                      className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer group"
                    >
                      {item.type === "PHOTO" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={item.mediaUrl}
                          poster={item.thumbnailUrl || undefined}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          muted
                        />
                      )}

                      {/* Type Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs flex items-center gap-1">
                        {item.type === "PHOTO" ? <ImageIcon className="w-2.5 h-2.5 text-emerald-400" /> : <Play className="w-2.5 h-2.5 text-blue-400 fill-blue-400" />}
                        <span>{item.type}</span>
                      </span>

                      {item.tag && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-[#F16726]/90 text-white font-mono text-[9px] font-bold">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-[#0E57A4] font-semibold">{item.category}</span>
                        {item.date && <span>{item.date}</span>}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleGalleryPublish(item)}
                      title={item.isPublished ? "Unpublish" : "Publish"}
                      className={cn(
                        "p-1 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                        item.isPublished
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {item.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{item.isPublished ? "Live" : "Draft"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenGalleryModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E57A4] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: ADD/EDIT ACHIEVEMENT VIDEO HIGHLIGHT ── */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0E57A4]" />
                <span>{editingAchievement ? "Edit Video Highlight" : "Add Video Highlight"}</span>
              </h2>
              <button
                onClick={() => setIsAchievementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>YouTube Video Link or ID</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={achForm.youtubeUrlOrId}
                  onChange={(e) => setAchForm({ ...achForm, youtubeUrlOrId: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=TM1nTXW2Ogs or TM1nTXW2Ogs"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Paste any YouTube URL or 11-character video ID. Thumbnail is generated automatically.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Video Title</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={achForm.title}
                  onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                  placeholder="e.g. IMHS General Convocation & Distinction Awards"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={achForm.category}
                    onChange={(e) => setAchForm({ ...achForm, category: e.target.value })}
                    placeholder="Convocation, Lecture Series, Exam Guide..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={achForm.duration}
                    onChange={(e) => setAchForm({ ...achForm, duration: e.target.value })}
                    placeholder="e.g. 12m 08s or 1h 45m"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Views Counter</label>
                  <input
                    type="text"
                    value={achForm.views}
                    onChange={(e) => setAchForm({ ...achForm, views: e.target.value })}
                    placeholder="e.g. 1.9K+ views"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Playlist Order</label>
                  <input
                    type="number"
                    value={achForm.order}
                    onChange={(e) => setAchForm({ ...achForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={achForm.description}
                  onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                  placeholder="Optional brief description of this video highlight..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ach-published"
                  checked={achForm.isPublished}
                  onChange={(e) => setAchForm({ ...achForm, isPublished: e.target.checked })}
                  className="rounded border-slate-300 text-[#0E57A4] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="ach-published" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish on Homepage immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="text-xs bg-[#0E57A4] hover:bg-[#0A4482] text-white gap-1.5 font-bold"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingAchievement ? "Save Changes" : "Create Highlight"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: ADD/EDIT GALLERY ITEM ── */}
      {/* ════════════════════════════════════════════════════════════════════════════ */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#0E57A4]" />
                <span>{editingGalleryItem ? "Edit Gallery Item" : "Add Gallery Item"}</span>
              </h2>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="p-5 space-y-4">
              {/* Media Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGalForm({ ...galForm, type: "PHOTO" })}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                      galForm.type === "PHOTO"
                        ? "bg-blue-50 border-[#0E57A4] text-[#0E57A4]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Photo / Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGalForm({ ...galForm, type: "VIDEO" })}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
                      galForm.type === "VIDEO"
                        ? "bg-blue-50 border-[#0E57A4] text-[#0E57A4]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Video className="w-4 h-4" />
                    <span>Reel / Video</span>
                  </button>
                </div>
              </div>

              {/* Direct Upload or URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Media URL or Direct File</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[11px] font-mono font-semibold text-[#0E57A4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Upload from Computer</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*"
                  />
                </div>

                <input
                  type="text"
                  required
                  value={galForm.mediaUrl}
                  onChange={(e) => setGalForm({ ...galForm, mediaUrl: e.target.value })}
                  placeholder="/gallery/convocation-video.mp4 or https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Title</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={galForm.title}
                  onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                  placeholder="e.g. Annual Convocation & Distinction Honours"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans font-semibold"
                />
              </div>

              {/* Category & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={galForm.category}
                    onChange={(e) => setGalForm({ ...galForm, category: e.target.value })}
                    placeholder="Convocation, Practicals, Workshops, Labs..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tag / Badge</label>
                  <input
                    type="text"
                    value={galForm.tag}
                    onChange={(e) => setGalForm({ ...galForm, tag: e.target.value })}
                    placeholder="e.g. BATCH 18, GRADUATION 2024"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Date & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date / Year</label>
                  <input
                    type="text"
                    value={galForm.date}
                    onChange={(e) => setGalForm({ ...galForm, date: e.target.value })}
                    placeholder="e.g. 2024 or Oct 2024"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={galForm.order}
                    onChange={(e) => setGalForm({ ...galForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={galForm.description}
                  onChange={(e) => setGalForm({ ...galForm, description: e.target.value })}
                  placeholder="Optional brief description of this photo or event..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gal-published"
                  checked={galForm.isPublished}
                  onChange={(e) => setGalForm({ ...galForm, isPublished: e.target.checked })}
                  className="rounded border-slate-300 text-[#0E57A4] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="gal-published" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish in Gallery immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="text-xs bg-[#0E57A4] hover:bg-[#0A4482] text-white gap-1.5 font-bold"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingGalleryItem ? "Save Changes" : "Add to Gallery"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MEDIA PREVIEW MODAL ── */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-white">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full relative bg-black flex items-center justify-center">
              {previewMedia.type === "PHOTO" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewMedia.mediaUrl}
                  alt={previewMedia.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={previewMedia.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="p-5 space-y-1 bg-slate-900">
              <span className="font-mono text-[10px] text-[#F16726] uppercase font-bold">
                {previewMedia.category} {previewMedia.tag ? `• ${previewMedia.tag}` : ""}
              </span>
              <h3 className="text-base font-bold text-white">{previewMedia.title}</h3>
              {previewMedia.description && (
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  {previewMedia.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
