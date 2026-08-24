"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "-- Select an option --",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index on search change or open
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      scrollHighlightedIntoView(highlightedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      scrollHighlightedIntoView(highlightedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
        setSearch("");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearch("");
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`} onKeyDown={handleKeyDown}>
      {/* Select trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-0 px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-xs text-ink flex items-center justify-between gap-2 focus:outline-none focus:border-clinical-teal hover:border-clinical-teal/50 transition-all disabled:opacity-50 text-left shadow-xs cursor-pointer"
      >
        <span className="truncate flex-1 font-sans">
          {selectedOption ? selectedOption.label : <span className="text-sage">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-sage shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-clinical-teal" : ""
          }`}
        />
      </button>

      {/* Popover options list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            data-lenis-prevent="true"
            className="absolute left-0 top-full z-50 mt-1 bg-surface border border-chart-grid rounded-2xl shadow-2xl overflow-hidden min-w-full w-full max-w-[calc(100vw-2rem)]"
          >
            {/* Search filter if > 5 options */}
            {options.length > 5 && (
              <div className="p-2.5 border-b border-chart-grid bg-slate-50/80 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${options.length} options...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0E57A4] font-sans shadow-xs"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div
              ref={listRef}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain touch-pan-y divide-y divide-chart-grid/30 py-1 font-sans text-xs [scrollbar-width:thin]"
            >
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-mono text-[11px]">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-clinical-teal/15 text-clinical-teal font-bold"
                          : isHighlighted
                          ? "bg-slate-100/80 text-slate-900"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <span className="truncate flex-1 font-medium">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-clinical-teal shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
