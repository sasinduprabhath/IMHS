"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createStudentCredentialsWALink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  MessageCircle,
  CheckCircle2,
  BookOpen,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  RefreshCcw,
  IdCard,
  Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseOption {
  id: string;
  title: string;
  slug: string;
  price: number;
}

interface StudentForm {
  name: string;
  email: string;
  phone: string;
  tempPassword: string;
  selectedCourseIds: string[];
}

interface ConfirmedData {
  name: string;
  email: string;
  phone: string;
  studentId?: string;
  tempPass: string;
  courseTitles: string[];
  waLink: string;
}

const STEPS = [
  { id: 1, label: "Personal Details", icon: User },
  { id: 2, label: "Access Setup", icon: KeyRound },
  { id: 3, label: "Confirm & Send", icon: CheckCircle2 },
];

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pass = "IMHS-";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// ─── Step 1 - Personal Details ────────────────────────────────────────────────
function Step1({
  form,
  setForm,
}: {
  form: StudentForm;
  setForm: React.Dispatch<React.SetStateAction<StudentForm>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Student Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            required
            placeholder="e.g. Dr. Kavindu Perera"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full pl-9 pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="email"
            required
            placeholder="student@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full pl-9 pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal/20"
          />
        </div>
        <p className="text-[10px] font-mono text-sage mt-1.5">
          This will be the student's login username.
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          WhatsApp Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            required
            placeholder="+94 77 123 4567"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full pl-9 pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal/20"
          />
        </div>
        <p className="text-[10px] font-mono text-sage mt-1.5">
          Used to send credentials via WhatsApp deep-link.
        </p>
      </div>
    </div>
  );
}

