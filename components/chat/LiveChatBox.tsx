"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Loader2,
  Check,
  CheckCheck,
  Download,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface ChatMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  studentId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  isRead: boolean;
  createdAt: string | Date;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId?: string | null;
  };
}

interface LiveChatBoxProps {
  currentUserId: string;
  currentUserRole: "ADMIN" | "STUDENT";
  targetStudentId?: string; // If admin, the student ID they are chatting with
  targetName?: string;
  targetSubtext?: string;
  cannedResponses?: string[];
  className?: string;
}

export function LiveChatBox({
  currentUserId,
  currentUserRole,
  targetStudentId,
  targetName = "IMHS Academic Desk",
  targetSubtext = "Official Administration & Student Support",
  cannedResponses = [
    "Hello! How can we assist you today?",
    "Your payment & enrollment have been verified.",
    "Your course access has been activated.",
    "Please check your course syllabus for the updated schedule.",
    "Could you please attach a screenshot of the issue?",
  ],
  className,
}: LiveChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio not permitted or supported in background
    }
  }, [soundEnabled]);

  // Fetch messages from backend
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const url =
        currentUserRole === "ADMIN"
          ? `/api/chat/messages?studentId=${targetStudentId}`
          : `/api/chat/messages`;

      const res = await fetch(url);
      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages((prev) => {
          // Play sound if new incoming message from the other party arrived
          if (
            !isInitial &&
            data.messages.length > prev.length &&
            lastMessageCountRef.current > 0
          ) {
            const latestMsg = data.messages[data.messages.length - 1];
            if (latestMsg && latestMsg.senderId !== currentUserId) {
              playNotificationSound();
            }
          }
          return data.messages;
        });
        lastMessageCountRef.current = data.messages.length;
      }
    } catch (e) {
      console.error("[LiveChat] Fetch error:", e);
    } finally {
      if (isInitial) {
        setIsLoadingHistory(false);
        setTimeout(() => scrollToBottom(false), 50);
      }
    }
  }, [currentUserRole, targetStudentId, currentUserId, playNotificationSound, scrollToBottom]);

  // Initial load
  useEffect(() => {
    setIsLoadingHistory(true);
    fetchMessages(true);

    // 3-second polling interval for real-time responsiveness
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom(true);
    }
  }, [messages.length, isLoadingHistory, scrollToBottom]);

  // Handle file upload attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("Attachment exceeds 25MB limit.");
      return;
    }

    setIsUploadingFile(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "chat");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed.");
      }

      setAttachedFile({
        url: data.url,
        name: data.filename || file.name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to attach file.");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content && !attachedFile) return;
    if (isSending) return;

    setIsSending(true);
    setErrorMessage(null);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessageItem = {
      id: tempId,
      senderId: currentUserId,
      receiverId: currentUserRole === "ADMIN" ? (targetStudentId || "") : "admin",
      studentId: currentUserRole === "ADMIN" ? (targetStudentId || "") : currentUserId,
      content,
      attachmentUrl: attachedFile?.url,
      attachmentName: attachedFile?.name,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId,
        name: currentUserRole === "ADMIN" ? "IMHS Support Desk" : "You",
        email: "",
        role: currentUserRole,
      },
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText("");
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    try {
      const payload: any = {
        content,
        attachmentUrl: currentAttachment?.url || null,
        attachmentName: currentAttachment?.name || null,
      };

      if (currentUserRole === "ADMIN" && targetStudentId) {
        payload.studentId = targetStudentId;
      }

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      // Replace optimistic message with actual DB record
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.message : m))
      );
    } catch (err: any) {
      setErrorMessage(err.message || "Error sending message.");
      // Rollback optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(content);
      setAttachedFile(currentAttachment);
    } finally {
      setIsSending(false);
      setTimeout(() => scrollToBottom(true), 50);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs",
        className
      )}
    >
      {/* ── Chat Header ── */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#0C1A30] to-[#0A1628] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#0E57A4] to-[#0A3D73] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
            {currentUserRole === "ADMIN" ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0C1A30]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate text-white flex items-center gap-1.5">
              <span>{targetName}</span>
              {currentUserRole === "STUDENT" && (
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                  VERIFIED DESK
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-300 truncate font-sans">{targetSubtext}</p>
          </div>
        </div>

        {/* Sound notification toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* ── Message History Stream ── */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs font-mono space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0E57A4]" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0E57A4] border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Direct Conversation Channel</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                {currentUserRole === "ADMIN"
                  ? "Start a direct conversation with this student regarding coursework, payments, or inquiries."
                  : "Send a message to the IMHS Support & Academic Desk. We respond promptly."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;

            const timeFormatted = new Date(msg.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}
              >
                {!isSameSender && (
                  <span className="text-[10px] font-mono font-semibold text-slate-400 px-1 mb-1">
                    {isMe ? "You" : msg.sender.name}
                  </span>
                )}

                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-2 transition-all",
                    isMe
                      ? "bg-[#0E57A4] text-white rounded-tr-xs"
                      : "bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs"
                  )}
                >
                  {/* Text Content */}
                  {msg.content && (
                    <p className="whitespace-pre-wrap leading-relaxed font-sans select-text break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* Attachment Preview */}
                  {msg.attachmentUrl && (
                    <div
                      className={cn(
                        "mt-1.5 p-2 rounded-xl border flex items-center justify-between gap-3 text-[11px]",
                        isMe
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.attachmentUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                          <ImageIcon className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                        )}
                        <span className="truncate font-mono font-medium">
                          {msg.attachmentName || "Attachment File"}
                        </span>
                      </div>
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className={cn(
                          "p-1 rounded-md transition-colors shrink-0 flex items-center gap-1 font-mono text-[10px] font-bold",
                          isMe
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-slate-200 text-[#0E57A4]"
                        )}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                    </div>
                  )}

                  {/* Message Timestamp & Read Status */}
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 text-[10px] font-mono",
                      isMe ? "text-blue-200" : "text-slate-400"
                    )}
                  >
                    <span>{timeFormatted}</span>
                    {isMe && (
                      <span title={msg.isRead ? "Read by recipient" : "Delivered"}>
                        {msg.isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Check className="w-3 h-3 text-blue-200" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-100 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-mono font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Canned Responses Bar (Admin Only) ── */}
      {currentUserRole === "ADMIN" && cannedResponses.length > 0 && (
        <div className="px-3.5 py-1.5 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto select-none">
          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 shrink-0">
            Quick:
          </span>
          {cannedResponses.map((res, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(res)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white hover:bg-[#0E57A4] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0E57A4] shrink-0 transition-colors shadow-2xs font-semibold"
            >
              {res}
            </button>
          ))}
        </div>
      )}

      {/* ── Attachment Preview Chip ── */}
      {attachedFile && (
        <div className="px-4 py-2 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#0E57A4] min-w-0">
            <Paperclip className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-semibold">{attachedFile.name}</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
            title="Remove attachment"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Composer Input ── */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-2 focus-within:border-[#0E57A4] focus-within:bg-white transition-all shadow-2xs">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.zip"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile || isSending}
            title="Attach image, screenshot or document"
            className="p-2 rounded-xl text-slate-400 hover:text-[#0E57A4] hover:bg-blue-50 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isUploadingFile ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0E57A4]" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              currentUserRole === "ADMIN"
                ? "Type a reply to student (Press Enter to send)..."
                : "Type your message to IMHS desk (Press Enter to send)..."
            }
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 resize-none outline-none max-h-28 py-1.5 leading-relaxed font-sans"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputText.trim() && !attachedFile) || isSending || isUploadingFile}
            className={cn(
              "p-2 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer",
              (inputText.trim() || attachedFile) && !isSending
                ? "bg-[#0E57A4] hover:bg-[#0A4482] text-white shadow-xs active:scale-95"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            )}
            title="Send Message"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
