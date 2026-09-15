"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Stethoscope,
  MessageSquare,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Coins,
  Tag,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MentorshipPackageData {
  id: string;
  packageKey: string;
  number: number;
  title: string;
  duration: string;
  durationMins: number;
  priceLkr: number;
  category: string;
  tag?: string | null;
  description: string;
  icon: string;
  colorTheme: string;
  isActive: boolean;
  order: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Stethoscope,
  MessageSquare,
  Sparkles,
};

const THEME_MAP: Record<string, { badge: string; card: string; icon: string }> = {
  teal: {
    badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
    card: "border-emerald-200/60 bg-emerald-50/20",
    icon: "text-emerald-600 bg-emerald-100/60 border-emerald-200",
  },
  blue: {
    badge: "text-blue-700 bg-blue-50 border-blue-200",
    card: "border-blue-200/60 bg-blue-50/20",
    icon: "text-blue-600 bg-blue-100/60 border-blue-200",
  },
  orange: {
    badge: "text-amber-700 bg-amber-50 border-amber-200",
    card: "border-amber-200/60 bg-amber-50/20",
    icon: "text-amber-600 bg-amber-100/60 border-amber-200",
  },
  indigo: {
    badge: "text-indigo-700 bg-indigo-50 border-indigo-200",
    card: "border-indigo-200/60 bg-indigo-50/20",
    icon: "text-indigo-600 bg-indigo-100/60 border-indigo-200",
  },
};