// ─── Step 2 - Access Setup ────────────────────────────────────────────────────
function Step2({
  form,
  setForm,
  courses,
  loadingCourses,
}: {
  form: StudentForm;
  setForm: React.Dispatch<React.SetStateAction<StudentForm>>;
  courses: CourseOption[];
  loadingCourses: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "selected">("all");

  const toggleCourse = (id: string) =>
    setForm((f) => ({
      ...f,
      selectedCourseIds: f.selectedCourseIds.includes(id)
        ? f.selectedCourseIds.filter((c) => c !== id)
        : [...f.selectedCourseIds, id],
    }));

  const selectAll = () => {
    setForm((f) => ({
      ...f,
      selectedCourseIds: courses.map((c) => c.id),
    }));
  };

  const clearAll = () => {
    setForm((f) => ({ ...f, selectedCourseIds: [] }));
  };

  const handleRegen = () =>
    setForm((f) => ({ ...f, tempPassword: generateTempPassword() }));

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === "all" ? true : form.selectedCourseIds.includes(course.id);
    return matchesSearch && matchesFilter;
  });

  const selectedCoursesList = courses.filter((c) =>
    form.selectedCourseIds.includes(c.id)
  );

  const totalPrice = selectedCoursesList.reduce((sum, c) => sum + c.price, 0);

  return (
    <div className="space-y-6">
      {/* Temporary Password */}
      <div>
        <label className="block text-xs font-mono text-ink font-semibold mb-1.5">
          Temporary Password *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              required
              value={form.tempPassword}
              onChange={(e) => setForm((f) => ({ ...f, tempPassword: e.target.value }))}
              className="w-full pl-9 pr-3.5 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegen}
            className="gap-1.5 text-xs shrink-0 font-mono"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Regenerate
          </Button>
        </div>
        <p className="text-[10px] font-mono text-sage mt-1.5">
          Student must change this on first login.
        </p>
      </div>

      {/* Course Enrollment Header & Quick Actions */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-clinical-teal" />
            <label className="text-xs font-mono text-ink font-bold uppercase tracking-wider">
              Course Enrollments
            </label>
            <span className="bg-clinical-teal/10 text-clinical-teal text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {form.selectedCourseIds.length} / {courses.length}
            </span>
          </div>

          {courses.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={selectAll}
                className="text-clinical-teal hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-sage">•</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-sage hover:text-ink hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Selected Courses Summary Box */}
        {selectedCoursesList.length > 0 && (
          <div className="p-3 bg-clinical-teal-surface/70 border border-clinical-teal/25 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-ink font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-clinical-teal" />
                Active Enrollment Summary
              </span>
              <span className="text-clinical-teal font-bold">
                LKR {totalPrice.toLocaleString()} Total
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedCoursesList.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 bg-white border border-clinical-teal/30 text-ink text-xs font-medium px-2.5 py-1 rounded-lg shadow-xs"
                >
                  <span className="truncate max-w-[200px]">{c.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCourse(c.id);
                    }}
                    className="text-sage hover:text-red-500 font-bold ml-1 text-xs"
                    title="Remove course"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar & Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search by course title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-linen/40 border border-chart-grid rounded-lg text-xs text-ink focus:outline-none focus:border-clinical-teal"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sage hover:text-ink text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex border border-chart-grid rounded-lg p-0.5 bg-linen/40 text-[11px] font-mono shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                filterMode === "all"
                  ? "bg-white text-ink font-bold shadow-xs"
                  : "text-sage hover:text-ink"
              )}
            >
              All ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("selected")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                filterMode === "selected"
                  ? "bg-white text-ink font-bold shadow-xs"
                  : "text-sage hover:text-ink"
              )}
            >
              Selected ({form.selectedCourseIds.length})
            </button>
          </div>
        </div>

        {/* Course Cards List */}
        {loadingCourses ? (
          <div className="text-xs font-mono text-sage py-8 text-center bg-linen/30 rounded-xl border border-chart-grid border-dashed">
            Loading course catalog...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-xs font-mono text-sage py-8 text-center bg-linen/30 rounded-xl border border-chart-grid border-dashed">
            {searchTerm
              ? `No courses matching "${searchTerm}"`
              : filterMode === "selected"
              ? "No courses selected yet."
              : "No courses available."}
          </div>
        ) : (
          <div
            className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1.5 scroll-smooth select-text"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              overscrollBehavior: "contain",
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {filteredCourses.map((course) => {
              const checked = form.selectedCourseIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourse(course.id)}
                  className={cn(
                    "p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all group",
                    checked
                      ? "bg-clinical-teal-surface border-clinical-teal shadow-xs ring-1 ring-clinical-teal/30"
                      : "bg-surface border-chart-grid hover:bg-linen/60 hover:border-chart-grid/80"
                  )}
                >
                  <div className="min-w-0 pr-3">
                    <p className={cn("font-medium text-ink text-sm leading-snug", checked && "font-semibold text-clinical-teal")}>
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-sage font-medium">
                        LKR {course.price.toLocaleString()}
                      </span>
                      <span className="text-sage">•</span>
                      <span className="font-mono text-[10px] bg-linen border border-chart-grid px-1.5 py-0.2 rounded text-sage uppercase">
                        {course.slug}
                      </span>
                    </div>
                  </div>

                  {/* Styled Checkbox Pill */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                      checked
                        ? "bg-clinical-teal text-white shadow-xs"
                        : "border border-chart-grid bg-white group-hover:border-clinical-teal/50"
                    )}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3 - Confirm & Send ──────────────────────────────────────────────────
function Step3Confirm({
  confirmed,
  onAddAnother,
  onGoToDirectory,
}: {
  confirmed: ConfirmedData;
  onAddAnother: () => void;
  onGoToDirectory: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Email: ${confirmed.email}\nTemp Password: ${confirmed.tempPass}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Success banner */}
      <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-5 rounded-card text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-clinical-teal/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-clinical-teal" />
        </div>
        <h2 className="text-xl font-display font-semibold text-ink">
          Student Provisioned!
        </h2>
        <p className="text-xs text-ink-muted">
          Account created for{" "}
          <span className="font-semibold text-ink">{confirmed.name}</span>
        </p>
      </div>

      {/* Credentials card */}
      <div className="bg-linen border border-chart-grid rounded-card p-4 space-y-3 font-mono text-xs text-ink">
        <div className="flex items-center justify-between border-b border-chart-grid pb-2">
          <span className="text-[9px] font-mono uppercase text-sage font-bold tracking-wider">
            Generated Credentials
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-clinical-teal hover:text-clinical-teal/70 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="space-y-1.5">
          {confirmed.studentId && (
            <div className="flex gap-2">
              <span className="text-sage w-24 shrink-0">Reg. ID</span>
              <span className="font-bold text-clinical-teal">{confirmed.studentId}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-sage w-24 shrink-0">Email</span>
            <span className="break-all">{confirmed.email}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sage w-24 shrink-0">Phone</span>
            <span>{confirmed.phone}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sage w-24 shrink-0">Temp Pass</span>
            <span className="font-bold text-chart-red">{confirmed.tempPass}</span>
          </div>
          {confirmed.courseTitles.length > 0 && (
            <div className="flex gap-2 pt-1">
              <span className="text-sage w-24 shrink-0 pt-0.5">Courses</span>
              <ul className="space-y-0.5">
                {confirmed.courseTitles.map((t, i) => (
                  <li key={i} className="text-ink font-sans">
                    • {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp button */}
      <a
        href={confirmed.waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button
          variant="danger"
          size="lg"
          className="w-full gap-2.5 font-semibold text-sm"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          Open WhatsApp &amp; Send Login Details
        </Button>
      </a>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onAddAnother} className="flex-1 text-xs">
          Add Another Student
        </Button>
        <Button variant="ghost" onClick={onGoToDirectory} className="flex-1 text-xs">
          Student Directory
        </Button>
      </div>
    </div>
  );
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────
export default function AddStudentWizardPage() {
  const router = useRouter();

  const makeForm = (): StudentForm => ({
    name: "",
    email: "",
    phone: "",
    tempPassword: generateTempPassword(),
    selectedCourseIds: [],
  });

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentForm>(makeForm);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedData | null>(null);

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        if (d.courses) setCourses(d.courses);
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  const canAdvance = () => {
    if (step === 1) return form.name.trim() !== "" && form.email.trim() !== "" && form.phone.trim() !== "";
    if (step === 2) return form.tempPassword.trim() !== "";
    return true;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!form.name || !form.email || !form.phone || !form.tempPassword) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          tempPassword: form.tempPassword,
          courseIds: form.selectedCourseIds,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const enrolledTitles = courses
          .filter((c) => form.selectedCourseIds.includes(c.id))
          .map((c) => c.title);

        const waLink = createStudentCredentialsWALink(
          form.phone,
          form.name,
          form.email,
          form.tempPassword,
          enrolledTitles
        );

        setConfirmed({
          name: form.name,
          email: form.email,
          phone: form.phone,
          studentId: data.student?.studentId,
          tempPass: form.tempPassword,
          courseTitles: enrolledTitles,
          waLink,
        });
        setStep(3);
      } else {
        setErrorMsg(data.message || "Failed to create student account.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setForm(makeForm());
    setStep(1);
    setConfirmed(null);
    setErrorMsg("");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
        <span className="block font-mono text-xs text-chart-red uppercase font-semibold">
          ADMINISTRATIVE ONBOARDING
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Onboard New Student
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Create a student account after receiving payment verification.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = step > s.id || (step === 3 && confirmed !== null);
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className={cn("flex flex-col items-center gap-1 flex-1 transition-all", active ? "opacity-100" : done ? "opacity-80" : "opacity-40")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    active
                      ? "bg-chart-red text-white shadow-md"
                      : done
                        ? "bg-chart-red/20 text-chart-red border border-chart-red/30"
                        : "bg-linen border border-chart-grid text-ink-muted"
                  )}
                >
                  {done && step !== s.id ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden sm:block text-[10px] font-mono text-center leading-tight">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 max-w-[40px] transition-colors mt-[-16px]",
                    step > s.id ? "bg-chart-red" : "bg-chart-grid"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Card */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        {/* Step Title Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-chart-grid bg-linen/40">
          {React.createElement(STEPS[step - 1].icon, { className: "w-4 h-4 text-chart-red" })}
          <div>
            <p className="text-[10px] font-mono text-sage uppercase">Step {step} of {STEPS.length}</p>
            <p className="text-sm font-semibold text-ink leading-snug mt-0.5">
              {step === 1 && "Personal Details"}
              {step === 2 && "Access Setup"}
              {step === 3 && (confirmed ? "Account Created Successfully" : "Review & Confirm")}
            </p>
          </div>
        </div>

        {/* Step Body */}
        <div className="px-6 py-6">
          {errorMsg && (
            <div className="mb-4 bg-chart-red/8 border border-chart-red/30 p-3 rounded text-xs text-chart-red font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 1 && <Step1 form={form} setForm={setForm} />}
          {step === 2 && (
            <Step2
              form={form}
              setForm={setForm}
              courses={courses}
              loadingCourses={loadingCourses}
            />
          )}
          {step === 3 && confirmed && (
            <Step3Confirm
              confirmed={confirmed}
              onAddAnother={resetWizard}
              onGoToDirectory={() => router.push("/admin/students")}
            />
          )}

          {/* Review summary for step 3 before submit */}
          {step === 3 && !confirmed && (
            <div className="space-y-4">
              <div className="bg-linen/50 border border-chart-grid rounded-card divide-y divide-chart-grid overflow-hidden">
                {[
                  { label: "Name", value: form.name },
                  { label: "Email", value: form.email },
                  { label: "Phone", value: form.phone },
                  { label: "Password", value: form.tempPassword },
                  {
                    label: "Courses",
                    value:
                      form.selectedCourseIds.length > 0
                        ? courses.filter((c) => form.selectedCourseIds.includes(c.id)).map((c) => c.title).join(", ")
                        : "None selected",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 px-4 py-3">
                    <span className="text-[10px] font-mono text-sage font-bold uppercase shrink-0 w-20 pt-0.5">
                      {label}
                    </span>
                    <span className="text-sm text-ink break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer - hidden on step 3 confirmed */}
        {!(step === 3 && confirmed) && (
          <div className="px-6 py-4 border-t border-chart-grid flex items-center justify-between bg-linen/20">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1.5 text-xs font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="gap-1.5 text-xs font-semibold"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="danger"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 font-semibold"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? "Provisioning…" : "Create Account"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
