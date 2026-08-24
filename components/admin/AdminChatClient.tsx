"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { LiveChatBox } from "@/components/chat/LiveChatBox";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  User,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  BookOpen,
  Filter,
} from "lucide-react";

interface ConversationItem {
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    studentId?: string | null;
    status: string;
    createdAt: string | Date;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string | Date;
    isRead: boolean;
    senderId: string;
    sender: {
      name: string;
      role: string;
    };
  } | null;
  unreadCount: number;
  lastActivityAt: string | Date;
}

interface AdminChatClientProps {
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  initialStudentId?: string;
}

export function AdminChatClient({ adminUser, initialStudentId }: AdminChatClientProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [onlyUnreadFilter, setOnlyUnreadFilter] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch conversation list
  const fetchConversations = useCallback(async (isInitial = false) => {
    try {
      const url = searchQuery
        ? `/api/chat/conversations?search=${encodeURIComponent(searchQuery)}`
        : `/api/chat/conversations`;

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);

        // If no student is selected yet, select the first student with an unread message or recent activity
        if (!selectedStudentId && data.conversations.length > 0 && isInitial) {
          setSelectedStudentId(data.conversations[0].student.id);
        }
      }
    } catch (e) {
      console.error("[AdminChat] Failed to fetch conversations:", e);
    } finally {
      if (isInitial) {
        setIsLoadingConversations(false);
      }
    }
  }, [searchQuery, selectedStudentId]);

  // Polling conversations list every 6 seconds
  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    startTransition(() => {
      fetchConversations(false);
    });
  };

  // Find currently selected student
  const activeConversation = conversations.find((c) => c.student.id === selectedStudentId);

  // Filter conversations based on unread filter
  const displayedConversations = conversations.filter((c) => {
    if (onlyUnreadFilter) {
      return c.unreadCount > 0;
    }
    return true;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-4">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#F16726] uppercase tracking-wider">
              Live Communications Desk
            </span>
            {totalUnread > 0 && (
              <span className="font-mono text-xs bg-[#F16726] text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                {totalUnread} Unread {totalUnread === 1 ? "Message" : "Messages"}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight mt-0.5">
            Student Direct Chat
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Real-time direct messaging with students for enrollment inquiries, payment receipts, and coursework help.
          </p>
        </div>
      </div>

      {/* ── Main Chat Desk Split Screen ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[640px]">
        {/* ── LEFT PANEL: Student Thread List (4/12) ── */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-xs">
          {/* Search and Filters Header */}
          <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-slate-50/70 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, Reg ID, email..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-[#0E57A4] outline-none transition-all placeholder:text-slate-400 font-sans"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-slate-500 font-medium">
                {displayedConversations.length} {displayedConversations.length === 1 ? "Student" : "Students"}
              </span>

              <button
                type="button"
                onClick={() => setOnlyUnreadFilter(!onlyUnreadFilter)}
                className={cn(
                  "font-mono text-[10px] px-2.5 py-1 rounded-lg border transition-all font-semibold flex items-center gap-1 cursor-pointer",
                  onlyUnreadFilter
                    ? "bg-[#F16726] text-white border-[#F16726]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <Filter className="w-3 h-3" />
                <span>Unread Only</span>
              </button>
            </div>
          </div>

          {/* Conversation List Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0E57A4]" />
                <span>Loading conversations...</span>
              </div>
            ) : displayedConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-sans space-y-1">
                <p className="font-bold text-slate-600">No conversations found</p>
                <p className="text-[11px]">
                  {searchQuery ? "Try searching with a different term." : "No student messages registered yet."}
                </p>
              </div>
            ) : (
              displayedConversations.map((conv) => {
                const isSelected = selectedStudentId === conv.student.id;
                const hasUnread = conv.unreadCount > 0;
                const initials = conv.student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const timeDisplay = conv.lastMessage
                  ? new Date(conv.lastMessage.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "New";

                return (
                  <button
                    key={conv.student.id}
                    onClick={() => {
                      setSelectedStudentId(conv.student.id);
                      // Clear unread count locally for instant responsiveness
                      conv.unreadCount = 0;
                    }}
                    className={cn(
                      "w-full p-3.5 text-left flex items-start gap-3 transition-all cursor-pointer select-none",
                      isSelected
                        ? "bg-blue-50/80 border-l-4 border-l-[#0E57A4] shadow-xs"
                        : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                    )}
                  >
                    {/* Student Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0E57A4] to-[#0A3D73] text-white flex items-center justify-center font-bold text-xs shadow-2xs font-mono">
                        {initials || "ST"}
                      </div>
                      {conv.student.status === "ACTIVE" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    {/* Text Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={cn("text-xs truncate font-bold", isSelected ? "text-[#0E57A4]" : "text-slate-900")}>
                          {conv.student.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {timeDisplay}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {conv.student.studentId && (
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                            {conv.student.studentId}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 truncate">
                          {conv.student.email}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p
                        className={cn(
                          "text-[11px] truncate mt-1 font-sans",
                          hasUnread ? "font-bold text-slate-900" : "text-slate-500"
                        )}
                      >
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.senderId === adminUser.id && (
                              <span className="text-[#0E57A4] font-semibold">You: </span>
                            )}
                            {conv.lastMessage.content || "Attached file"}
                          </>
                        ) : (
                          <span className="italic text-slate-400">No messages yet</span>
                        )}
                      </p>
                    </div>

                    {/* Unread Badge Pill */}
                    {hasUnread && (
                      <span className="shrink-0 bg-[#F16726] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Active Student Chat Window (8/12) ── */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {selectedStudentId && activeConversation ? (
            <div className="flex flex-col h-full">
              {/* Student Header Summary */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0E57A4] text-white font-bold text-xs flex items-center justify-center font-mono">
                    {activeConversation.student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        {activeConversation.student.name}
                      </h2>
                      {activeConversation.student.studentId && (
                        <span className="font-mono text-[10px] bg-blue-100 text-[#0E57A4] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          {activeConversation.student.studentId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {activeConversation.student.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {activeConversation.student.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Link to Student Details */}
                <Link
                  href={`/admin/students/${activeConversation.student.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-semibold transition-colors shadow-2xs"
                  target="_blank"
                >
                  <span>Student Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Chat Body */}
              <LiveChatBox
                key={selectedStudentId}
                currentUserId={adminUser.id}
                currentUserRole="ADMIN"
                targetStudentId={selectedStudentId}
                targetName={activeConversation.student.name}
                targetSubtext={`Student ID: ${activeConversation.student.studentId || "N/A"} • ${activeConversation.student.email}`}
                className="flex-1 rounded-none border-0 shadow-none"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700">Select a Student</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5 font-sans">
                  Choose a student conversation from the left panel to begin replying.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
