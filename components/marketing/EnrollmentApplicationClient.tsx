"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    if (!initialCourseParam) return courses[0] || null;
    return (
      courses.find(
        (c) =>
          c.slug.toLowerCase() === initialCourseParam.toLowerCase() ||
          c.id === initialCourseParam ||
          c.title.toLowerCase().includes(initialCourseParam.toLowerCase())
      ) ||
      courses[0] ||
      null
    );
  }, [courses, initialCourseParam]);

  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(matchedCourse);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waLink, setWaLink] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      courseSlug: matchedCourse?.slug || (courses[0]?.slug ?? ""),
      notes: "",
    },
  });

  const watchedCourseSlug = watch("courseSlug");

  useEffect(() => {
    if (watchedCourseSlug) {
      const found = courses.find((c) => c.slug === watchedCourseSlug);
      if (found) setSelectedCourse(found);
    }
  }, [watchedCourseSlug, courses]);

  useEffect(() => {
    if (matchedCourse) {
      setValue("courseSlug", matchedCourse.slug);
      setSelectedCourse(matchedCourse);
    }
  }, [matchedCourse, setValue]);

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Program Selection Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-mono text-slate-800 font-bold">
                  Course / Programme to Enroll In *
                </label>
                <select
                  {...register("courseSlug")}
                  className={`${inputClass} font-semibold text-slate-900`}
                >
                  <option value="">-- Select a Programme --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title} {c.price ? `(LKR ${c.price.toLocaleString()})` : ""}
                    </option>
                  ))}
                </select>
                {errors.courseSlug && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.courseSlug.message}
                  </p>
                )}
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
