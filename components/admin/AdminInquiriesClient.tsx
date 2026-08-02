"use client";

import React, { useState } from "react";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Search, MessageCircle, CheckCircle2,
  Clock, Check, X, Filter, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Mail, Phone, User
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
    <div className="space-y-6">
      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-chart-grid pb-5">
        <div>
          <span className="font-mono text-xs text-chart-red uppercase font-semibold tracking-wider">
            STUDENT ADMISSIONS & LEADS
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink mt-0.5">
            Contact Form Submissions & Inquiries ({inquiries.length})
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Review student inquiry submissions from website contact forms and dispatch instant WhatsApp messages.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="bg-chart-red/10 text-chart-red border border-chart-red/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {pendingCount} Pending Action
          </span>
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {resolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-surface border border-chart-grid rounded-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-paper">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-sage" />
          <input
            type="text"
            placeholder="Search by student name, phone, email, or message content..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-linen/50 border border-chart-grid rounded-input text-xs text-ink focus:outline-none focus:border-clinical-teal focus:bg-white transition-all font-sans"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs font-mono text-sage hidden sm:inline">Status:</span>
          <div className="flex items-center gap-1 bg-linen p-1 rounded-card border border-chart-grid">
            <button
              onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all ${
                statusFilter === "ALL" ? "bg-clinical-teal text-white shadow-xs" : "text-ink hover:text-clinical-teal"
              }`}
            >
              All ({filtered.length})
            </button>
            <button
              onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all ${
                statusFilter === "PENDING" ? "bg-chart-red text-white shadow-xs" : "text-ink hover:text-chart-red"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => { setStatusFilter("RESOLVED"); setCurrentPage(1); }}
              className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all ${
                statusFilter === "RESOLVED" ? "bg-green-600 text-white shadow-xs" : "text-ink hover:text-green-700"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>
      </div>

      {/* ── Inquiries List Container ── */}
      <div className="bg-surface border border-chart-grid rounded-card shadow-paper overflow-hidden">
        
        {/* 📱 Mobile Card View (< md) */}
        <div className="block md:hidden divide-y divide-chart-grid/60">
          {paginatedInquiries.length === 0 ? (
            <div className="p-8 text-center text-sage font-mono space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-sage/50" />
              <div>No contact inquiries matched your filter query.</div>
            </div>
          ) : (
            paginatedInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 space-y-3 hover:bg-clinical-teal/5 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-clinical-teal"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                      {inq.name}
                    </h3>
                    <span className="text-[10px] font-mono text-sage block mt-0.5">
                      Received: {new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div>
                    {inq.resolved ? (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3 text-green-600" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-chart-red/10 text-chart-red border border-chart-red/20 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        <Clock className="w-3 h-3 text-chart-red" /> Action Needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-linen/50 p-2.5 rounded border border-chart-grid/50 space-y-1 text-xs font-mono text-ink-muted">
                  {inq.email && <div className="truncate text-ink font-sans font-medium">{inq.email}</div>}
                  <div className="text-clinical-teal text-[11px]">{inq.phone}</div>
                  {inq.courseInterest && (
                    <div className="text-[11px] text-sage font-bold uppercase pt-1 border-t border-chart-grid/40">
                      Interest: {inq.courseInterest}
                    </div>
                  )}
                </div>

                <p className="text-xs text-ink bg-white p-3 rounded border border-chart-grid/60 leading-relaxed font-sans">
                  &ldquo;{inq.message}&rdquo;
                </p>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-chart-grid/40">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={togglingId === inq.id}
                    onClick={() => handleToggleResolved(inq.id, inq.resolved)}
                    className={`h-8 px-3 text-[11px] gap-1 font-semibold ${
                      inq.resolved
                        ? "bg-white border-chart-grid text-ink-muted hover:bg-linen"
                        : "bg-white border-green-600 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {inq.resolved ? "Mark Pending" : "Mark Resolved"}
                  </Button>

                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(inq.phone)}?text=${encodeURIComponent(`Hi ${inq.name}, thank you for contacting IMHS! Regarding your inquiry about ${inq.courseInterest || 'courses'}...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="danger" className="h-8 px-3 text-[11px] gap-1 font-semibold">
                      <MessageCircle className="w-3.5 h-3.5 fill-current" /> Reply via WhatsApp
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
              <tr className="border-b border-chart-grid bg-linen/50 text-sage uppercase font-mono text-[10px]">
                <th className="p-4">Candidate & Date</th>
                <th className="p-4">Contact & Course Interest</th>
                <th className="p-4">Inquiry Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chart-grid/60">
              {paginatedInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-sage font-mono space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-sage/50" />
                    <div>No contact inquiries matched your filter query.</div>
                  </td>
                </tr>
              ) : (
                paginatedInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-clinical-teal/5 transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-clinical-teal"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-ink text-sm group-hover:text-clinical-teal transition-colors">
                        {inq.name}
                      </div>
                      <span className="text-[10px] font-mono text-sage block mt-0.5">
                        {new Date(inq.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td className="p-4 font-mono">
                      {inq.email && <div className="text-xs text-ink font-sans font-medium">{inq.email}</div>}
                      <div className="text-[11px] text-clinical-teal">{inq.phone}</div>
                      {inq.courseInterest && (
                        <span className="inline-block mt-1 text-[10px] font-mono bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/20 px-1.5 py-0.2 rounded font-semibold truncate max-w-[200px]">
                          {inq.courseInterest}
                        </span>
                      )}
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="text-xs text-ink line-clamp-3 leading-relaxed">
                        &ldquo;{inq.message}&rdquo;
                      </p>
                    </td>

                    <td className="p-4">
                      {inq.resolved ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-green-600" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-chart-red/10 text-chart-red border border-chart-red/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                          <Clock className="w-3 h-3 text-chart-red" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={togglingId === inq.id}
                          onClick={() => handleToggleResolved(inq.id, inq.resolved)}
                          className={`h-7 px-2.5 text-[11px] font-semibold ${
                            inq.resolved
                              ? "bg-white border-chart-grid text-ink-muted hover:bg-linen"
                              : "bg-white border-green-600 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {inq.resolved ? "Mark Pending" : "Mark Resolved"}
                        </Button>

                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(inq.phone)}?text=${encodeURIComponent(`Hi ${inq.name}, thank you for contacting IMHS! Regarding your inquiry about ${inq.courseInterest || 'courses'}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="danger" className="h-7 px-2.5 text-[11px] gap-1 font-semibold">
                            <MessageCircle className="w-3 h-3 fill-current" /> WhatsApp Reply
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
          <div className="p-4 border-t border-chart-grid bg-linen/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="text-sage text-[11px]">
              Showing <strong className="text-ink">{startIndex + 1}</strong> to{" "}
              <strong className="text-ink">
                {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
              </strong>{" "}
              of <strong className="text-ink">{filtered.length}</strong> inquiries
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

              <span className="px-3 py-1 bg-white border border-chart-grid rounded text-ink font-semibold">
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
    </div>
  );
}
