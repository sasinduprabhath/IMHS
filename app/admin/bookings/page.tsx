"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Video,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorshipPackagesManager } from "@/components/admin/MentorshipPackagesManager";

interface Booking {
  id: string;
  bookingCode: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  sessionType: string;
  durationMins: number;
  priceLkr?: number;
  bookingDate: string;
  timeSlot: string;
  topicNotes?: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  meetingLink?: string;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"appointments" | "packages">("appointments");

  // Edit Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editMeetingLink, setEditMeetingLink] = useState<string>("");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      fetchBookings();
    }
  }, [authStatus, router]);

  const handleOpenEdit = (b: Booking) => {
    setSelectedBooking(b);
    setEditStatus(b.status);
    setEditMeetingLink(b.meetingLink || "");
    setEditAdminNotes(b.adminNotes || "");
    setActionSuccessMsg("");
  };

  const handleSaveUpdate = async () => {
    if (!selectedBooking) return;
    setUpdating(true);
    setActionSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          meetingLink: editMeetingLink,
          adminNotes: editAdminNotes,
        }),
      });

      if (res.ok) {
        setActionSuccessMsg("Booking updated successfully!");
        fetchBookings();
        setTimeout(() => {
          setSelectedBooking(null);
          setActionSuccessMsg("");
        }, 1200);
      }
    } catch (e) {
      console.error("Failed to update booking:", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBookings();
      }
    } catch (e) {
      console.error("Failed to delete booking:", e);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CONFIRMED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-slate-500" /> COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
            <AlertCircle className="w-3 h-3 text-amber-600" /> PENDING ACTION
          </span>
        );
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-4 max-w-full">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl" />
        <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-[#0E57A4] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest inline-block">
            Faculty Appointments Management
          </span>
          <h1 className="text-xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
            Dr. Isuru 1-on-1 Consultation Appointments
          </h1>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Review student clinical mentoring sessions, assign Google Meet video conference links, and dispatch confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-2xs transition-all min-h-[38px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 -mb-px ${
            activeTab === "appointments"
              ? "border-[#0E57A4] text-[#0E57A4]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Appointments &amp; Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 -mb-px ${
            activeTab === "packages"
              ? "border-[#0E57A4] text-[#0E57A4]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Mentorship Packages &amp; Pricing
        </button>
      </div>

      {activeTab === "packages" ? (
        <MentorshipPackagesManager />
      ) : (
        <>
          {/* ── Search & Status Filters ── */}
          <div className="bg-slate-50 border border-slate-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or booking code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4] min-h-[40px] font-sans"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: "ALL", label: `All (${bookings.length})` },
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
            { id: "COMPLETED", label: `Completed (${bookings.filter((b) => b.status === "COMPLETED").length})` },
            { id: "CANCELLED", label: `Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap min-h-[36px] ${
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

      {/* ── Bookings Container ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* 📱 Mobile Card View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredBookings.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-mono space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <div className="text-xs">No consultation bookings matched your criteria.</div>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#0E57A4] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                      {b.bookingCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                      {b.studentName}
                    </h3>
                  </div>

                  <div>{getStatusBadge(b.status)}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1 text-xs font-mono">
                  <div className="text-slate-800 font-sans font-medium">{b.sessionType.replace(/_/g, " ")} ({b.durationMins} Mins)</div>
                  <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(b.bookingDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} at {b.timeSlot}
                    </span>
                  </div>
                  <div className="text-[#0E57A4] font-bold">{b.studentPhone}</div>
                </div>

                {/* Meeting Link Preview */}
                {b.meetingLink ? (
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center gap-1.5 font-mono font-semibold"
                  >
                    <Video className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{b.meetingLink}</span>
                  </a>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                    No Video Link Assigned
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0E57A4] hover:bg-blue-100 text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit / Assign Link
                    </button>
                  </div>

                  {b.studentPhone && (
                    <a
                      href={`https://wa.me/${b.studentPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${b.studentName}, your 1-on-1 Consultation session with Dr. Isuru Wijesinghe has been ${b.status} for ${new Date(b.bookingDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${b.timeSlot}.\n\nReference Code: ${b.bookingCode}${b.meetingLink ? `\nGoogle Meet Video Link: ${b.meetingLink}` : ""}\n\nThank you, IMHS Administration.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="h-8 px-3 text-[11px] gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs">
                        <MessageSquare className="w-3.5 h-3.5 fill-current" /> WhatsApp
                      </Button>
                    </a>
                  )}
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
                <th className="p-4 pl-6">Ref Code</th>
                <th className="p-4">Student &amp; Contact</th>
                <th className="p-4">Session Type</th>
                <th className="p-4">Date &amp; Time Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4">Meeting Link</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono">
                    No consultation bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-all duration-150 group">
                    <td className="p-4 pl-6 font-mono font-bold text-[#0E57A4]">
                      {b.bookingCode}
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-900">{b.studentName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3" /> {b.studentEmail}
                      </div>
                      <div className="text-[11px] text-[#0E57A4] font-bold flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" /> {b.studentPhone}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {b.sessionType.replace(/_/g, " ")}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span>{b.durationMins} Mins</span>
                        <span className="font-bold text-[#0E57A4] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {b.priceLkr ? `LKR ${b.priceLkr.toLocaleString()}` : "Included"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5 font-mono text-slate-900">
                      <div className="font-bold">
                        {new Date(b.bookingDate).toLocaleDateString("en-GB", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[#0E57A4] text-[11px] font-semibold">{b.timeSlot}</div>
                    </td>

                    <td className="p-4">{getStatusBadge(b.status)}</td>

                    <td className="p-4 font-mono text-[11px]">
                      {b.meetingLink ? (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0E57A4] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Video className="w-3.5 h-3.5 text-rose-600" /> Meet Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="p-4 pr-6 text-right space-x-1.5">
                      {/* WhatsApp Notify Button */}
                      {b.studentPhone && (
                        <a
                          href={`https://wa.me/${b.studentPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${b.studentName}, your 1-on-1 Consultation session with Dr. Isuru Wijesinghe has been ${b.status} for ${new Date(b.bookingDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${b.timeSlot}.\n\nReference Code: ${b.bookingCode}${b.meetingLink ? `\nGoogle Meet Video Link: ${b.meetingLink}` : ""}\n\nThank you, IMHS Administration.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1 transition-colors shadow-2xs"
                          title="Send WhatsApp Confirmation Notice"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-2 text-slate-700 hover:text-[#0E57A4] bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
                        title="Manage / Add Link"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT & ASSIGN LINK MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="font-mono text-xs text-[#0E57A4] font-bold uppercase">
                Manage Appointment
              </span>
              <h3 className="text-lg font-display font-bold text-slate-900 mt-0.5">
                {selectedBooking.bookingCode} - {selectedBooking.studentName}
              </h3>
            </div>

            {actionSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs font-semibold">
                {actionSuccessMsg}
              </div>
            )}

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono font-bold text-slate-700">Booking Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-bold text-slate-700">
                  Google Meet / Zoom Video Link:
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={editMeetingLink}
                  onChange={(e) => setEditMeetingLink(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-bold text-slate-700">Admin Internal Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Add notes for Dr. Isuru or office reference..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0E57A4]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-mono text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={updating}
                className="px-5 py-2 text-xs font-mono font-bold text-white bg-[#0E57A4] rounded-xl shadow-sm hover:bg-[#0A4482] transition-colors"
              >
                {updating ? "Saving Changes..." : "Save Appointment Updates"}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
