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
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Mail,
  User,
  ArrowRight,
  FileCheck,
  Copy,
  Check,
} from "lucide-react";

export interface CourseOption {
  id: string;
  title: string;
  slug: string;
  code?: string | null;
  price?: number | null;
  category?: string | null;
  level?: string | null;
  duration?: string | null;
  enrollmentValidity?: string | null;
}

const enrollmentSchema = z.object({
  name: z.string().min(2, "Full name is required (minimum 2 characters)"),
  phone: z.string().min(8, "Valid WhatsApp phone number is required"),
  email: z.string().email("Valid email address is required for portal access"),
  courseSlug: z.string().min(1, "Please select a course to enroll in"),
  nicNumber: z.string().max(20).optional().or(z.literal("")),
  qualification: z.string().optional(),
  learningMode: z.string().default("Live Zoom & Portal Recordings"),
  notes: z.string().max(1000).optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export function EnrollmentApplicationClient({
  courses,
}: {
  courses: CourseOption[];
}) {
  const searchParams = useSearchParams();
  const initialCourseParam = searchParams.get("course") || "";

  // Find preselected course from URL query param
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
  const [referenceCode, setReferenceCode] = useState("");
  const [copiedBank, setCopiedBank] = useState(false);

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
      learningMode: "Live Zoom & Portal Recordings",
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

    const ref = `IMHS-ENR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setReferenceCode(ref);

    const courseTitle = selectedCourse?.title || data.courseSlug;

    const fullMessage = [
      `[OFFICIAL COURSE ENROLLMENT APPLICATION]`,
      `• Ref Code: ${ref}`,
      `• Selected Course: ${courseTitle}`,
      `• Learning Mode: ${data.learningMode}`,
      data.nicNumber ? `• NIC / Passport: ${data.nicNumber}` : null,
      data.qualification ? `• Educational Background: ${data.qualification}` : null,
      data.notes ? `• Additional Notes: ${data.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          courseInterest: courseTitle,
          message: fullMessage,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit enrollment. Please message our WhatsApp desk.");
      }
    } catch {
      alert("Submission error. Please connect directly with our WhatsApp Admissions coordinator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppConfirmationLink = () => {
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") || "94766506621";
    const courseTitle = selectedCourse?.title || "IMHS Course";
    const text =
      `Hello IMHS Admissions Desk,\n\n` +
      `*Course Enrollment Application Confirmation*\n` +
      `• Application Ref: ${referenceCode}\n` +
      `• Selected Course: ${courseTitle}\n\n` +
      `I have submitted my online application. Please confirm my placement and send the bank deposit verification details. Thank you!`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  };

  const copyBankDetails = () => {
    const text =
      `Institute of Medicine and Health Sciences (IMHS)\nBank: Commercial Bank of Ceylon\nAccount Name: IMHS Education\nBranch: Colombo`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#0E57A4] focus:ring-2 focus:ring-[#0E57A4]/15 focus:bg-white transition-all duration-200 font-sans placeholder:text-slate-400";

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {submitted ? (
          /* ── SUCCESS STATE ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-10 shadow-paper text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Application Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                Enrollment Application Submitted!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Thank you for applying to{" "}
                <strong className="text-slate-900">{selectedCourse?.title}</strong>.
                Our Admissions Coordinator has received your details and will verify your placement.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-700">
              <span className="text-slate-400">Application Ref:</span>
              <strong className="text-[#0E57A4] tracking-wider">{referenceCode}</strong>
            </div>

            {/* Next Steps Card */}
            <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0E57A4]" /> Next Steps to Activate Student Portal
              </h4>
              <ol className="text-xs text-slate-600 space-y-2 font-sans list-decimal list-inside leading-relaxed">
                <li>
                  Send your application reference code or bank transfer receipt to our Admissions Coordinator via WhatsApp.
                </li>
                <li>
                  Our desk confirms payment and generates your official <strong>Student Reg ID</strong> (e.g. <code>IWPH4100</code>).
                </li>
                <li>
                  You will receive your temporary password via WhatsApp / Email to begin your lectures immediately.
                </li>
              </ol>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={getWhatsAppConfirmationLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                Complete Enrollment on WhatsApp Desk
              </a>

              <Link
                href="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Browse Other Courses
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ── ENROLLMENT FORM ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-paper">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <span className="font-mono text-[11px] font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
                  Official Application Form
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                  Student Enrollment Details
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-1">
                  Fill in your registration details below. Our admissions team will issue your course portal access upon verification.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Course Selection Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-800 font-bold flex items-center justify-between">
                    <span>Selected Program *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Choose from available courses</span>
                  </label>
                  <select
                    {...register("courseSlug")}
                    className={`${inputClass} font-semibold text-slate-900`}
                  >
                    <option value="">-- Select a Course / Program --</option>
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
                    Full Name (with Title) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. / Mr. / Ms. Nirmal Silva"
                    {...register("name")}
                    className={inputClass}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 font-mono flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* WhatsApp & Email Grid */}
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
                      Email Address (for Portal Login) *
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

                {/* NIC / Background Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-800 font-bold">
                      NIC / Passport Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 200012345678"
                      {...register("nicNumber")}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-800 font-bold">
                      Educational Background
                    </label>
                    <select {...register("qualification")} className={inputClass}>
                      <option value="External Pharmacist Candidate">External Pharmacist Candidate</option>
                      <option value="GCE A/L Science Student">GCE A/L Bioscience Student</option>
                      <option value="Practicing Pharmacy Assistant">Pharmacy Assistant / Dispenser</option>
                      <option value="Healthcare Professional">Healthcare / Nursing Professional</option>
                      <option value="Medical Graduate / Doctor">Medical Graduate / Doctor</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                </div>

                {/* Learning Mode */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-800 font-bold">
                    Preferred Study Mode
                  </label>
                  <select {...register("learningMode")} className={inputClass}>
                    <option value="Live Zoom & Portal Recordings">Live Zoom Lectures + 24/7 Portal Video Recordings</option>
                    <option value="Self-Paced Flexible Access">Self-Paced Portal Video Access Only</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-800 font-bold">
                    Additional Comments or Questions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any specific questions about schedule, examination batches, or installment plans..."
                    {...register("notes")}
                    className={inputClass}
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0E57A4] to-[#1665C1] hover:brightness-105 text-white font-mono text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Submit Course Enrollment Application
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-slate-400 font-sans mt-2">
                    🔒 Your information is safely encrypted. Admissions desk will reach out within 24 hours.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Selected Course Overview & Admission Process */}
            <div className="lg:col-span-5 space-y-6">
              {/* Selected Program Card */}
              {selectedCourse ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-paper space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      Selected Course
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-display font-bold text-slate-900 leading-snug">
                      {selectedCourse.title}
                    </h3>
                    {selectedCourse.category && (
                      <p className="text-xs text-slate-500 font-sans">
                        Category: {selectedCourse.category}
                      </p>
                    )}
                  </div>

                  {/* Fee display */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Program Tuition Fee
                      </div>
                      <div className="text-xl font-display font-bold text-[#0E57A4]">
                        {selectedCourse.price
                          ? `LKR ${selectedCourse.price.toLocaleString()}`
                          : "Contact Admissions"}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1 rounded-full">
                      Admissions Open
                    </span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-slate-600 font-sans">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full syllabus video coverage &amp; lecture notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Single-device protected 24/7 student portal access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Interactive prescription review &amp; pharmacy rush simulator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct WhatsApp guidance from faculty coordinators</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Admissions Support Card */}
              <div className="bg-gradient-to-br from-[#0C1A30] to-[#0A1628] rounded-3xl p-6 text-white space-y-4 shadow-xl">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                    Need Assistance?
                  </span>
                  <h4 className="text-base font-display font-bold">
                    Talk Directly to Admissions
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Have questions regarding eligibility, course timetable, or installment payment options? Contact our WhatsApp desk directly.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                  <a
                    href="https://wa.me/94766506621?text=Hello%20IMHS%20Admissions%2C%20I%20have%20an%20inquiry%20regarding%20course%20enrollment."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-xs font-bold text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat on WhatsApp (+94 76 650 6621)
                  </a>

                  <a
                    href="tel:+94766506621"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 font-mono text-xs font-semibold text-white/90 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Hotline (076 650 6621)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
