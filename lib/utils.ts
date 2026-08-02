import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `රු ${formatted}`;
}

/**
 * Convert Google Drive share URL into direct image URL
 * e.g. https://drive.google.com/file/d/1_E.../view?usp=sharing -> https://lh3.googleusercontent.com/d/1_E...
 */
export function formatGoogleDriveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
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
