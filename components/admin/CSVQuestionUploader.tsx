"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface ParsedQuestion {
  moduleCode: string;
  question: string;
  isTrue: boolean;
  explanation?: string;
}

export function CSVQuestionUploader({ onImportComplete }: { onImportComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setSuccessCount(null);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: any[] = results.data;
          const questions: ParsedQuestion[] = rows
            .map((row, index) => {
              const code = row.moduleCode || row.module_code || row.module || "GEN-101";
              const qText = row.question || row.statement || row.questionText || "";
              const isT = String(row.isTrue || row.answer || row.is_true).toLowerCase() === "true" || String(row.isTrue) === "1";
              const exp = row.explanation || row.reason || undefined;

              if (!qText.trim()) return null;
              return {
                moduleCode: String(code).trim(),
                question: String(qText).trim(),
                isTrue: isT,
                explanation: exp ? String(exp).trim() : undefined,
              };
            })
            .filter(Boolean) as ParsedQuestion[];

          if (questions.length === 0) {
            setError("No valid questions found in CSV. Required headers: moduleCode, question, isTrue, explanation");
          } else {
            setParsed(questions);
          }
        } catch (err: any) {
          setError("Failed to parse CSV file: " + err.message);
        }
      },
      error: (err) => {
        setError("CSV Parse Error: " + err.message);
      },
    });
  };

  const handleUpload = async () => {
    if (parsed.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/learning-hub/import-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: parsed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessCount(data.count);
        setParsed([]);
        setFile(null);
        onImportComplete?.();
      } else {
        setError(data.error || "Failed to import questions");
      }
    } catch (err: any) {
      setError("Import error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0E57A4]" />
            Bulk CSV / Excel Question Import
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload 100+ True/False assessment questions at once using CSV format.
          </p>
        </div>
        <a
          href="data:text/csv;charset=utf-8,moduleCode,question,isTrue,explanation%0APARM-101,Amlodipine is a calcium channel blocker,true,Amlodipine belongs to CCB class.%0APARM-101,Amoxicillin is effective against viral cold,false,Antibiotics do not work against viruses."
          download="imhs_questions_template.csv"
          className="text-xs font-mono font-bold text-[#0E57A4] hover:underline"
        >
          📥 Download Template CSV
        </a>
      </div>

      {/* File Drop Area */}
      <div className="relative border-2 border-dashed border-slate-200 hover:border-[#0E57A4]/50 rounded-2xl p-6 text-center transition-colors bg-slate-50">
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="space-y-2 pointer-events-none">
          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">
            {file ? file.name : "Click or Drag & Drop CSV file here"}
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Supported format: CSV with headers (moduleCode, question, isTrue, explanation)
          </p>
        </div>
      </div>

      {/* Feedback & Preview */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-bold font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      {successCount !== null && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-bold font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Successfully imported {successCount} assessment questions into the question bank!
        </div>
      )}

      {parsed.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-900">
              Ready to Import ({parsed.length} Questions)
            </span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2 rounded-xl bg-[#0E57A4] hover:bg-[#0A4482] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Importing...
                </>
              ) : (
                <>Upload {parsed.length} Questions</>
              )}
            </button>
          </div>

          <div className="max-h-60 overflow-auto border border-slate-200 rounded-xl text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 sticky top-0 font-mono text-[10px] text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Module</th>
                  <th className="p-2.5">Question</th>
                  <th className="p-2.5">Answer</th>
                  <th className="p-2.5">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsed.slice(0, 50).map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-mono font-bold text-[#0E57A4]">{q.moduleCode}</td>
                    <td className="p-2.5 max-w-xs truncate text-slate-800 font-medium">{q.question}</td>
                    <td className="p-2.5 font-bold font-mono">
                      <span className={q.isTrue ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]" : "text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px]"}>
                        {q.isTrue ? "TRUE" : "FALSE"}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 truncate max-w-xs">{q.explanation || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 50 && (
              <div className="p-2 bg-slate-50 text-center text-[10px] font-mono text-slate-500 border-t border-slate-100">
                Showing first 50 of {parsed.length} questions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
