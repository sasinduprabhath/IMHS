"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wizard } from "@/components/admin/Wizard";
import { createStudentCredentialsWALink } from "@/lib/whatsapp";
import {
  UserPlus,
  ArrowLeft,
  KeyRound,
  MessageCircle,
  CheckCircle2,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Info,
} from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
  slug: string;
  price: number;
}

export default function AddStudentOnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // State flags
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateStudentId();
    generateTempPassword();

    // Fetch published courses for selection
    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const seq = Math.floor(1000 + Math.random() * 9000);
    setStudentId(`IMHS/${year}/${seq}`);
  };

  const generateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "IMHS-";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(pass);
  };

  const toggleCourseSelect = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  // Step 1 Save: Create User Record immediately
  const handleStep1Save = async () => {
    setErrorMsg("");
    if (!name || !email || !phone || !tempPassword) {
      setErrorMsg("Please fill in Name, Email, Phone, and Password.");
      return false;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          studentId,
          tempPassword,
          courseIds: [],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedUser(data.student);
        return true;
      } else {
        setErrorMsg(data.message || "Failed to create student account.");
        return false;
      }
    } catch (err) {
      setErrorMsg("Error creating student record.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2 Save: Assign selected courses
  const handleStep2Save = async () => {
    if (!createdUser?.id || selectedCourseIds.length === 0) return true;

    setIsSaving(true);
    try {
      for (const courseId of selectedCourseIds) {
        await fetch(`/api/admin/students/${createdUser.id}/enrollments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
      }
      return true;
    } catch (err) {
      console.error("Failed to enroll student:", err);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: "details", title: "Student Details", description: "Identity & Credentials" },
    { id: "courses", title: "Assign Courses", description: "Select Enrollment Programs" },
    { id: "review", title: "Review & Send", description: "WhatsApp Provisioning" },
  ];

  const enrolledTitles = courses
    .filter((c) => selectedCourseIds.includes(c.id))
    .map((c) => c.title);

  const waLink = createStudentCredentialsWALink(
    phone,
    name,
    email,
    tempPassword,
    enrolledTitles
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
        <span className="block font-mono text-xs text-chart-red uppercase font-semibold">
          ADMINISTRATIVE ONBOARDING WIZARD
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Onboard New Student
        </h1>
        <p className="text-xs text-ink-muted mt-0.5 font-sans">
          Create student credentials and provision course access via WhatsApp.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-chart-red-light border border-chart-red/30 p-3 rounded text-xs text-chart-red font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      <Wizard
        steps={steps}
        currentStepIndex={currentStep}
        onStepChange={setCurrentStep}
        isSaving={isSaving}
        canSkipNext={currentStep === 1}
        skipNextLabel="Skip — assign later"
        onSkipNext={() => setCurrentStep(2)}
        onNext={async () => {
          if (currentStep === 0) return await handleStep1Save();
          if (currentStep === 1) return await handleStep2Save();
          return true;
        }}
        nextLabel={currentStep === 2 ? "Finish & Open WhatsApp" : undefined}
        onComplete={() => {
          window.open(waLink, "_blank");
          router.push("/admin/students");
        }}
      >
        {/* ── STEP 1: STUDENT DETAILS ── */}
        {currentStep === 0 && (
          <div className="space-y-4 max-w-xl mx-auto py-2">
            <div>
              <label className="block text-xs font-mono text-ink font-semibold mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Kavindu Perera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm text-ink focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1">
                  Student Registration ID (Auto-Generated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={studentId}
                    className="w-full px-3.5 py-2 bg-linen border border-chart-grid rounded-input text-sm font-mono text-clinical-teal font-bold"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateStudentId}
                    className="shrink-0 text-xs"
                    title="Regenerate ID"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-ink font-semibold mb-1">
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-chart-red font-bold"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateTempPassword}
                    className="shrink-0 text-xs"
                    title="Generate New Password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: ASSIGN COURSES ── */}
        {currentStep === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-ink font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Select Program Enrollments for {name}
              </label>
              <span className="text-xs font-mono text-sage">
                {selectedCourseIds.length} Selected
              </span>
            </div>

            {courses.length === 0 ? (
              <p className="text-xs font-mono text-sage text-center py-8">Loading published courses...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {courses.map((course) => {
                  const isChecked = selectedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourseSelect(course.id)}
                      className={`p-3.5 rounded border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-clinical-teal/10 border-clinical-teal text-ink font-semibold shadow-xs"
                          : "bg-surface border-chart-grid text-ink-muted hover:bg-linen/50"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="font-sans font-medium text-ink block truncate">{course.title}</span>
                        <span className="font-mono text-[10px] text-clinical-teal">{course.slug}</span>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 accent-clinical-teal shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: REVIEW & SEND ── */}
        {currentStep === 2 && (
          <div className="space-y-5 max-w-xl mx-auto py-2">
            <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-4 rounded text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-clinical-teal mx-auto" />
              <h3 className="text-base font-display font-semibold text-ink">
                Ready to Send Credentials via WhatsApp
              </h3>
              <p className="text-xs text-ink-muted">
                Student account <span className="font-bold text-ink">{studentId}</span> created.
              </p>
            </div>

            {/* Credential Message Preview */}
            <div className="bg-linen border border-chart-grid p-4 rounded space-y-3 font-mono text-xs text-ink">
              <div className="flex items-center justify-between border-b border-chart-grid pb-2">
                <span className="text-sage font-bold uppercase text-[10px]">Formatted WhatsApp Preview</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Email: ${email}\nTemp Password: ${tempPassword}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-clinical-teal hover:underline flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div><span className="text-sage">Student Name:</span> <span className="font-bold text-ink">{name}</span></div>
                <div><span className="text-sage">Student ID:</span> <span className="font-bold text-clinical-teal">{studentId}</span></div>
                <div><span className="text-sage">Email Login:</span> {email}</div>
                <div><span className="text-sage">Phone:</span> {phone}</div>
                <div><span className="text-sage">Temp Password:</span> <span className="font-bold text-chart-red">{tempPassword}</span></div>
                <div>
                  <span className="text-sage">Course Access:</span>
                  <ul className="list-disc pl-4 pt-1 font-sans text-xs">
                    {enrolledTitles.length > 0 ? (
                      enrolledTitles.map((t, idx) => <li key={idx}>{t}</li>)
                    ) : (
                      <li className="text-sage italic">No courses assigned yet (assignable anytime)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Helpful Admin Note */}
            <div className="flex items-start gap-2 bg-linen/70 border border-chart-grid p-3 rounded text-xs text-ink-muted">
              <Info className="w-4 h-4 text-clinical-teal shrink-0 mt-0.5" />
              <span>
                <strong>Note for Admin:</strong> Clicking Finish will launch WhatsApp prefilled with these credentials. You can add, change, or revoke course enrollments anytime from the student&apos;s detail page in the directory.
              </span>
            </div>
          </div>
        )}
      </Wizard>
    </div>
  );
}

