import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "LKR 0";
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `LKR ${formatted}`;
}

/**
 * Convert Google Drive share URL into direct high-speed image URL
 * e.g. https://drive.google.com/file/d/1vVul.../view?usp=drive_link -> https://lh3.googleusercontent.com/d/1vVul...
 */
export function formatGoogleDriveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Match /file/d/<id> or /d/<id>
  const fileDMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // 2. Match id=<id> or open?id=<id> or uc?id=<id>
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  // 3. Match Google Drive raw alphanumeric ID (25-50 characters)
  if (!trimmed.startsWith("http") && !trimmed.startsWith("/") && /^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  return trimmed;
}

/**
 * Get embedded viewer iframe URL for PDF/PPTX Google Drive ID or external document URL
 */
export function getEmbeddedDocumentUrl(driveFileIdOrUrl: string | null | undefined): string {
  if (!driveFileIdOrUrl) return "";
  
  const match = driveFileIdOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  if (!driveFileIdOrUrl.startsWith("http") && !driveFileIdOrUrl.includes("/")) {
    return `https://drive.google.com/file/d/${driveFileIdOrUrl}/preview`;
  }

  if (driveFileIdOrUrl.startsWith("http")) {
    return `https://docs.google.com/gview?url=${encodeURIComponent(driveFileIdOrUrl)}&embedded=true`;
  }

  return driveFileIdOrUrl;
}

/**
 * Get direct download / share view link for PDF/PPTX Google Drive ID or URL
 */
export function getDocumentDownloadUrl(driveFileIdOrUrl: string | null | undefined): string {
  if (!driveFileIdOrUrl) return "#";
  const match = driveFileIdOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
  }
  if (!driveFileIdOrUrl.startsWith("http") && !driveFileIdOrUrl.includes("/")) {
    return `https://drive.google.com/file/d/${driveFileIdOrUrl}/view?usp=sharing`;
  }
  return driveFileIdOrUrl;
}

/**
 * Parses raw Vimeo video IDs, unlisted hash URLs (e.g. https://vimeo.com/1214846608/96f9b8a321?share=copy),
 * or simple IDs into a clean, unbranded, domain-locked Vimeo player iframe URL.
 */
export function getVimeoEmbedUrl(vimeoInput: string | null | undefined): string {
  if (!vimeoInput) return "";

  let videoId = "";
  let hashToken = "";

  // Check if input is a full Vimeo URL e.g. https://vimeo.com/1214846608/96f9b8a321?share=copy
  if (vimeoInput.includes("vimeo.com")) {
    try {
      const cleanUrlStr = vimeoInput.startsWith("http") ? vimeoInput : `https://${vimeoInput}`;
      const urlObj = new URL(cleanUrlStr);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      
      if (pathParts[0] === "video" && pathParts[1]) {
        videoId = pathParts[1];
        if (pathParts[2]) hashToken = pathParts[2];
      } else if (pathParts[0]) {
        videoId = pathParts[0];
        if (pathParts[1]) hashToken = pathParts[1];
      }

      const hParam = urlObj.searchParams.get("h");
      if (hParam) hashToken = hParam;
    } catch {
      videoId = vimeoInput.replace(/[^0-9]/g, "");
    }
  } else if (vimeoInput.includes("/")) {
    // Format: 1214846608/96f9b8a321
    const parts = vimeoInput.split("/");
    videoId = parts[0];
    hashToken = parts[1] || "";
  } else {
    // Simple ID: 1214846608
    videoId = vimeoInput.trim();
  }

  // Build clean, unbranded Vimeo iframe URL
  const params = new URLSearchParams();
  if (hashToken) {
    params.set("h", hashToken);
  }
  params.set("title", "0");
  params.set("byline", "0");
  params.set("portrait", "0");
  params.set("badge", "0");
  params.set("autopause", "0");

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
}
