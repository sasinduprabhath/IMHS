"use client";

import React, { useState } from "react";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  MessageCircle,
  CheckCircle2,
  Clock,
  Check,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  Sparkles,
  Eye,
  Copy,
} from "lucide-react";

interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  courseInterest?: string | null;
  message: string;
  createdAt: string | Date;
  resolved: boolean;
}

const ITEMS_PER_PAGE = 20;

export function AdminInquiriesClient({ initialInquiries }: { initialInquiries: InquiryItem[] }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Full inquiry view modal & inline expansion state
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedInquiry(null);
    };
    if (selectedInquiry) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedInquiry]);

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyMessage = async (msg: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2500);
    } catch {}
  };

  const filtered = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      inq.name.toLowerCase().includes(q) ||
      (inq.email && inq.email.toLowerCase().includes(q)) ||
      inq.phone.includes(q) ||
      (inq.courseInterest && inq.courseInterest.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && !inq.resolved) ||
      (statusFilter === "RESOLVED" && inq.resolved);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedInquiries = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleToggleResolved = async (inquiryId: string, currentResolved: boolean) => {
    setTogglingId(inquiryId);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !currentResolved }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? { ...i, resolved: !currentResolved } : i))
        );
        setSelectedInquiry((prev) =>
          prev && prev.id === inquiryId ? { ...prev, resolved: !currentResolved } : prev
        );
      } else {
        alert("Failed to update inquiry status.");
      }
    } catch {
      alert("Error updating inquiry status.");
    } finally {
      setTogglingId(null);
    }
  };

  const pendingCount = inquiries.filter((i) => !i.resolved).length;
  const resolvedCount = inquiries.filter((i) => i.resolved).length;

  return (
    <div className="space-y-6 max-w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-[#F16726] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest inline-block">
            Student Admissions &amp; Leads
          </span>
          <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
            Contact Form Submissions &amp; Inquiries
          </h1>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Review prospective student inquiry submissions, manage follow-up status, and dispatch instant WhatsApp messages.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-rose-600" /> {pendingCount} Pending Action
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {resolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, phone, email, or message..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[40px] font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: `All (${filtered.length})` },
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "RESOLVED", label: `Resolved (${resolvedCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setStatusFilter(f.id as any);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap min-h-[36px] ${
                statusFilter === f.id
                  ? "bg-[#0E57A4] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Inquiries List Container ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* 📱 Mobile Card View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedInquiries.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-mono space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs">No contact inquiries matched your filter query.</div>
            </div>
          ) : (
            paginatedInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0E57A4] shrink-0" />
                      {inq.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Received: {new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div>
                    {inq.resolved ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                        <Clock className="w-3 h-3 text-rose-600" /> Action Needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1 text-xs font-mono">
                  {inq.email && <div className="truncate text-slate-800 font-sans font-medium">{inq.email}</div>}
                  <div className="text-[#0E57A4] font-bold">{inq.phone}</div>
                  {inq.courseInterest && (
                    <div className="text-[11px] text-slate-500 font-bold uppercase pt-1 border-t border-slate-200/60">
                      Interest: {inq.courseInterest}
                    </div>
                  )}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <p
                    className={`text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap break-words ${
                      !expandedIds.has(inq.id) && inq.message.length > 90 ? "line-clamp-3" : ""
                    }`}
                  >
                    &ldquo;{inq.message}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    {inq.message.length > 90 ? (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(inq.id, e)}
                        className="font-semibold text-[#0E57A4] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        {expandedIds.has(inq.id) ? (
                          <>
                            Show less <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(inq)}
                      className="font-medium text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#0E57A4]" /> Full View
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedInquiry(inq)}
                      className="h-8 px-2.5 text-[11px] gap-1 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#0E57A4]" /> View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={togglingId === inq.id}
                      onClick={() => handleToggleResolved(inq.id, inq.resolved)}
                      className={`h-8 px-3 text-[11px] gap-1 font-semibold ${
                        inq.resolved
                          ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "bg-white border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {inq.resolved ? "Mark Pending" : "Mark Resolved"}
                    </Button>
                  </div>

                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(inq.phone)}?text=${encodeURIComponent(`Hi ${inq.name}, thank you for contacting IMHS! Regarding your inquiry about ${inq.courseInterest || 'courses'}...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="h-8 px-3 text-[11px] gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs">
                      <MessageCircle className="w-3.5 h-3.5 fill-current" /> WhatsApp Reply
                    </Button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 💻 Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase font-mono text-[10px]">
                <th className="p-4 pl-6">Candidate &amp; Received Date</th>
                <th className="p-4">Contact Info &amp; Interest</th>
                <th className="p-4">Inquiry Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-mono space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                    <div>No contact inquiries matched your filter query.</div>
                  </td>
                </tr>
              ) : (
                paginatedInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-slate-50/70 transition-all duration-150 group"
                  >
                    <td className="p-4 pl-6 align-top">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#0E57A4] shrink-0" />
                        {inq.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td className="p-4 font-mono align-top">
                      {inq.email && <div className="text-slate-800 font-sans font-medium text-xs truncate max-w-[200px]">{inq.email}</div>}
                      <div className="text-[#0E57A4] font-bold text-xs">{inq.phone}</div>
                      {inq.courseInterest && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold bg-blue-50 text-[#0E57A4] border border-blue-200 px-2 py-0.5 rounded-full">
                          {inq.courseInterest}
                        </span>
                      )}
                    </td>

                    <td className="p-4 max-w-md min-w-[260px] align-top">
                      <div className="space-y-1.5">
                        <p
                          className={`text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap break-words ${
                            !expandedIds.has(inq.id) && inq.message.length > 90
                              ? "line-clamp-3"
                              : ""
                          }`}
                        >
                          &ldquo;{inq.message}&rdquo;
                        </p>

                        <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                          {inq.message.length > 90 && (
                            <button
                              type="button"
                              onClick={(e) => toggleExpand(inq.id, e)}
                              className="font-semibold text-[#0E57A4] hover:text-[#0a3f77] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              {expandedIds.has(inq.id) ? (
                                <>
                                  Show less <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedInquiry(inq)}
                            className="font-medium text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#0E57A4]" /> Full View
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      {inq.resolved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <Clock className="w-3 h-3 text-rose-600" /> Action Needed
                        </span>
                      )}
                    </td>

                    <td className="p-4 pr-6 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedInquiry(inq)}
                          className="h-7 px-2 text-[11px] gap-1 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          title="View complete inquiry & applicant details"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#0E57A4]" /> View
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={togglingId === inq.id}
                          onClick={() => handleToggleResolved(inq.id, inq.resolved)}
                          className={`h-7 px-2.5 text-[11px] gap-1 font-semibold ${
                            inq.resolved
                              ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              : "bg-white border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {inq.resolved ? "Mark Pending" : "Mark Resolved"}
                        </Button>

                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(inq.phone)}?text=${encodeURIComponent(`Hi ${inq.name}, thank you for contacting IMHS! Regarding your inquiry about ${inq.courseInterest || 'courses'}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="h-7 px-2.5 text-[11px] gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs">
                            <MessageCircle className="w-3 h-3 fill-current" /> WhatsApp
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Controls ── */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="text-slate-500 text-[11px]">
              Showing <strong className="text-slate-900">{startIndex + 1}</strong> to{" "}
              <strong className="text-slate-900">
                {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
              </strong>{" "}
              of <strong className="text-slate-900">{filtered.length}</strong> inquiries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="h-8 w-8 p-0"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs shadow-2xs">
                Page {validPage} of {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Inquiry Detail Modal ── */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedInquiry(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-[#F16726] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest inline-block">
                    Inquiry Details
                  </span>
                  {selectedInquiry.resolved ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                      <Clock className="w-3 h-3 text-rose-600" /> Action Needed
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#0E57A4] shrink-0" />
                  {selectedInquiry.name}
                </h2>
                <div className="text-[11px] font-mono text-slate-500">
                  Received: {new Date(selectedInquiry.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs font-sans">
              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0E57A4]" /> Phone Number
                  </div>
                  <div className="text-sm font-bold text-[#0E57A4] font-mono">
                    {selectedInquiry.phone}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Direct phone / WhatsApp contact
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#0E57A4]" /> Email Address
                  </div>
                  {selectedInquiry.email ? (
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="text-xs font-semibold text-slate-800 hover:text-[#0E57A4] hover:underline block truncate"
                    >
                      {selectedInquiry.email}
                    </a>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Not provided</div>
                  )}
                  <div className="text-[11px] text-slate-500">
                    Candidate email correspondence
                  </div>
                </div>

                {selectedInquiry.courseInterest && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1 sm:col-span-2">
                    <div className="text-[10px] font-mono uppercase font-bold text-[#0E57A4] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0E57A4]" /> Course of Interest / Program
                    </div>
                    <div className="text-xs font-bold text-slate-900 font-mono">
                      {selectedInquiry.courseInterest}
                    </div>
                  </div>
                )}
              </div>

              {/* Inquiry Message Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-600 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0E57A4]" /> Complete Inquiry Message
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyMessage(selectedInquiry.message, selectedInquiry.id, e)}
                    className="text-[11px] font-mono font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessageId === selectedInquiry.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 select-text">
                  <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap break-words">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={togglingId === selectedInquiry.id}
                onClick={() => handleToggleResolved(selectedInquiry.id, selectedInquiry.resolved)}
                className={`h-9 px-3.5 text-xs font-semibold ${
                  selectedInquiry.resolved
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    : "bg-white border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {selectedInquiry.resolved ? "Mark as Pending" : "Mark as Resolved"}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedInquiry(null)}
                  className="h-9 px-3.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                >
                  Close
                </Button>

                <a
                  href={`https://wa.me/${formatPhoneForWhatsApp(selectedInquiry.phone)}?text=${encodeURIComponent(
                    `Hi ${selectedInquiry.name}, thank you for contacting IMHS! Regarding your inquiry about ${
                      selectedInquiry.courseInterest || "courses"
                    }...`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto h-9 px-4 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" /> WhatsApp Reply
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
