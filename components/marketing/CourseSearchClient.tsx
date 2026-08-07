"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { formatCurrency, formatGoogleDriveImageUrl } from "@/lib/utils";
import {
  Search, BookOpen, FileText, ArrowRight, Filter,
  Check, X, Sparkles, Tag, SlidersHorizontal, Clock, Users
} from "lucide-react";

export interface CourseItem {
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
  coverImage?: string | null;
  _count?: {
    enrollments: number;
  };
  chapters: {
    id: string;
    lessons: { id: string }[];
  }[];
}

export function CourseSearchClient({ courses }: { courses: CourseItem[] }) {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique types, categories, levels from dataset
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.type || "Course"));
    return Array.from(set);
  }, [courses]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.category || "General Healthcare"));
    return Array.from(set);
  }, [courses]);

  const availableLevels = useMemo(() => ["All Levels", "Beginner", "Intermediate", "Expert"], []);

  // Filter & Sort Logic
  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        // Search
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q);

        // Type
        const matchesType =
          selectedTypes.length === 0 || selectedTypes.includes(c.type || "Course");

        // Category
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(c.category || "General Healthcare");

        // Level
        const matchesLevel =
          selectedLevels.length === 0 ||
          selectedLevels.includes("All Levels") ||
          selectedLevels.includes(c.level || "All Levels");

        // Price
        let matchesPrice = true;
        if (selectedPrices.length > 0) {
          const isFree = c.price === 0;
          const isDiscounted = !!c.originalPrice && c.originalPrice > c.price;
          const isPaid = c.price > 0;

          matchesPrice = selectedPrices.some((p) => {
            if (p === "Free") return isFree;
            if (p === "Paid") return isPaid;
            if (p === "Discounted") return isDiscounted;
            return true;
          });
        }

        return matchesSearch && matchesType && matchesCategory && matchesLevel && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return a.title.localeCompare(b.title);
        if (sortBy === "title-az") return a.title.localeCompare(b.title);
        if (sortBy === "title-za") return b.title.localeCompare(a.title);
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0; // default newest / original order
      });
  }, [courses, search, selectedTypes, selectedCategories, selectedLevels, selectedPrices, sortBy]);

  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedPrices([]);
    setSortBy("newest");
  };

  const totalActiveFilters =
    selectedTypes.length +
    selectedCategories.length +
    selectedLevels.length +
    selectedPrices.length +
    (search ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Top Search Bar & Sort Dropdown */}
      <div className="bg-surface border border-chart-grid rounded-card p-4 sm:p-5 shadow-paper flex flex-col md:flex-row gap-4 items-center justify-between overflow-hidden max-w-full">
        
        {/* Search Input */}
        <div className="relative w-full flex-1 min-w-0 md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-sage shrink-0" />
          <input
            type="text"
            placeholder="Search by course title, topic or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-linen/50 border border-chart-grid rounded-input text-xs sm:text-sm text-ink placeholder:text-sage focus:outline-none focus:border-clinical-teal focus:bg-white transition-all font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-sage hover:text-ink text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto justify-between md:justify-end min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden gap-1.5 text-xs font-mono shrink-0"
          >
            <Filter className="w-3.5 h-3.5 text-clinical-teal" />
            Filters {totalActiveFilters > 0 && `(${totalActiveFilters})`}
          </Button>

          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <span className="text-xs font-mono text-sage whitespace-nowrap shrink-0 hidden sm:inline-block">
              Sort by:
            </span>
            <CustomSelect
              options={[
                { value: "newest", label: "Release Date (newest first)" },
                { value: "oldest", label: "Release Date (oldest first)" },
                { value: "title-az", label: "Course Title (a-z)" },
                { value: "title-za", label: "Course Title (z-a)" },
                { value: "price-low", label: "Price (low to high)" },
                { value: "price-high", label: "Price (high to low)" },
              ]}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort Catalogue"
              className="w-48 sm:w-56 max-w-full shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT SIDEBAR FILTERS (DESKTOP + MOBILE COLLAPSIBLE) ── */}
        <aside
          className={`md:col-span-3 space-y-6 bg-surface border border-chart-grid rounded-card p-5 shadow-paper ${
            mobileFilterOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-chart-grid">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-clinical-teal" />
              <h3 className="text-sm font-mono font-bold uppercase text-ink tracking-wider">Filter Catalog</h3>
            </div>
            {totalActiveFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-mono text-chart-red hover:underline font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* 1. Type Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">Type</h4>
            <div className="space-y-1.5">
              {availableTypes.map((type) => {
                const checked = selectedTypes.includes(type);
                return (
                  <label
                    key={type}
                    onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                    className="flex items-center gap-2.5 text-xs text-ink cursor-pointer hover:text-clinical-teal select-none py-1"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-clinical-teal border-clinical-teal text-white"
                          : "border-chart-grid bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Category Filter */}
          <div className="space-y-2.5 pt-3 border-t border-chart-grid">
            <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">Category</h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const checked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                    className="flex items-start gap-2.5 text-xs text-ink cursor-pointer hover:text-clinical-teal select-none py-1 leading-snug"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        checked
                          ? "bg-clinical-teal border-clinical-teal text-white"
                          : "border-chart-grid bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Level Filter */}
          <div className="space-y-2.5 pt-3 border-t border-chart-grid">
            <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">Level</h4>
            <div className="space-y-1.5">
              {availableLevels.map((lvl) => {
                const checked = selectedLevels.includes(lvl);
                return (
                  <label
                    key={lvl}
                    onClick={() => toggleFilter(selectedLevels, setSelectedLevels, lvl)}
                    className="flex items-center gap-2.5 text-xs text-ink cursor-pointer hover:text-clinical-teal select-none py-1"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-clinical-teal border-clinical-teal text-white"
                          : "border-chart-grid bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{lvl}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Price Filter */}
          <div className="space-y-2.5 pt-3 border-t border-chart-grid">
            <h4 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">Price Options</h4>
            <div className="space-y-1.5">
              {["Paid", "Discounted", "Free"].map((priceOpt) => {
                const checked = selectedPrices.includes(priceOpt);
                return (
                  <label
                    key={priceOpt}
                    onClick={() => toggleFilter(selectedPrices, setSelectedPrices, priceOpt)}
                    className="flex items-center gap-2.5 text-xs text-ink cursor-pointer hover:text-clinical-teal select-none py-1"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked
                          ? "bg-clinical-teal border-clinical-teal text-white"
                          : "border-chart-grid bg-white"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{priceOpt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── RIGHT COURSE CARDS GRID ── */}
        <div className="md:col-span-9 space-y-6">
          
          {/* Active Filter Chips Bar */}
          {totalActiveFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-linen/50 p-3 rounded-card border border-chart-grid">
              <span className="text-xs font-mono text-sage">Active Filters:</span>
              {selectedTypes.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-chart-grid px-2.5 py-0.5 rounded-full text-ink"
                >
                  Type: {t}
                  <X
                    className="w-3 h-3 cursor-pointer text-sage hover:text-chart-red"
                    onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)}
                  />
                </span>
              ))}
              {selectedCategories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-chart-grid px-2.5 py-0.5 rounded-full text-ink"
                >
                  {c}
                  <X
                    className="w-3 h-3 cursor-pointer text-sage hover:text-chart-red"
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}
                  />
                </span>
              ))}
              {selectedLevels.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-chart-grid px-2.5 py-0.5 rounded-full text-ink"
                >
                  Level: {l}
                  <X
                    className="w-3 h-3 cursor-pointer text-sage hover:text-chart-red"
                    onClick={() => toggleFilter(selectedLevels, setSelectedLevels, l)}
                  />
                </span>
              ))}
              {selectedPrices.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 text-[11px] font-mono bg-white border border-chart-grid px-2.5 py-0.5 rounded-full text-ink"
                >
                  Price: {p}
                  <X
                    className="w-3 h-3 cursor-pointer text-sage hover:text-chart-red"
                    onClick={() => toggleFilter(selectedPrices, setSelectedPrices, p)}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-chart-grid rounded-card space-y-4 shadow-paper">
              <BookOpen className="w-12 h-12 text-sage mx-auto" />
              <h3 className="text-lg font-semibold text-ink font-display">No matching courses found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Try selecting different filter checkboxes or clear active search terms.
              </p>
              <Button size="sm" variant="outline" onClick={clearAllFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const totalLessons = course.chapters.reduce(
                  (acc, ch) => acc + ch.lessons.length,
                  0
                );
                const hasDiscount = !!course.originalPrice && course.originalPrice > course.price;
                const savingsPct = hasDiscount
                  ? Math.round(((course.originalPrice! - course.price) / course.originalPrice!) * 100)
                  : 0;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper flex flex-col justify-between hover:border-clinical-teal/60 hover:shadow-xl transition-all duration-250 ease-out group transform-gpu"
                  >
                    {/* Cover Photo Frame */}
                    <div className="relative h-48 bg-linen overflow-hidden">
                      {course.coverImage ? (
                        (() => {
                          const imgSrc = formatGoogleDriveImageUrl(course.coverImage) || course.coverImage;
                          return (
                            <Image
                              src={imgSrc}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out transform-gpu"
                              unoptimized={imgSrc.startsWith("http")}
                            />
                          );
                        })()
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-clinical-teal/20 to-chart-red/20 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-clinical-teal/40" />
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="bg-ink/90 backdrop-blur-sm text-white font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded shadow">
                          {course.type || "Course"}
                        </span>
                        {hasDiscount && (
                          <span className="bg-chart-red text-white font-mono text-[10px] font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            SAVE {savingsPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {(() => {
                          let displayCat = course.category;
                          if (!displayCat || displayCat === "General" || displayCat === "General Healthcare") {
                            const t = course.title.toLowerCase();
                            const s = course.slug.toLowerCase();
                            if (t.includes("pharmacy") || s.includes("pharmacy")) displayCat = "Pharmacy Practice";
                            else if (t.includes("laboratory") || t.includes("lab") || s.includes("lab")) displayCat = "Medical Laboratory Technology";
                            else if (t.includes("manufacturing") || s.includes("manufacturing")) displayCat = "Pharmaceutical Manufacturing";
                            else if (t.includes("revision") || t.includes("slmc") || s.includes("slmc")) displayCat = "SLMC Exam Prep & Revision";
                            else if (t.includes("pharma") || s.includes("pharma")) displayCat = "Pharmaceutical Sciences";
                            else displayCat = "Clinical Medicine";
                          }

                          return (
                            <div className="flex items-center justify-between text-[11px] font-mono text-clinical-teal font-semibold">
                              <span className="truncate">{displayCat}</span>
                              <span className="text-sage shrink-0 ml-2">{course.level || "All Levels"}</span>
                            </div>
                          );
                        })()}
                        
                        <h3 className="text-base font-semibold font-sans text-ink leading-snug line-clamp-2 group-hover:text-clinical-teal transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Course Meta (Chapters, Lessons, Questions, Validity, Total Enrolled) */}
                      <div className="space-y-2 pt-2 border-t border-chart-grid/60">
                        <div className="flex items-center justify-between text-[11px] font-mono text-sage gap-2">
                          {(() => {
                            const allItems = course.chapters.flatMap((ch) => ch.lessons);
                            const qCount = allItems.filter((l: any) => l.type === "QUIZ" || l.title?.startsWith("Quiz Q")).length;
                            const lCount = allItems.length - qCount;

                            return (
                              <span className="flex items-center gap-1 truncate min-w-0">
                                <BookOpen className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                                {course.chapters.length} Ch · {lCount} Lessons {qCount > 0 ? `· ${qCount} Questions` : ""}
                              </span>
                            );
                          })()}
                          <span className="flex items-center gap-1 text-ink font-semibold whitespace-nowrap shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {course.enrollmentValidity || "Lifetime Access"}
                          </span>
                        </div>

                        {(() => {
                          const dbEnrolled = course._count?.enrollments || 0;
                          const fallbackEnrolled = course.totalEnrolled || 0;
                          const count = dbEnrolled > 0 ? dbEnrolled : fallbackEnrolled;
                          const enrolledText = count > 0 ? `${count} Enrolled Students` : "Active Enrollment Open";

                          return (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-sage">
                              <Users className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                              <span>{enrolledText}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Price Section */}
                      <div className="pt-3 border-t border-chart-grid/60 flex items-center justify-between gap-3">
                        <div className="shrink-0">
                          {hasDiscount && (
                            <span className="block text-[11px] font-mono text-sage line-through decoration-sage/80 leading-none mb-1">
                              {formatCurrency(course.originalPrice!)}
                            </span>
                          )}
                          <span className="block font-mono text-base sm:text-lg font-extrabold text-ink leading-none whitespace-nowrap">
                            {formatCurrency(course.price)}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-clinical-teal font-sans flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Explore Program <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
