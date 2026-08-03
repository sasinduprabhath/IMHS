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
} from "lucide-react";

interface Booking {
  id: string;
  bookingCode: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  sessionType: string;
  durationMins: number;
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
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-white bg-clinical-teal px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> CONFIRMED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-ink bg-linen border border-chart-grid px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3" /> COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-chart-red bg-chart-red/10 border border-chart-red/30 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-chart-orange bg-chart-orange/10 border border-chart-orange/30 px-2.5 py-0.5 rounded-full animate-pulse">
            <AlertCircle className="w-3 h-3" /> PENDING APPROVAL
          </span>
        );
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-64 bg-linen animate-pulse rounded" />
        <div className="h-64 w-full bg-linen animate-pulse rounded-card" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-chart-grid pb-6">
        <div>
          <span className="font-mono text-xs text-clinical-teal font-bold uppercase tracking-wider">
            FACULTY APPOINTMENTS MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-1">
            Dr. Isuru 1-on-1 Consultation Bookings
          </h1>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 text-xs font-mono text-ink bg-linen border border-chart-grid px-4 py-2 rounded-card hover:bg-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student name, email or ref code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-chart-grid rounded-card pl-9 pr-4 py-2 text-xs text-ink focus:outline-none focus:border-clinical-teal"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all border ${
                statusFilter === st
                  ? "bg-clinical-teal text-white border-clinical-teal shadow-xs"
                  : "bg-surface text-ink-muted border-chart-grid hover:border-clinical-teal/40"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-surface border border-chart-grid rounded-card overflow-hidden shadow-paper">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-linen/60 border-b border-chart-grid font-mono text-ink-muted uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ref Code</th>
                <th className="py-3.5 px-4">Student &amp; Contact</th>
                <th className="py-3.5 px-4">Session Type</th>
                <th className="py-3.5 px-4">Date &amp; Time Slot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Meeting Link</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chart-grid">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted font-mono">
                    No consultation bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-linen/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-clinical-teal">
                      {b.bookingCode}
                    </td>

                    <td className="py-4 px-4 space-y-0.5">
                      <div className="font-bold text-ink">{b.studentName}</div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3" /> {b.studentEmail}
                      </div>
                      <div className="text-[11px] text-ink-muted flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" /> {b.studentPhone}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-ink">
                        {b.sessionType.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] font-mono text-sage">{b.durationMins} Mins</div>
                    </td>

                    <td className="py-4 px-4 space-y-0.5 font-mono text-ink">
                      <div className="font-bold">
                        {new Date(b.bookingDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-clinical-teal text-[11px] font-semibold">{b.timeSlot}</div>
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(b.status)}</td>

                    <td className="py-4 px-4 font-mono text-[11px]">
                      {b.meetingLink ? (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-clinical-teal hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Video className="w-3.5 h-3.5 text-chart-red" /> Meet Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-ink-muted italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-ink hover:text-clinical-teal bg-linen border border-chart-grid rounded hover:border-clinical-teal transition-colors"
                        title="Manage / Add Link"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-1.5 text-ink hover:text-chart-red bg-linen border border-chart-grid rounded hover:border-chart-red transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-chart-grid rounded-card max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="font-mono text-xs text-clinical-teal font-bold uppercase">
                MANAGE APPOINTMENT
              </span>
              <h3 className="text-lg font-display font-bold text-ink mt-0.5">
                {selectedBooking.bookingCode} - {selectedBooking.studentName}
              </h3>
            </div>

            {actionSuccessMsg && (
              <div className="bg-clinical-teal/10 border border-clinical-teal/30 text-clinical-teal p-3 rounded text-xs font-semibold">
                {actionSuccessMsg}
              </div>
            )}

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-mono font-bold text-ink">Booking Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-white border border-chart-grid rounded px-3 py-2 text-ink font-mono focus:outline-none focus:border-clinical-teal"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-bold text-ink">
                  Google Meet / Zoom Video Link:
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-def"
                  value={editMeetingLink}
                  onChange={(e) => setEditMeetingLink(e.target.value)}
                  className="w-full bg-white border border-chart-grid rounded px-3 py-2 text-ink font-mono focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono font-bold text-ink">Admin Internal Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Add notes for Dr. Isuru or office reference..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  className="w-full bg-white border border-chart-grid rounded px-3 py-2 text-ink focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-chart-grid flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-mono text-ink bg-linen rounded border border-chart-grid hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                disabled={updating}
                className="px-4 py-2 text-xs font-mono font-bold text-white bg-clinical-teal rounded shadow-sm hover:bg-clinical-teal-hover"
              >
                {updating ? "Saving Changes..." : "Save Appointment Updates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