export function MentorshipPackagesManager() {
  const [packages, setPackages] = useState<MentorshipPackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<MentorshipPackageData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formNumber, setFormNumber] = useState(1);
  const [formTitle, setFormTitle] = useState("");
  const [formDuration, setFormDuration] = useState("30 Minutes");
  const [formDurationMins, setFormDurationMins] = useState(30);
  const [formPriceLkr, setFormPriceLkr] = useState(3500);
  const [formCategory, setFormCategory] = useState("Examination Planning");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("GraduationCap");
  const [formColorTheme, setFormColorTheme] = useState("teal");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (e) {
      console.error("Failed to load packages:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    const nextNum = packages.length + 1;
    setFormNumber(nextNum);
    setFormTitle("");
    setFormDuration("45 Minutes");
    setFormDurationMins(45);
    setFormPriceLkr(5000);
    setFormCategory("Examination Guidance");
    setFormDescription("");
    setFormIcon("GraduationCap");
    setFormColorTheme("teal");
    setFormIsActive(true);
    setIsCreating(true);
    setStatusMsg(null);
  };

  const openEditModal = (pkg: MentorshipPackageData) => {
    setEditingPackage(pkg);
    setFormNumber(pkg.number);
    setFormTitle(pkg.title);
    setFormDuration(pkg.duration);
    setFormDurationMins(pkg.durationMins);
    setFormPriceLkr(pkg.priceLkr);
    setFormCategory(pkg.category);
    setFormDescription(pkg.description);
    setFormIcon(pkg.icon || "GraduationCap");
    setFormColorTheme(pkg.colorTheme || "teal");
    setFormIsActive(pkg.isActive);
    setIsCreating(false);
    setStatusMsg(null);
  };

  const closeModal = () => {
    setEditingPackage(null);
    setIsCreating(false);
    setStatusMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payload = {
      number: Number(formNumber),
      title: formTitle.trim(),
      duration: formDuration.trim(),
      durationMins: Number(formDurationMins),
      priceLkr: Number(formPriceLkr),
      category: formCategory.trim(),
      description: formDescription.trim(),
      icon: formIcon,
      colorTheme: formColorTheme,
      isActive: formIsActive,
      order: Number(formNumber),
    };

    try {
      if (isCreating) {
        const res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create package");
        setStatusMsg({ type: "success", text: "New package added successfully!" });
      } else if (editingPackage) {
        const res = await fetch(`/api/admin/packages/${editingPackage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update package");
        setStatusMsg({ type: "success", text: "Package updated successfully!" });
      }

      await fetchPackages();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Operation failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pkg: MentorshipPackageData) => {
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  const handleDelete = async (pkg: MentorshipPackageData) => {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      }
    } catch (e) {
      console.error("Failed to delete package:", e);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            Mentorship &amp; Consultation Packages
            <span className="text-xs font-mono font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              {packages.length} Configured
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Edit consultation options, adjust pricing (LKR), customize session durations, and configure categories shown on the public booking page.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={fetchPackages}
            variant="outline"
            size="sm"
            className="text-xs font-mono font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Button
            onClick={openCreateModal}
            size="sm"
            className="bg-[#0E57A4] hover:bg-[#0b4685] text-white text-xs font-mono font-bold gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </div>
      </div>

      {/* ── Packages Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const IconComponent = ICON_MAP[pkg.icon] || GraduationCap;
          const theme = THEME_MAP[pkg.colorTheme] || THEME_MAP.teal;

          return (
            <div
              key={pkg.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs relative bg-white ${
                !pkg.isActive ? "opacity-60 border-dashed border-slate-300" : "border-slate-200 hover:border-[#0E57A4]/40"
              }`}
            >
              {/* Header tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${theme.icon}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold justify-end">
                    <span className="text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      LKR {pkg.priceLkr.toLocaleString()}
                    </span>
                    <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      {pkg.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold font-sans text-slate-900 leading-snug">
                    {pkg.number}. {pkg.title}
                  </h3>
                  <div className="inline-block font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    Category: {pkg.category}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                  {pkg.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(pkg)}
                  className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-lg transition-colors ${
                    pkg.isActive
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      : "text-slate-500 bg-slate-100 hover:bg-slate-200"
                  }`}
                  title="Toggle visibility on website"
                >
                  {pkg.isActive ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-600" /> Live
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-400" /> Hidden
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0E57A4] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal: Edit or Create Package ── */}
      {(isCreating || editingPackage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  {isCreating ? "Add Mentorship Package" : `Edit Package #${formNumber}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure package details, duration, pricing, and category.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs font-sans">
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    statusMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {statusMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  {statusMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">
                    Display Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formNumber}
                    onChange={(e) => setFormNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] font-mono text-xs"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-slate-700 font-bold mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Study Planning and Academic Guidance"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-slate-400" /> Price (LKR) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formPriceLkr}
                    onChange={(e) => setFormPriceLkr(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] font-mono text-xs font-bold text-[#0E57A4]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration Label *
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 30 Minutes"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={formDurationMins}
                    onChange={(e) => setFormDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Clinical Category *
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Examination Planning, Written Examination Preparation"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-slate-700 font-bold mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide clinical details on what students will cover in this session..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">
                    Icon
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] text-xs font-mono"
                  >
                    <option value="GraduationCap">GraduationCap (Academic)</option>
                    <option value="Stethoscope">Stethoscope (Clinical / Exam)</option>
                    <option value="MessageSquare">MessageSquare (Viva / Oral)</option>
                    <option value="Sparkles">Sparkles (Specialized)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-slate-700 font-bold mb-1">
                    Color Theme
                  </label>
                  <select
                    value={formColorTheme}
                    onChange={(e) => setFormColorTheme(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E57A4] text-xs font-mono"
                  >
                    <option value="teal">Emerald / Teal (Primary)</option>
                    <option value="blue">Royal Blue (Clinical)</option>
                    <option value="orange">Warm Amber (Mock Viva)</option>
                    <option value="indigo">Deep Indigo (Advanced)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0E57A4] focus:ring-[#0E57A4]"
                  />
                  Live on Student Booking Page
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={closeModal}
                    className="text-xs font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="bg-[#0E57A4] hover:bg-[#0b4685] text-white text-xs font-mono font-bold"
                  >
                    {saving ? "Saving..." : "Save Package"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
