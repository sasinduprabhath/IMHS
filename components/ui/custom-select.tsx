"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      {/* Select trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-0 px-3.5 py-2.5 bg-white border border-chart-grid rounded-input text-xs text-ink flex items-center justify-between gap-2 focus:outline-none focus:border-clinical-teal hover:border-clinical-teal/50 transition-all disabled:opacity-50 text-left shadow-xs"
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
            className="absolute left-0 right-0 top-full z-50 mt-1 bg-surface border border-chart-grid rounded-card shadow-2xl overflow-hidden w-full max-w-full"
          >
            {/* Search filter if > 5 options */}
            {options.length > 5 && (
              <div className="p-2 border-b border-chart-grid bg-linen/50 relative">
                <Search className="w-3.5 h-3.5 text-sage absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Search option..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-chart-grid rounded text-xs text-ink focus:outline-none focus:border-clinical-teal font-sans"
                  autoFocus
                />
              </div>
            )}

            <div className="max-h-56 overflow-y-auto divide-y divide-chart-grid/30 py-1 font-sans text-xs">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-sage font-mono text-[11px]">
                  No matching options found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? "bg-clinical-teal/10 text-clinical-teal font-semibold"
                          : "hover:bg-linen/60 text-ink"
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
