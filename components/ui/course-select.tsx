"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug?: string;
}

interface CourseSelectProps {
  courses: Course[];
  value: string;
  onChange: (courseId: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function CourseSelect({
  courses,
  value,
  onChange,
  placeholder = "Select Target Course...",
  className = "",
}: CourseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCourse = courses.find((c) => c.id === value);

  const cleanTitle = (raw: string) =>
    raw
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\/g, "")
      .trim();

  const filteredCourses = courses.filter((c) =>
    cleanTitle(c.title).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs flex items-center justify-between gap-2 text-left font-medium outline-none transition-all shadow-xs",
          isOpen ? "border-[#0E57A4] ring-2 ring-[#0E57A4]/15 bg-white" : "hover:border-[#0E57A4]/50",
          !selectedCourse && "text-slate-400"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookOpen className="w-4 h-4 text-[#0E57A4] shrink-0" />
          <span className="truncate text-slate-900 font-semibold">
            {selectedCourse ? cleanTitle(selectedCourse.title) : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-[#0E57A4]"
          )}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[120] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Filter courses by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#0E57A4] text-slate-900 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Courses List Container */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredCourses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-mono">
                No courses match your search.
              </div>
            ) : (
              filteredCourses.map((c) => {
                const title = cleanTitle(c.title);
                const isSelected = c.id === value;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-3 group",
                      isSelected
                        ? "bg-[#0E57A4] text-white font-bold shadow-xs"
                        : "hover:bg-[#0E57A4]/8 text-slate-800 hover:text-[#0E57A4]"
                    )}
                  >
                    <span className="truncate flex-1 leading-snug">{title}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
