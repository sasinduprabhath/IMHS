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
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
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
  const text =
    `Hello IMHS Help Desk,\n\nI need assistance with: ${issue}\n\nI was referred here by the IMHS AI Support Assistant. Please help me resolve this. Thank you!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function extractEscalation(text: string): { clean: string; issue: string | null } {
  const match = text.match(/\[ESCALATE:\s*(.+?)\]/i);
  if (match) {
    return { clean: text.replace(/\[ESCALATE:\s*.+?\]/gi, "").trim(), issue: match[1].trim() };
  }
  return { clean: text, issue: null };
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#0E57A4] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5 mb-3", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#0E57A4] to-[#1a6fc4] flex items-center justify-center mt-1">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-[#0E57A4] text-white rounded-tr-sm"
              : "bg-white border border-[#E2E8F0] text-[#1A1F2E] rounded-tl-sm shadow-sm"
          )}
        >
          {msg.isStreaming && msg.content === "" ? (
            <TypingDots />
          ) : (
            <>
              {msg.content}
              {msg.isStreaming && (
                <span className="inline-block w-0.5 h-3.5 bg-[#0E57A4] ml-0.5 animate-pulse align-text-bottom" />
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
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1dbd5c] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
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

// ── Main component ────────────────────────────────────────────────────────────
export function AISupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = inputRef;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setError(null);
      setInput("");

      const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
      const botId = (Date.now() + 1).toString();
      const botMsg: Message = { id: botId, role: "assistant", content: "", isStreaming: true };

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
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: fullText } : m))
          );
        }

        const { clean, issue } = extractEscalation(fullText);
        const escalateLink = issue ? buildWALink(issue) : undefined;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId ? { ...m, content: clean, isStreaming: false, escalateLink } : m
          )
        );

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
    [messages, isLoading, isOpen]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-semibold text-sm"
            style={{
              background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)",
              boxShadow: "0 8px 32px rgba(14,87,164,.40), 0 2px 8px rgba(0,0,0,.12)",
            }}
            aria-label="Open AI Support Chat"
          >
            <span
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: "rgba(14,87,164,.5)",
                animation: "ping 2s cubic-bezier(0,0,.2,1) infinite",
              }}
            />
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>AI Support</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
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
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed z-50 flex flex-col bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto md:w-[380px] md:h-[580px] rounded-t-2xl md:rounded-2xl overflow-hidden"
              style={{
                height: "85vh",
                maxHeight: "85vh",
                background: "linear-gradient(160deg, #F0F5FB 0%, #F8FAFC 100%)",
                boxShadow: "0 24px 64px rgba(14,87,164,.18), 0 4px 16px rgba(0,0,0,.10)",
                border: "1px solid rgba(14,87,164,.10)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 shrink-0"
                style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)" }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">IMHS Support Assistant</div>
                  <div className="text-white/60 text-[11px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Gemma AI &middot; Available 24/7
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && !isLoading && (
                    <button
                      onClick={clearChat}
                      className="px-2 py-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Close"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
                {isEmpty && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center pt-2 pb-1">
                      <div
                        className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-3"
                        style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)" }}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                      </div>
                      <h3 className="font-semibold text-[#1A1F2E] text-sm">
                        Hello! I am your IMHS AI Assistant
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                        I can help with device lock, 2FA, video playback, and login issues.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="group flex flex-col gap-1 p-3 bg-white border border-[#E2E8F0] rounded-xl text-left hover:border-[#0E57A4]/40 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <span className="text-base">{p.icon}</span>
                          <span className="text-[11px] font-semibold text-[#1A1F2E] group-hover:text-[#0E57A4] transition-colors leading-tight">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] text-center text-[#94A3B8] leading-relaxed">
                      For urgent issues, contact admin directly on{" "}
                      <a
                        href={`https://wa.me/${WA_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-semibold hover:underline"
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
                    className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 px-3 pb-3 pt-2 border-t border-[#E2E8F0] bg-white/80 backdrop-blur-sm">
                <div className="flex items-end gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-sm focus-within:border-[#0E57A4]/40 focus-within:shadow-[0_0_0_3px_rgba(14,87,164,.08)] transition-all">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the portal..."
                    rows={1}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-[#1A1F2E] placeholder-[#94A3B8] resize-none outline-none leading-relaxed py-0.5 disabled:opacity-60 min-h-[24px] max-h-[100px]"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                      input.trim() && !isLoading
                        ? "bg-[#0E57A4] text-white hover:bg-[#0d4f96] shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                    )}
                    aria-label="Send"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#94A3B8] text-center mt-1.5">
                  AI may not be 100% accurate &middot; For critical issues use WhatsApp
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
