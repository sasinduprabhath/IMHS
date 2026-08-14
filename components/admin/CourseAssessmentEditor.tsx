"use client";

import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList, Plus, Trash2, Save, ArrowLeft, Check, AlertCircle,
  Sparkles, FileUp, Download, Info, Search, Filter, ChevronLeft, ChevronRight,
  Layers, CheckCircle2, XCircle
} from "lucide-react";
import { saveCourseAssessmentQuestions, type CourseQuestionInput } from "@/actions/assessment-actions";
import { MODULE_QUESTIONS } from "@/data/moduleQuestions";

interface CourseAssessmentEditorProps {
  courseId: string;
  courseTitle: string;
  initialQuestions: Array<{
    id?: string;
    question?: string;
    statement?: string;
    isTrue?: boolean;
    answer?: boolean;
    explanation?: string | null;
  }>;
}

const MAX_QUESTIONS = 100;

export function CourseAssessmentEditor({
  courseId,
  courseTitle,
  initialQuestions,
}: CourseAssessmentEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<CourseQuestionInput[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.slice(0, MAX_QUESTIONS).map((q) => ({
        id: q.id,
        question: q.question || q.statement || "",
        isTrue: q.isTrue ?? q.answer ?? true,
        explanation: q.explanation || "",
      }));
    }
    return [];
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // ── Pagination & Filter State ──────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "true" | "false">("all");

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) {
      setError(`Maximum question limit reached (${MAX_QUESTIONS} questions).`);
      return;
    }
    setError(null);
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        isTrue: true,
        explanation: "",
      },
    ]);
    // Automatically switch to the last page where the new question is added
    setTimeout(() => {
      const newTotal = questions.length + 1;
      const lastPage = Math.ceil(newTotal / pageSize) || 1;
      setCurrentPage(lastPage);
    }, 50);
  };

  const removeQuestion = (originalIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== originalIndex));
  };

  const updateQuestion = (originalIndex: number, field: keyof CourseQuestionInput, value: any) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[originalIndex] = { ...next[originalIndex], [field]: value };
      return next;
    });
  };

  const populateSeedQuestions = () => {
    const seeds: CourseQuestionInput[] = MODULE_QUESTIONS.slice(0, MAX_QUESTIONS).map((q) => ({
      question: q.statement,
      isTrue: q.answer,
      explanation: q.explanation || "",
    }));
    setQuestions(seeds);
    setCurrentPage(1);
  };

  const clearAllQuestions = () => {
    if (confirm("Are you sure you want to clear all questions for this course?")) {
      setQuestions([]);
      setCurrentPage(1);
    }
  };

  // ── CSV Parsing & Import ───────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setImportNotice(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
          setError("The uploaded CSV file is empty.");
          return;
        }

        const parsedRows: string[][] = [];
        for (const line of lines) {
          const row: string[] = [];
          let inQuotes = false;
          let currentVal = "";
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              row.push(currentVal.trim().replace(/^["']|["']$/g, ""));
              currentVal = "";
            } else {
              currentVal += char;
            }
          }
          row.push(currentVal.trim().replace(/^["']|["']$/g, ""));
          parsedRows.push(row);
        }

        if (parsedRows.length === 0) {
          setError("Failed to parse CSV rows.");
          return;
        }

        const headerStr = parsedRows[0].join(" ").toLowerCase();
        const hasHeader =
          headerStr.includes("statement") ||
          headerStr.includes("question") ||
          headerStr.includes("istrue") ||
          headerStr.includes("answer");

        const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;

        const parsedQuestions: CourseQuestionInput[] = dataRows
          .map((r) => {
            const statement = r[0] || "";
            const boolRaw = (r[1] || "true").toLowerCase().trim();
            const isTrue = ["true", "1", "yes", "t", "y"].includes(boolRaw);
            const explanation = r[2] || "";
            return { question: statement, isTrue, explanation };
          })
          .filter((q) => q.question.trim().length > 0);

        if (parsedQuestions.length === 0) {
          setError("No valid questions found in CSV file.");
          return;
        }

        const availableSlots = MAX_QUESTIONS - questions.length;
        if (availableSlots <= 0) {
          setError(`Cannot import: Course already has maximum ${MAX_QUESTIONS} questions.`);
          return;
        }

        const toAdd = parsedQuestions.slice(0, availableSlots);
        setQuestions((prev) => [...prev, ...toAdd]);

        if (parsedQuestions.length > availableSlots) {
          setImportNotice(
            `Imported ${toAdd.length} questions. ${parsedQuestions.length - availableSlots} questions omitted to remain within the ${MAX_QUESTIONS} questions limit.`
          );
        } else {
          setImportNotice(`Successfully imported ${toAdd.length} questions from CSV!`);
        }
        setCurrentPage(1);
      } catch (err: any) {
        console.error("CSV Import error:", err);
        setError("Failed to read CSV file: " + (err.message || ""));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // ── Download Sample CSV Template ──────────────────────────────────────────
  const downloadSampleCSV = () => {
    const csvContent =
      `statement,isTrue,explanation\n` +
      `"Amlodipine is classified as a Calcium Channel Blocker.",TRUE,"Amlodipine belongs to the dihydropyridine subclass of CCBs."\n` +
      `"Metformin is contraindicated in severe renal impairment.",TRUE,"Metformin can increase the risk of lactic acidosis in kidney impairment."\n` +
      `"Atorvastatin should be taken with high-fat meals for absorption.",FALSE,"Atorvastatin can be taken with or without food at any time of day."\n` +
      `"Amoxicillin is a broad-spectrum aminopenicillin antibiotic.",TRUE,"Amoxicillin covers Gram-positive and select Gram-negative organisms."\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `course_assessment_sample_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Save Questions ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (questions.length === 0) {
      setError("Please add at least 1 question to the assessment.");
      return;
    }

    if (questions.length > MAX_QUESTIONS) {
      setError(`Course assessment cannot exceed ${MAX_QUESTIONS} questions.`);
      return;
    }

    const invalid = questions.some((q) => !q.question.trim());
    if (invalid) {
      setError("Please fill in all question statements before saving.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await saveCourseAssessmentQuestions(courseId, questions.slice(0, MAX_QUESTIONS));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save assessment questions.");
    } finally {
      setSaving(false);
    }
  };

  // ── Filter & Pagination Computation ────────────────────────────────────────
  const filteredWithOriginalIndex = useMemo(() => {
    return questions
      .map((q, originalIndex) => ({ q, originalIndex }))
      .filter(({ q }) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchQ = q.question.toLowerCase().includes(query);
          const matchExp = (q.explanation || "").toLowerCase().includes(query);
          if (!matchQ && !matchExp) return false;
        }
        if (filterType === "true" && !q.isTrue) return false;
        if (filterType === "false" && q.isTrue) return false;
        return true;
      });
  }, [questions, searchQuery, filterType]);

  const totalFiltered = filteredWithOriginalIndex.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredWithOriginalIndex.slice(start, start + pageSize);
  }, [filteredWithOriginalIndex, safePage, pageSize]);

  const trueCount = useMemo(() => questions.filter((q) => q.isTrue).length, [questions]);
  const falseCount = useMemo(() => questions.filter((q) => !q.isTrue).length, [questions]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#0E57A4] to-[#1D4ED8] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/courses")}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition border border-white/20"
              aria-label="Back to courses"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Course Question Bank Editor
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-0.5 rounded-full border ${
                  questions.length >= MAX_QUESTIONS
                    ? "bg-red-950/60 text-red-300 border-red-500/30"
                    : "bg-white/10 text-white border-white/20"
                }`}>
                  {questions.length} / {MAX_QUESTIONS} Questions Assigned
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                {courseTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleSave}
              disabled={saving || questions.length === 0}
              className="px-6 py-3 rounded-2xl bg-white text-[#0E57A4] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <span>Saving...</span>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#0E57A4]" /> Save All {questions.length} Questions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
              title="Download CSV template format"
            >
              <Download className="w-4 h-4 text-amber-300" /> Sample CSV
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={questions.length >= MAX_QUESTIONS}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              <FileUp className="w-4 h-4" /> Import CSV / Excel
            </button>

            {questions.length === 0 && (
              <button
                onClick={populateSeedQuestions}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" /> Auto-Load Seed Pool
              </button>
            )}

            <button
              onClick={addQuestion}
              disabled={questions.length >= MAX_QUESTIONS}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 border border-white/20"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {questions.length > 0 && (
            <button
              onClick={clearAllQuestions}
              className="text-xs font-mono text-red-300 hover:text-red-100 hover:underline px-2 py-1"
            >
              Clear All Questions
            </button>
          )}
        </div>
      </div>

      {/* Notifications & Import Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {importNotice && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 font-medium">
          <Info className="w-4 h-4 shrink-0 text-blue-600" />
          <span>{importNotice}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Course assessment questions updated successfully! ({questions.length} saved to database)</span>
        </div>
      )}

      {/* Search, Filter & Page Size Bar */}
      {questions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search statements or rationale..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#0E57A4] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#0E57A4]" /> Filter:
              </span>
              <button
                onClick={() => { setFilterType("all"); setCurrentPage(1); }}
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition ${
                  filterType === "all"
                    ? "bg-[#0E57A4] text-white border-[#0E57A4]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => { setFilterType("true"); setCurrentPage(1); }}
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition ${
                  filterType === "true"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                TRUE ({trueCount})
              </button>
              <button
                onClick={() => { setFilterType("false"); setCurrentPage(1); }}
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition ${
                  filterType === "false"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-red-700 border-slate-200 hover:bg-red-50"
                }`}
              >
                FALSE ({falseCount})
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-500">Per page:</span>
              {[10, 20, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition ${
                    pageSize === size
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-display font-bold text-slate-800">No Assessment Questions Assigned</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Upload a CSV file or add up to {MAX_QUESTIONS} True/False questions. Students will unlock this assessment after completing all course lessons.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
              >
                <FileUp className="w-4 h-4" /> Import CSV / Excel File
              </button>
              <button
                onClick={populateSeedQuestions}
                className="px-5 py-2.5 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Load Default Question Pool
              </button>
              <button
                onClick={addQuestion}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Add First Question
              </button>
            </div>
          </div>
        ) : totalFiltered === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No questions match your filter query.</p>
            <button
              onClick={() => { setSearchQuery(""); setFilterType("all"); }}
              className="text-xs font-mono text-[#0E57A4] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          paginatedQuestions.map(({ q, originalIndex }) => (
            <div
              key={originalIndex}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs hover:shadow-xs hover:border-[#0E57A4]/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0E57A4] bg-[#EBF3FA] px-2.5 py-0.5 rounded-md border border-[#0E57A4]/20">
                    Question #{originalIndex + 1}
                  </span>
                  {originalIndex >= MAX_QUESTIONS && (
                    <span className="text-[9px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-bold">
                      Exceeds 100 limit
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* True / False Select */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateQuestion(originalIndex, "isTrue", true)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                        q.isTrue
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuestion(originalIndex, "isTrue", false)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                        !q.isTrue
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> FALSE
                    </button>
                  </div>

                  <button
                    onClick={() => removeQuestion(originalIndex)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    aria-label="Remove question"
                    title="Delete this question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statement input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-500">
                  Question Statement
                </label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(originalIndex, "question", e.target.value)}
                  placeholder="Enter True/False question statement..."
                  className="w-full text-xs font-sans text-slate-800 p-3 rounded-xl border border-slate-200 focus:border-[#0E57A4] focus:ring-1 focus:ring-[#0E57A4] outline-none min-h-[60px]"
                />
              </div>

              {/* Explanation input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-500">
                  Clinical Rationale Explanation (Shown to students after exam submission)
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(originalIndex, "explanation", e.target.value)}
                  placeholder="e.g. Amlodipine is a dihydropyridine calcium channel blocker used for hypertension..."
                  className="w-full text-xs font-sans text-slate-700 p-2.5 rounded-xl border border-slate-200 focus:border-[#0E57A4] focus:ring-1 focus:ring-[#0E57A4] outline-none"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer Controls */}
      {totalFiltered > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-900">{(safePage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-slate-900">{Math.min(safePage * pageSize, totalFiltered)}</strong> of{" "}
            <strong className="text-slate-900">{totalFiltered}</strong> questions
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold border transition ${
                    safePage === pNum
                      ? "bg-[#0E57A4] text-white border-[#0E57A4] shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
