import React from "react";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp";

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Parses raw text and formats:
 * - URLs (https://..., http://..., www....) into clickable links
 * - WhatsApp Bold (*text*) -> <strong>text</strong>
 * - WhatsApp Italic (_text_) -> <em>text</em>
 * - WhatsApp Strikethrough (~text~) -> <del>text</del>
 * - Phone numbers (+94...) into clickable tel: or wa.me links
 */
export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null;

  // Split content into paragraphs/lines
  const paragraphs = content.split("\n");

  const parseLine = (line: string) => {
    // Regex for URLs, phone numbers, bold (*...*), italic (_..._), strikethrough (~...~)
    // We match tokens sequentially
    const tokenRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\+[0-9]{2}\s?[0-9\s]{8,12}|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;

    const parts = line.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // 1. Check if URL
      if (part.match(/^https?:\/\//i) || part.match(/^www\./i)) {
        const href = part.startsWith("www.") ? `https://${part}` : part;
        return (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clinical-teal underline font-medium hover:text-clinical-teal-hover break-all inline-flex items-center gap-1 transition-colors"
          >
            {part}
          </a>
        );
      }

      // 2. Check if Phone Number (+94...)
      if (part.match(/^\+[0-9]{2}\s?[0-9\s]{8,12}$/)) {
        const cleanPhone = formatPhoneForWhatsApp(part);
        return (
          <a
            key={idx}
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clinical-teal font-semibold underline hover:text-clinical-teal-hover transition-colors"
          >
            {part}
          </a>
        );
      }

      // 3. WhatsApp Bold (*text*)
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <strong key={idx} className="font-bold text-ink">{part.slice(1, -1)}</strong>;
      }

      // 4. WhatsApp Italic (_text_)
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return <em key={idx} className="italic text-ink">{part.slice(1, -1)}</em>;
      }

      // 5. WhatsApp Strikethrough (~text~)
      if (part.startsWith("~") && part.endsWith("~") && part.length > 2) {
        return <del key={idx} className="line-through text-ink-muted">{part.slice(1, -1)}</del>;
      }

      // Plain text
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed font-sans ${className}`}>
      {paragraphs.map((para, pIdx) => (
        <p key={pIdx} className="min-h-[1em]">
          {parseLine(para)}
        </p>
      ))}
    </div>
  );
}
