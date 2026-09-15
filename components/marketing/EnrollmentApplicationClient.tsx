"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Mail,
  User,
  ArrowRight,
  Send,
  Search,
  ChevronDown,
  Check,
  BookOpen,
  X,
} from "lucide-react";

export interface CourseOption {
  id: string;
  title: string;
  slug: string;
  price?: number | null;
  category?: string | null;
  level?: string | null;
}

const enrollmentSchema = z.object({
  name: z.string().min(2, "Full name is required (minimum 2 characters)"),
  phone: z.string().min(8, "Valid WhatsApp phone number is required"),
  email: z.string().email("Valid email address is required"),
  courseSlug: z.string().min(1, "Please select a course to enroll in"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

const ADMIN_WHATSAPP_NUMBER = "94766506621";

export function EnrollmentApplicationClient({
  courses,
}: {
  courses: CourseOption[];
}) {
  const searchParams = useSearchParams();
  const initialCourseParam = searchParams.get("course") || "";

  // Preselect matched course from URL query param if present
  const matchedCourse = useMemo(() => {
    if (!initialCourseParam) return null;
    return (
      courses.find(
        (c) =>
          c.slug.toLowerCase() === initialCourseParam.toLowerCase() ||
          c.id === initialCourseParam ||
          c.title.toLowerCase().includes(initialCourseParam.toLowerCase())
      ) || null
    );
  }, [courses, initialCourseParam]);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(matchedCourse);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waLink, setWaLink] = useState("");

  // Custom Combobox State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      courseSlug: matchedCourse?.slug || "",
      notes: "",
    },
  });

  const watchedCourseSlug = watch("courseSlug");

  // Sync selected course with watched slug
  useEffect(() => {
    if (watchedCourseSlug) {
      const found = courses.find((c) => c.slug === watchedCourseSlug);
      if (found) setSelectedCourse(found);
    } else {
      setSelectedCourse(null);
    }
  }, [watchedCourseSlug, courses]);

  // Sync if URL query param resolves to a course
  useEffect(() => {
    if (matchedCourse) {
      setValue("courseSlug", matchedCourse.slug, { shouldValidate: true });
      setSelectedCourse(matchedCourse);
    }
  }, [matchedCourse, setValue]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category && c.category.trim()) set.add(c.category.trim());
    });
    return ["All", ...Array.from(set)];
  }, [courses]);

  // Click outside and Escape key handling for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  // Filter courses based on query and category
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((c) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.level && c.level.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [courses, searchQuery, selectedCategory]);

  const handleSelectCourse = (course: CourseOption) => {
    setValue("courseSlug", course.slug, { shouldValidate: true });
    setSelectedCourse(course);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    setIsSubmitting(true);

    const courseTitle = selectedCourse?.title || data.courseSlug;

    // Construct the direct WhatsApp message for the Admin
    const waText =
      `*OFFICIAL COURSE ENROLLMENT INQUIRY*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• *Full Name:* ${data.name}\n` +
      `• *WhatsApp:* ${data.phone}\n` +
      `• *Email:* ${data.email}\n` +
      `• *Program:* ${courseTitle}\n` +
      (data.notes ? `• *Notes:* ${data.notes}\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Hello IMHS Admissions Desk, I would like to enroll in this program. Please provide enrollment confirmation and banking details.`;

    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    setWaLink(whatsappUrl);

    // Save to Database via contact inquiry API for admin tracking
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          courseInterest: courseTitle,
          message: data.notes || `Direct online enrollment request for: ${courseTitle}`,
        }),
      });
    } catch (e) {
      console.warn("Inquiry DB backup save error:", e);
    }

    setSubmitted(true);
    setIsSubmitting(false);

    // Directly open WhatsApp with the pre-filled message to the admin
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/15 focus:bg-white transition-all duration-200 font-sans placeholder:text-slate-400";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {submitted ? (
          /* ── SUCCESS STATE WITH DIRECT WHATSAPP ACTION ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
                Application Dispatched
              </span>
              <h2 className="text-2xl font-display font-bold text-slate-900">
                Enrollment Inquiry Sent!
              </h2>
              <p className="text-sm text-slate-600 font-sans max-w-md mx-auto leading-relaxed">
                Your application has been received. You can now chat directly with our Admissions Desk on WhatsApp to complete your registration.
              </p>
            </div>

            {waLink && (
              <div className="pt-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <MessageSquare className="w-5 h-5 fill-white" />
                  <span>Open WhatsApp Admissions Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono text-slate-500">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="hover:text-[#0E57A4] underline transition-colors cursor-pointer"
              >
                Submit another application
              </button>
              <span className="hidden sm:inline">·</span>
              <Link href="/courses" className="hover:text-[#0E57A4] underline transition-colors">
                Browse all courses
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── STREAMLINED ENROLLMENT FORM ── */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-paper max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0E57A4] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Admissions Form</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                Enroll in a Programme
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Fill out the details below. Your inquiry will be sent directly to the admissions team on WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Program Selection - Modern Searchable Combobox */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-slate-800 font-bold">
                    Course / Programme to Enroll In *
                  </label>
                  {selectedCourse && (
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      className="text-[11px] font-sans font-semibold text-[#0E57A4] hover:underline cursor-pointer"
                    >
                      {isDropdownOpen ? "Close list" : "Change programme"}
                    </button>
                  )}
                </div>

                {/* Hidden input for react-hook-form validation */}
                <input type="hidden" {...register("courseSlug")} />

                {/* Combobox Trigger Button */}
                <button
                  type="button"
                  id="course-selector-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`w-full text-left transition-all duration-200 rounded-2xl border p-3 sm:p-3.5 flex items-center justify-between gap-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E57A4]/20 ${
                    errors.courseSlug
                      ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-500/15"
                      : isDropdownOpen
                      ? "border-[#0E57A4] ring-2 ring-[#0E57A4]/15 bg-white shadow-md shadow-blue-900/5"
                      : "border-slate-200 bg-slate-50/90 hover:bg-slate-100/70 hover:border-slate-300"
                  }`}
                >
                  {selectedCourse ? (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#0E57A4]/15 border border-blue-200/60 flex items-center justify-center text-[#0E57A4] shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug group-hover:text-[#0E57A4] transition-colors">
                          {selectedCourse.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {selectedCourse.category && (
                            <span className="inline-flex items-center text-[10px] font-mono font-medium text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                              {selectedCourse.category}
                            </span>
                          )}
                          {selectedCourse.price ? (
                            <span className="inline-flex items-center text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                              LKR {selectedCourse.price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              Tuition Fee on Inquiry
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-700">
                          -- Select a Programme --
                        </div>
                        <div className="text-[11px] font-sans text-slate-400">
                          Click to search and choose from {courses.length} available courses
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isDropdownOpen
                          ? "bg-blue-50 text-[#0E57A4] rotate-180"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {errors.courseSlug && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.courseSlug.message}
                  </p>
                )}

                {/* Floating Dropdown Popover */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.99 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 z-50 overflow-hidden flex flex-col backdrop-blur-xl"
                    >
                      {/* Search & Header Bar */}
                      <div className="p-3 bg-slate-50/95 border-b border-slate-200/80 space-y-2.5">
                        <div className="relative flex items-center">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses by keyword, batch, subject..."
                            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/15 font-sans shadow-xs"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                              title="Clear search"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Category filter pills */}
                        {categories.length > 2 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                  selectedCategory === cat
                                    ? "bg-[#0E57A4] text-white shadow-xs"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1 pt-0.5">
                          <span>Select a course from list</span>
                          <span className="font-semibold text-slate-700">
                            {filteredCourses.length} of {courses.length} programmes
                          </span>
                        </div>
                      </div>

                      {/* Scrollable Course Items List */}
                      <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((c) => {
                            const isCurrent = selectedCourse?.slug === c.slug;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectCourse(c)}
                                className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                                  isCurrent
                                    ? "bg-blue-50/90 hover:bg-blue-100/70"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-xs sm:text-sm leading-snug line-clamp-2 ${
                                      isCurrent
                                        ? "font-bold text-[#0E57A4]"
                                        : "font-semibold text-slate-800 group-hover:text-[#0E57A4]"
                                    }`}
                                  >
                                    {c.title}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {c.category && (
                                      <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {c.category}
                                      </span>
                                    )}
                                    {c.level && (
                                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                        {c.level}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pl-2">
                                  {c.price ? (
                                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 whitespace-nowrap">
                                      LKR {c.price.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                                      Fee on Inquiry
                                    </span>
                                  )}

                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                      isCurrent
                                        ? "bg-[#0E57A4] text-white"
                                        : "opacity-0 group-hover:opacity-100 text-slate-300"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="py-8 px-4 text-center space-y-2">
                            <p className="text-xs font-mono text-slate-500">
                              No programmes found matching &ldquo;{searchQuery}&rdquo;
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("All");
                              }}
                              className="text-xs text-[#0E57A4] font-bold hover:underline cursor-pointer"
                            >
                              Clear search &amp; show all
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-800 font-bold">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Dr. / Mr. / Ms. Full Name"
                  {...register("name")}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name.message}
                  </p>
                )}
              </div>

              {/* WhatsApp Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-800 font-bold">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="076 650 6621"
                    {...register("phone")}
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-800 font-bold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    {...register("email")}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Message / Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-800 font-bold">
                  Your Message / Inquiry <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Any questions about the course, batch timetable, or registration..."
                  {...register("notes")}
                  className={inputClass}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#0E57A4] via-[#1262B5] to-[#F16726] hover:brightness-105 text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5"
                >
                  {isSubmitting ? (
                    "Connecting to Admissions Desk..."
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 fill-white/20" />
                      <span>Submit &amp; Enroll via WhatsApp</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-slate-500 font-sans mt-2.5">
                  Direct inquiry to IMHS Admissions Coordinator (+94 76 650 6621) on WhatsApp.
                </p>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
