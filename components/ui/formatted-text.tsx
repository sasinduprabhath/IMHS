import React from "react";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp";
import { LiveMeetingCard, LiveMeetingInfo } from "@/components/student/LiveMeetingCard";

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Extracts live meeting details (Zoom, Google Meet, MS Teams) if present in text.
 */
function extractLiveMeeting(content: string): {
  meetingInfo: LiveMeetingInfo | null;
  beforeText: string;
  afterText: string;
} {
  if (!content) return { meetingInfo: null, beforeText: "", afterText: "" };

  // Detect Zoom URL pattern
  const zoomUrlRegex = /https?:\/\/(?:[a-zA-Z0-9_\-\.]+\.)?(?:zoom\.us|zoomgov\.com)\/[j|s|my|w]+\/([0-9]+)(?:\?[^\s]+)?/i;
  // Detect Google Meet
  const meetUrlRegex = /https?:\/\/meet\.google\.com\/[a-z0-9\-]+/i;
  // Detect MS Teams
  const teamsUrlRegex = /https?:\/\/teams\.microsoft\.com\/[^\s]+/i;

  const zoomMatch = content.match(zoomUrlRegex);
  const meetMatch = content.match(meetUrlRegex);
  const teamsMatch = content.match(teamsUrlRegex);

  const meetingUrl = zoomMatch ? zoomMatch[0] : meetMatch ? meetMatch[0] : teamsMatch ? teamsMatch[0] : null;

  if (!meetingUrl) {
    return { meetingInfo: null, beforeText: content, afterText: "" };
  }

  const platform = zoomMatch ? "zoom" : meetMatch ? "meet" : "teams";

  // Match entire meeting block including lead-in "👉 Join Zoom..." and following Meeting ID/Passcode
  const blockRegex = /(?:👉[^\n]*\r?\n+)?https?:\/\/[^\s]+(?:\s*(?:\r?\n)+\s*(?:Meeting\s*ID|ID)\s*:\s*[0-9 ]+)?(?:\s*(?:\r?\n)+\s*(?:Passcode|Password|Pwd|Code)\s*:\s*[^\r\n\s]+)?/i;
  const blockMatch = content.match(blockRegex);

  let beforeText = content;
  let afterText = "";

  if (blockMatch && blockMatch.index !== undefined) {
    beforeText = content.slice(0, blockMatch.index).trim();
    afterText = content.slice(blockMatch.index + blockMatch[0].length).trim();
  }

  // Meeting ID
  const meetingIdMatch = content.match(/(?:Meeting\s*ID|Meeting\s*id|ID)\s*:\s*([0-9 ]{9,16})/i);
  let meetingId = meetingIdMatch ? meetingIdMatch[1].trim() : null;
  if (!meetingId && zoomMatch && zoomMatch[1]) {
    meetingId = zoomMatch[1];
  }

  // Passcode
  const passcodeMatch = content.match(/(?:Passcode|Password|Pwd|Code)\s*:\s*([^\r\n\s]+)/i);
  const passcode = passcodeMatch ? passcodeMatch[1].trim() : null;

  // Date
  const dateMatch = content.match(/(?:Date)\s*:\s*([^\r\n]+)/i);
  const date = dateMatch ? dateMatch[1].replace(/[*~_]/g, "").trim() : null;

  // Time
  const timeMatch = content.match(/(?:Time)\s*:\s*[*~_]?\s*([0-9]{1,2}:[0-9]{2}(?:\s*[AP]M)?)/i);
  const time = timeMatch ? timeMatch[1].trim() : null;

  // Topic / Lecture
  const lectureMatch = content.match(/(?:Lecture\s*[0-9]+[^\r\n]*|Topic\s*:[^\r\n]+)/i);
  const topic = lectureMatch ? lectureMatch[0].replace(/[*~_✨]/g, "").trim() : null;

  // Ensure no raw meeting credentials or duplicate date/time remain in visible text
  const cleanCredentials = (text: string) =>
    text
      .replace(/(?:⭕|🟡|\*)*\s*Date\s*:\s*[^\r\n]+(?:\r?\n)?/gi, "")
      .replace(/(?:⏰|\*)*\s*Time\s*:\s*[^\r\n]+(?:\r?\n)?/gi, "")
      .replace(/(?:Meeting\s*ID|Meeting\s*id|ID)\s*:\s*[0-9 ]+\r?\n?/gi, "")
      .replace(/(?:Passcode|Password|Pwd|Code)\s*:\s*[^\r\n\s]+\r?\n?/gi, "")
      .replace(/👉\s*\*?Join\s+Zoom\s+Meeting[^\n]*\r?\n?/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  beforeText = cleanCredentials(beforeText);
  afterText = cleanCredentials(afterText);

  return {
    meetingInfo: {
      platform,
      meetingUrl,
      meetingId,
      passcode,
      date,
      time,
      topic,
    },
    beforeText,
    afterText,
  };
}

/**
 * Parses raw text lines for tokens:
 * - URLs (https://..., http://..., www....) into clickable links
 * - WhatsApp Bold (*text*) -> <strong>text</strong>
 * - WhatsApp Italic (_text_) -> <em>text</em>
 * - WhatsApp Strikethrough (~text~) -> <del>text</del>
 * - Phone numbers (+94...) into clickable tel: or wa.me links
 */
function renderParsedParagraphs(rawText: string) {
  if (!rawText) return null;
  const paragraphs = rawText.split("\n");

  const parseLine = (line: string) => {
    const tokenRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\+[0-9]{2}\s?[0-9\s]{8,12}|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;
    const parts = line.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // 1. URL
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

      // 2. Phone Number (+94...)
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

  return paragraphs.map((para, pIdx) => (
    <p key={pIdx} className="min-h-[1em]">
      {parseLine(para)}
    </p>
  ));
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null;

  const { meetingInfo, beforeText, afterText } = extractLiveMeeting(content);

  // If no live meeting detected, render normal parsed paragraphs
  if (!meetingInfo) {
    return (
      <div className={`space-y-1.5 leading-relaxed font-sans ${className}`}>
        {renderParsedParagraphs(content)}
      </div>
    );
  }

  // If live meeting is detected, render before text + LiveMeetingCard + after text
  return (
    <div className={`space-y-3 leading-relaxed font-sans ${className}`}>
      {beforeText && (
        <div className="space-y-1.5">
          {renderParsedParagraphs(beforeText)}
        </div>
      )}

      <LiveMeetingCard {...meetingInfo} />

      {afterText && (
        <div className="space-y-1.5">
          {renderParsedParagraphs(afterText)}
        </div>
      )}
    </div>
  );
}
