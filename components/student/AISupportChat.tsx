"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Loader2, ChevronDown, AlertCircle, Bot, ExternalLink } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  rawContent: string;
  displayContent: string;
  escalateLink?: string;
  isStreaming?: boolean;
  isTyping?: boolean;
}

// ── Config ─────────────────────────────────────────────────────────────────────
const WA_NUMBER = "94778025050";
const QUICK_PROMPTS = [
  { icon: "🔒", label: "Device Locked", text: "My account shows Device Locked. What do I do?" },
  { icon: "📧", label: "No 2FA Email", text: "I did not receive my 2FA verification email" },
  { icon: "▶️", label: "Video Issue", text: "My course video is not loading or playing" },
  { icon: "🔑", label: "Login Problem", text: "I am unable to login to my portal account" },
];

function buildWALink(issue: string): string {
  const text = `Hello IMHS Help Desk,\n\nI need assistance with: ${issue}\n\nI was referred here by the IMHS Support Assistant. Please help me resolve this. Thank you!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Robust sanitizer: removes meta reasoning, prompt leaks, markdown symbols, and duplicate paragraphs */
function sanitizeBotResponse(rawText: string): { clean: string; issue: string | null } {
  let issue: string | null = null;
  const escMatch = rawText.match(/\[ESCALATE:\s*(.+?)\]/i);
  if (escMatch) {
    issue = escMatch[1].trim();
  }

  let text = rawText.replace(/\[ESCALATE:\s*.+?\]/gi, "");

  const lines = text.split("\n");
  const cleanLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^(user says|intent|scope|causes|solution|action|no reasoning|no preamble|plain text|bullet points|numbered steps|concise|end with)/i.test(
        trimmed
      ) ||
      /^[\*\-•]\s*(user says|intent|scope|causes|solution|action|no reasoning|no preamble)/i.test(
        trimmed
      )
    ) {
      continue;
    }

    let cleaned = line
      .replace(/^\s*[\*\#]+\s*/, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1");

    cleanLines.push(cleaned);
  }

  let result = cleanLines.join("\n").trim();

  const paragraphs = result.split(/\n\s*\n/);
  const uniqueParagraphs: string[] = [];
  for (const p of paragraphs) {
    const pTrim = p.trim();
    if (pTrim && uniqueParagraphs[uniqueParagraphs.length - 1] !== pTrim) {
      uniqueParagraphs.push(pTrim);
    }
  }

  return {
    clean: uniqueParagraphs.join("\n\n"),
    issue,
  };
}

// ── Text renderer ──────────────────────────────────────────────────────────────
function FormattedText({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <span className="space-y-1 block">
      {lines.map((line, i) => {
        if (!line.trim()) return <span key={i} className="block h-1.5" />;
        const isBullet = line.startsWith("- ") || line.startsWith("• ");
        const isNumbered = /^\d+\.\s/.test(line);

        if (isBullet) {
          const content = line.replace(/^[\-•]\s*/, "");
          return (
            <span key={i} className="flex gap-2 items-start block">
              <span className="text-[#0E57A4] font-bold shrink-0 mt-0.5">•</span>
              <span>{content}</span>
            </span>
          );
        }
        if (isNumbered) {
          const num = line.match(/^(\d+)\.\s/)?.[1];
          const content = line.replace(/^\d+\.\s/, "");
          return (
            <span key={i} className="flex gap-2 items-start block">
              <span className="text-[#0E57A4] font-bold shrink-0 mt-0.5 min-w-[14px]">{num}.</span>
              <span>{content}</span>
            </span>
          );
        }
        return <span key={i} className="block">{line}</span>;
      })}
    </span>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const showCursor = (msg.isStreaming || msg.isTyping) && !isUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5 mb-3.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1a6fc4 100%)" }}
        >
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[84%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-[1.65]",
            isUser
              ? "text-white rounded-tr-sm font-medium"
              : "bg-white border border-[#E8EEF6] text-[#1A1F2E] rounded-tl-sm shadow-sm"
          )}
          style={isUser ? { background: "linear-gradient(135deg, #0E57A4 0%, #1565c0 100%)" } : {}}
        >
          {!isUser && msg.isStreaming && msg.displayContent === "" ? (
            <span className="inline-flex items-center gap-1.5 py-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#0E57A4]/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s`, animationDuration: "1s" }}
                />
              ))}
            </span>
          ) : isUser ? (
            <span>{msg.displayContent}</span>
          ) : (
            <FormattedText text={msg.displayContent} />
          )}

          {showCursor && msg.displayContent !== "" && (
            <span className="inline-block w-[2px] h-[14px] bg-[#0E57A4] ml-0.5 animate-pulse align-text-bottom rounded-full" />
          )}
        </div>

        {msg.escalateLink && !msg.isStreaming && !msg.isTyping && (
          <motion.a
            href={msg.escalateLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #20b858 100%)" }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
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

// ── Main component ─────────────────────────────────────────────────────────────
export function AISupportChat({ triggerClassName }: { triggerClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const typingTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Prevent background body scroll when chat panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Gentle scroll to bottom when user sends a message or new content arrives
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(0);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    return () => {
      typingTimers.current.forEach((t) => clearInterval(t));
    };
  }, []);

  /** Prevent scroll propagation to background page when scrolling inside chat messages */
  const handleScrollAreaWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = e.currentTarget;
    const isUp = e.deltaY < 0;
    const isDown = e.deltaY > 0;

    if (isUp && el.scrollTop <= 0) {
      e.preventDefault();
    } else if (isDown && el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      e.preventDefault();
    }
  };

  /** Prevent touch scroll propagation on mobile */
  const handleScrollAreaTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  /** Typewriter animation word by word */
  const startTypewriter = useCallback(
    (msgId: string, fullText: string) => {
      const words = fullText.split(" ").filter(Boolean);
      let wordIndex = 0;

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isTyping: true, displayContent: "" } : m))
      );

      const timer = setInterval(() => {
        wordIndex++;
        const displayed = words.slice(0, wordIndex).join(" ");
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, displayContent: displayed } : m))
        );
        scrollToBottom();

        if (wordIndex >= words.length) {
          clearInterval(timer);
          typingTimers.current.delete(msgId);
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, isTyping: false } : m))
          );
          scrollToBottom();
        }
      }, 30);

      typingTimers.current.set(msgId, timer);
    },
    [scrollToBottom]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setError(null);
      setInput("");

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        rawContent: trimmed,
        displayContent: trimmed,
      };
      const botId = (Date.now() + 1).toString();
      const botMsg: Message = {
        id: botId,
        role: "assistant",
        rawContent: "",
        displayContent: "",
        isStreaming: true,
      };

      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: m.rawContent,
      }));

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setIsLoading(true);
      setTimeout(scrollToBottom, 50);
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
        let rawText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawText += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, rawContent: rawText } : m))
          );
        }

        const { clean, issue } = sanitizeBotResponse(rawText);
        const escalateLink = issue ? buildWALink(issue) : undefined;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, rawContent: clean, displayContent: "", isStreaming: false, escalateLink }
              : m
          )
        );

        startTypewriter(botId, clean);

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
    [messages, isLoading, isOpen, startTypewriter, scrollToBottom]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    typingTimers.current.forEach((t) => clearInterval(t));
    typingTimers.current.clear();
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };

  const isEmpty = messages.length === 0;
  const anyTyping = messages.some((m) => m.isStreaming || m.isTyping);

  return (
    <>
      {/* ── Floating Trigger Button (Clean Icon-Only Circle) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="tour-ai-chat"
            key="trigger"
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Support Chat"
            className={cn(
              "w-12 h-12 rounded-full text-white font-semibold select-none shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative group bg-[#0E57A4] hover:bg-[#0c4a8e]",
              triggerClassName || "fixed bottom-6 right-6 z-50"
            )}
            title="IMHS Support Assistant"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 drop-shadow-xs transition-transform group-hover:rotate-12" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none shadow-xs border-2 border-white">
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
            {/* Mobile backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel Container — Stop Wheel & Touch Propagation to Background */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="fixed z-50 flex flex-col bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto w-full md:w-[390px] h-[85vh] md:h-[580px] max-h-[90vh] md:max-h-[580px] rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl bg-[#F6F9FD] border border-[#0E57A4]/15"
            >
              {/* Header */}
              <div
                className="shrink-0 flex items-center gap-3 px-4 py-3.5"
                style={{ background: "linear-gradient(135deg, #0a4a96 0%, #0E57A4 50%, #1565c0 100%)" }}
              >
                <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm tracking-tight">IMHS Support Assistant</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.8)]" />
                    <span className="text-white/70 text-[11px] font-medium">IMHS Help Desk &middot; Available 24/7</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && !anyTyping && (
                    <button
                      onClick={clearChat}
                      className="px-2.5 py-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Messages Scroll Area (Isolated Scroll, No Background Chaining) ── */}
              <div
                ref={scrollContainerRef}
                onWheel={handleScrollAreaWheel}
                onTouchMove={handleScrollAreaTouchMove}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-2 select-text"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                  overscrollBehavior: "contain",
                }}
              >
                {isEmpty && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-5 pt-3 pb-2"
                  >
                    <div className="relative">
                      <div
                        className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #0E57A4 0%, #1565c0 100%)" }}
                      >
                        <Sparkles className="w-7 h-7 text-yellow-300" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#F6F9FD] flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">24/7</span>
                      </span>
                    </div>

                    <div className="text-center">
                      <h3 className="font-bold text-[#1A1F2E] text-base">Hello! I am your IMHS Assistant</h3>
                      <p className="text-[13px] text-[#64748B] mt-1.5 leading-relaxed max-w-[280px]">
                        I can help with device locks, 2FA emails, video issues, and login problems.
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="group flex flex-col gap-1.5 p-3.5 bg-white border border-[#E8EEF6] rounded-2xl text-left hover:border-[#0E57A4]/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                        >
                          <span className="text-xl leading-none">{p.icon}</span>
                          <span className="text-[12px] font-semibold text-[#1A1F2E] group-hover:text-[#0E57A4] transition-colors leading-tight">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="text-[11px] text-[#94A3B8] text-center">
                      Need urgent help?{" "}
                      <a
                        href={`https://wa.me/${WA_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-semibold hover:underline"
                      >
                        Contact admin on WhatsApp
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
                    className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* ── Input bar (No Focus Ring / No Double Border) ── */}
              <div
                className="shrink-0 px-3 pb-3 pt-2 border-t border-[#E8EEF6]"
                style={{ background: "rgba(246,249,253,0.95)" }}
              >
                {/* Input box wrapper */}
                <div className="flex items-end gap-2 bg-white border border-[#DDE6F0] rounded-2xl px-3.5 py-2 shadow-sm transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the portal..."
                    rows={1}
                    disabled={isLoading || anyTyping}
                    className="flex-1 bg-transparent text-sm text-[#1A1F2E] placeholder-[#94A3B8] resize-none outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 shadow-none focus:shadow-none leading-relaxed py-0.5 disabled:opacity-50 min-h-[22px] max-h-[96px]"
                    style={{ outline: "none", boxShadow: "none", border: "none" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading || anyTyping}
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                      input.trim() && !isLoading && !anyTyping
                        ? "text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        : "bg-[#F1F5F9] text-[#CBD5E1] cursor-not-allowed"
                    )}
                    style={
                      input.trim() && !isLoading && !anyTyping
                        ? { background: "linear-gradient(135deg, #0E57A4 0%, #1565c0 100%)" }
                        : {}
                    }
                    aria-label="Send"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
