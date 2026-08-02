"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(45000);
  const [originalPrice, setOriginalPrice] = useState<number | "">(65000);
  const [type, setType] = useState("Course");
  const [category, setCategory] = useState("Modern Pharmacy Course");
  const [level, setLevel] = useState("All Levels");
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !slug || !description) {
      setErrorMsg("Please fill in all required course fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
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
          published,
          coverImage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/admin/courses/${data.course.id}/edit`);
      } else {
        setErrorMsg(data.message || "Failed to create course.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Manager
        </Link>
        <span className="block font-mono text-xs text-chart-red uppercase font-semibold">
          CURRICULUM CREATION
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Create New Medical Course
        </h1>
        <p className="text-xs text-ink-muted mt-0.5 font-sans">
          Configure title, pricing, discount, categories, and cover image first. You will then be redirected to the Syllabus Builder.
        </p>
      </div>

      <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
        {errorMsg && (
          <div className="bg-chart-red-light border border-chart-red/30 p-3 rounded text-xs text-chart-red font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Pharmacy Course (SLMC Prep)"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="med-101-modern-pharmacy"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-ink font-medium mb-1">
              Course Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detailed overview of what clinicians will master..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
            />
          </div>

          {/* Pricing Row (Current Price vs Original Price for Strikethrough) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-linen/40 p-4 rounded-card border border-chart-grid">
            <div>
              <label className="block text-xs font-mono text-ink font-bold mb-1">
                Discounted Current Fee (රු) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-white border border-chart-grid rounded-input text-sm font-mono text-ink font-bold focus:outline-none focus:border-clinical-teal"
              />
              <span className="block text-[10px] font-mono text-sage mt-1">
                This is the actual price charged to the student.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink font-bold mb-1">
                Original Price (රු - Strikethrough)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 65000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                className="w-full px-3.5 py-2 bg-white border border-chart-grid rounded-input text-sm font-mono text-sage focus:outline-none focus:border-clinical-teal"
              />
              <span className="block text-[10px] font-mono text-sage mt-1">
                Higher price shown with a strikethrough (e.g. ~~LKR 65,000~~).
              </span>
            </div>
          </div>

          {/* Type, Category, Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                Course Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded-input text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
              >
                <option value="Course">Course</option>
                <option value="Bundle">Bundle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Pharmacy Course"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded-input text-xs font-sans text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-linen/50 border border-chart-grid rounded-input text-xs font-mono text-ink focus:outline-none focus:border-clinical-teal"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-mono text-ink font-medium mb-1">
              Cover Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal font-mono"
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
              <span className="text-xs font-mono text-ink font-semibold">
                Publish Course Immediately to Public Catalog
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-chart-grid flex justify-end gap-3">
            <Link href="/admin/courses">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} variant="default" className="gap-2 font-semibold">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving Course..." : "Save & Open Syllabus Builder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
