"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  Loader2,
  ChevronDown,
  AlertCircle,
  Bot,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  displayedContent?: string;
  escalateLink?: string;
  isStreaming?: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────
const WA_NUMBER = "94778025050";
const QUICK_PROMPTS = [
  { icon: "🔒", label: "Device Locked", text: "Why does my account say device locked?" },
  { icon: "📧", label: "No 2FA Email", text: "I did not receive my 2FA verification email" },
  { icon: "▶️", label: "Video Issue", text: "My course video is not loading or playing" },
  { icon: "🔑", label: "Login Problem", text: "I am unable to login to my portal account" },
];

function buildWALink(issue: string): string {
  const text = `Hello IMHS Help Desk,\n\nI need assistance with: ${issue}\n\nI was referred here by the IMHS AI Support Assistant. Please help me resolve this. Thank you!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ── Sanitizer & Formatter ─────────────────────────────────────────────────────
function cleanResponseText(rawText: string): { cleanText: string; issue: string | null } {
  let text = rawText || "";

  // Extract escalation tag if present
  let issue: string | null = null;
  const match = text.match(/\[ESCALATE:\s*(.+?)\]/i);
  if (match) {
    issue = match[1].trim();
    text = text.replace(/\[ESCALATE:\s*.+?\]/gi, "").trim();
  }

  // Remove internal thinking artifacts if LLM outputs meta-comments
  if (text.includes("User says:") || text.includes("Intent:") || text.includes("Context:")) {
    const lines = text.split("\n");
    const cleanedLines = lines.filter((l) => {
      const lower = l.toLowerCase().trim();
      return (
        !lower.startsWith("user says:") &&
        !lower.startsWith("intent:") &&
        !lower.startsWith("context:") &&
        !lower.startsWith("rule ") &&
        !lower.includes("user says \"")
      );
    });
    text = cleanedLines.join("\n").trim();
  }

  // Strip all asterisks (*) from response
  text = text.replace(/\*/g, "");

  // Format bullet lines starting with dash
  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { cleanText: text.trim(), issue };
}

// ── Typing Indicator Dots ─────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#0E57A4] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const contentToDisplay = msg.displayedContent !== undefined ? msg.displayedContent : msg.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5 mb-3.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#0E57A4] to-[#1a6fc4] flex items-center justify-center shadow-sm mt-0.5 border border-white/20">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text break-words",
            isUser
              ? "bg-[#0E57A4] text-white rounded-tr-sm shadow-sm font-medium"
              : "bg-white border border-[#E2E8F0] text-[#1E293B] rounded-tl-sm shadow-sm"
          )}
        >
          {msg.isStreaming && (!contentToDisplay || contentToDisplay === "") ? (
            <TypingDots />
          ) : (
            <>
              {contentToDisplay}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-3.5 bg-[#0E57A4] ml-1 animate-pulse align-middle rounded-sm" />
              )}
            </>
          )}
        </div>

        {msg.escalateLink && !msg.isStreaming && (
          <motion.a
            href={msg.escalateLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1dbd5c] active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm mt-0.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat with IMHS Admin on WhatsApp
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AISupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll inside the messages container
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
      setUnread(0);
    }
  }, [isOpen]);

  // Word-by-word typing effect controller
  const startWordTypingEffect = useCallback((msgId: string, fullText: string, escalateIssue: string | null) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    const words = fullText.split(" ");
    let currentWordIndex = 0;

    typingTimerRef.current = setInterval(() => {
      currentWordIndex++;
      const currentDisplayed = words.slice(0, currentWordIndex).join(" ");

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId) {
            const isDone = currentWordIndex >= words.length;
            return {
              ...m,
              displayedContent: currentDisplayed,
              isStreaming: !isDone,
              escalateLink: isDone && escalateIssue ? buildWALink(escalateIssue) : m.escalateLink,
            };
          }
          return m;
        })
      );

      scrollToBottom();

      if (currentWordIndex >= words.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      }
    }, 22); // ~22ms per word for smooth natural typing
  }, [scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setError(null);
      setInput("");

      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
      const botId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botId,
        role: "assistant",
        content: "",
        displayedContent: "",
        isStreaming: true,
      };

      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setIsLoading(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/student/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let rawStreamText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          rawStreamText += chunk;
        }

        // Clean & sanitize text output (remove asterisks, internal thinking)
        const { cleanText, issue } = cleanResponseText(rawStreamText);

        // Update target message with clean content and trigger word-by-word typing
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: cleanText } : m))
        );

        startWordTypingEffect(botId, cleanText, issue);

        if (!isOpen) setUnread((n) => n + 1);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Something went wrong. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== botId));
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, isOpen, startWordTypingEffect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-2xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)",
              boxShadow: "0 8px 32px rgba(14,87,164,.45), 0 2px 8px rgba(0,0,0,.15)",
            }}
            aria-label="Open AI Support Chat"
          >
            <span
              className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "rgba(14,87,164,.5)",
                animation: "ping 2s cubic-bezier(0,0,.2,1) infinite",
              }}
            />
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
            <span>AI Support</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile view */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "fixed z-50 flex flex-col overflow-hidden bg-[#F8FAFC]",
                // Desktop styling
                "md:bottom-6 md:right-6 md:w-[390px] md:h-[600px] md:rounded-2xl md:shadow-[0_24px_64px_rgba(14,87,164,.25)] md:border md:border-[#0E57A4]/15",
                // Mobile bottom sheet styling
                "bottom-0 right-0 left-0 h-[88vh] rounded-t-2xl border-t border-[#0E57A4]/15 shadow-2xl"
              )}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3.5 shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1662b6 100%)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-inner">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm leading-tight tracking-wide">
                      IMHS Support Assistant
                    </div>
                    <div className="text-white/70 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Gemma AI &middot; 24/7 Portal Support
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && !isLoading && (
                    <button
                      onClick={clearChat}
                      className="px-2 py-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all text-xs flex items-center gap-1 font-medium"
                      title="Clear conversation"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer ml-1"
                    aria-label="Close panel"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ── Scrollable Messages Container ── */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 py-4 min-h-0 min-w-0 select-text space-y-2"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#CBD5E1 transparent",
                }}
              >
                {isEmpty && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 my-auto pt-2"
                  >
                    <div className="text-center pt-2 pb-1">
                      <div
                        className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-3 border border-white/30"
                        style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)" }}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                      </div>
                      <h3 className="font-bold text-[#0F172A] text-base">
                        Hello! I am your IMHS AI Assistant
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                        Ask me any technical question about device locking, 2FA codes, video playback, or login issues.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="group flex flex-col gap-1 p-3 bg-white border border-[#E2E8F0] rounded-xl text-left hover:border-[#0E57A4]/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                        >
                          <span className="text-lg">{p.icon}</span>
                          <span className="text-[12px] font-bold text-[#1E293B] group-hover:text-[#0E57A4] transition-colors leading-tight">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-center text-[#94A3B8] leading-relaxed pt-2">
                      Need urgent human help? Contact admin on{" "}
                      <a
                        href={`https://wa.me/${WA_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-bold hover:underline"
                      >
                        WhatsApp
                      </a>
                    </p>
                  </motion.div>
                )}

                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-150 rounded-xl p-3 my-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Bar ── */}
              <div className="shrink-0 px-3.5 pb-3.5 pt-2 border-t border-[#E2E8F0] bg-white shadow-lg">
                <div className="flex items-end gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 focus-within:border-[#0E57A4]/50 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(14,87,164,.08)] transition-all">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about login, device lock, 2FA..."
                    rows={1}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] resize-none outline-none leading-relaxed py-1 disabled:opacity-60 min-h-[26px] max-h-[100px]"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer",
                      input.trim() && !isLoading
                        ? "bg-[#0E57A4] text-white hover:bg-[#0d4f96] shadow-sm hover:scale-105"
                        : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
                    )}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#94A3B8] text-center mt-2 font-medium">
                  IMHS AI Support &middot; Powered by Gemma AI
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
