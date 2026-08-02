"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

interface CourseOption {
  id: string;
  title: string;
  slug: string;
  price: number;
}

export default function AddStudentOnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Confirmation state
  const [createdStudentData, setCreatedStudentData] = useState<{
    name: string;
    email: string;
    phone: string;
    tempPass: string;
    courseTitles: string[];
    waLink: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateTempPassword();
    // Fetch published courses for selection
    fetch("/api/admin/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourseIds([data.courses[0].id]);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !phone || !tempPassword) {
      setErrorMsg("Please fill in all required student details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          tempPassword,
          courseIds: selectedCourseIds,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
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

        setCreatedStudentData({
          name,
          email,
          phone,
          tempPass: tempPassword,
          courseTitles: enrolledTitles,
          waLink,
        });
      } else {
        setErrorMsg(data.message || "Failed to create student account.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-clinical-teal mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>
        <span className="block font-mono text-xs text-chart-red uppercase font-semibold">
          ADMINISTRATIVE ONBOARDING
        </span>
        <h1 className="text-3xl font-display font-semibold text-ink">
          Onboard New Student
        </h1>
        <p className="text-xs text-ink-muted mt-0.5 font-sans">
          Create student account after receiving payment verification over WhatsApp.
        </p>
      </div>

      {createdStudentData ? (
        /* Confirmation Screen (Workflow 7.1) */
        <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper-stack animate-in fade-in">
          <div className="bg-clinical-teal-surface border border-clinical-teal/30 p-4 rounded text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-clinical-teal mx-auto" />
            <h2 className="text-xl font-display font-semibold text-ink">
              Student Provisioned Successfully!
            </h2>
            <p className="text-xs text-ink-muted">
              Account created for <span className="font-semibold text-ink">{createdStudentData.name}</span>
            </p>
          </div>

          {/* Formatted Credentials Card */}
          <div className="bg-linen border border-chart-grid p-4 rounded space-y-3 font-mono text-xs text-ink">
            <div className="flex items-center justify-between border-b border-chart-grid pb-2">
              <span className="text-sage font-bold uppercase text-[10px]">Generated Credentials</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Email: ${createdStudentData.email}\nTemp Password: ${createdStudentData.tempPass}`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-clinical-teal hover:underline flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Details"}
              </button>
            </div>

            <div className="space-y-1">
              <div><span className="text-sage">Email:</span> {createdStudentData.email}</div>
              <div><span className="text-sage">Phone:</span> {createdStudentData.phone}</div>
              <div><span className="text-sage">Temp Pass:</span> <span className="font-bold text-chart-red">{createdStudentData.tempPass}</span></div>
              <div>
                <span className="text-sage">Assigned Courses:</span>
                <ul className="list-disc pl-4 pt-1 font-sans text-xs">
                  {createdStudentData.courseTitles.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* WhatsApp Deep Link Button */}
          <div className="space-y-3 pt-2">
            <a
              href={createdStudentData.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button variant="danger" size="lg" className="w-full gap-2.5 font-semibold text-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
                Open WhatsApp & Send Login Link
              </Button>
            </a>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedStudentData(null);
                  setName("");
                  setEmail("");
                  setPhone("");
                  generateTempPassword();
                }}
                className="flex-1 text-xs"
              >
                Add Another Student
              </Button>

              <Link href="/admin/students" className="flex-1">
                <Button variant="ghost" className="w-full text-xs">
                  Return to Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Onboarding Form */
        <div className="bg-surface border border-chart-grid p-6 sm:p-8 rounded-card space-y-6 shadow-paper">
          {errorMsg && (
            <div className="bg-chart-red-light border border-chart-red/30 p-3 rounded text-xs text-chart-red font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
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
                <label className="block text-xs font-mono text-ink font-medium mb-1">
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
                <label className="block text-xs font-mono text-ink font-medium mb-1">
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

            <div>
              <label className="block text-xs font-mono text-ink font-medium mb-1">
                Temporary Password *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-linen/50 border border-chart-grid rounded-input text-sm font-mono text-ink focus:outline-none focus:border-clinical-teal"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateTempPassword}
                  className="text-xs shrink-0"
                >
                  Generate New
                </Button>
              </div>
            </div>

            {/* Course Enrollment Multi-Select */}
            <div className="space-y-2 pt-2 border-t border-chart-grid">
              <label className="block text-xs font-mono text-ink font-semibold flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-clinical-teal" /> Select Course Enrollments *
              </label>

              {courses.length === 0 ? (
                <p className="text-xs font-mono text-sage">Loading published courses...</p>
              ) : (
                <div className="space-y-2">
                  {courses.map((course) => {
                    const isChecked = selectedCourseIds.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => toggleCourseSelect(course.id)}
                        className={`p-3 rounded border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isChecked
                            ? "bg-clinical-teal-surface border-clinical-teal text-ink font-semibold"
                            : "bg-surface border-chart-grid text-ink-muted hover:bg-linen/50"
                        }`}
                      >
                        <div>
                          <span className="font-sans font-medium text-ink block">{course.title}</span>
                          <span className="font-mono text-[10px] text-sage">{course.slug}</span>
                        </div>

                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 accent-clinical-teal"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-chart-grid flex justify-end gap-3">
              <Link href="/admin/students">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} variant="danger" className="gap-2 font-semibold">
                <UserPlus className="w-4 h-4" />
                {isSubmitting ? "Provisioning Student..." : "Create Account & Generate WhatsApp Link"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
