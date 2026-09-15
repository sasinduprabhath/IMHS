"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HelpCircle,
  Trophy,
  ArrowLeft,
  GraduationCap,
  Layers,
  BookOpen,
} from "lucide-react";
import { CourseAssessmentEditor } from "@/components/admin/CourseAssessmentEditor";
import {
  CourseAssessmentResultsClient,
  type AssessmentResultItem,
} from "@/components/admin/CourseAssessmentResultsClient";

interface CourseAssessmentHubClientProps {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  initialQuestions: Array<{
    id?: string;
    question?: string;
    statement?: string;
    isTrue?: boolean;
    answer?: boolean;
    explanation?: string | null;
  }>;
  initialResults: AssessmentResultItem[];
}

export function CourseAssessmentHubClient({
  courseId,
  courseTitle,
  courseSlug,
  initialQuestions,
  initialResults,
}: CourseAssessmentHubClientProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "results" ? "results" : "questions";
  const [activeTab, setActiveTab] = useState<"questions" | "results">(defaultTab);

  const passedCount = initialResults.filter((r) => r.passed).length;
  const passRate = initialResults.length > 0 ? Math.round((passedCount / initialResults.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 hover:text-[#0E57A4] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Manager</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
              {courseTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-mono text-slate-500">
              Examination &amp; Assessment Management
            </span>
            <span className="text-xs font-mono text-slate-300">·</span>
            <Link
              href={`/admin/courses/${courseId}/edit`}
              className="text-xs font-mono text-[#0E57A4] hover:underline font-semibold"
            >
              Open Syllabus Builder →
            </Link>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "questions"
                ? "bg-white text-[#0E57A4] shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Question Bank</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === "questions" ? "bg-blue-50 text-[#0E57A4]" : "bg-slate-200 text-slate-700"
            }`}>
              {initialQuestions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "results"
                ? "bg-white text-[#0E57A4] shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Student Exam Results</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === "results" ? "bg-amber-50 text-amber-800" : "bg-slate-200 text-slate-700"
            }`}>
              {initialResults.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Question Bank Editor */}
      {activeTab === "questions" && (
        <CourseAssessmentEditor
          courseId={courseId}
          courseTitle={courseTitle}
          initialQuestions={initialQuestions}
        />
      )}

      {/* Tab 2: Student Exam Results */}
      {activeTab === "results" && (
        <CourseAssessmentResultsClient
          courseId={courseId}
          courseTitle={courseTitle}
          initialResults={initialResults}
        />
      )}
    </div>
  );
}
