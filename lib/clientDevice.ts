/**
 * lib/clientDevice.ts
 * Shared client-side device signature & metadata collector.
 * Runs in browser only.
 */

export interface ClientDeviceInfo {
  hash: string;
  info: string;
  deviceUuid: string;
}

export async function collectDeviceSignature(): Promise<ClientDeviceInfo> {
  try {
    let deviceUuid = "";
    try {
      deviceUuid = localStorage.getItem("imhs_device_uuid") || "";
    } catch {}

    const ua = navigator.userAgent;
    let osCategory = "desktop";
    let os = "Desktop";

    // Check mobile / tablet first before generic desktop Mac OS strings
    if (ua.includes("iPhone")) { osCategory = "ios"; os = "iPhone"; }
    else if (ua.includes("iPad")) { osCategory = "ios"; os = "iPad"; }
    else if (ua.includes("Android")) { osCategory = "android"; os = "Android Phone"; }
    else if (ua.includes("Windows")) { osCategory = "windows"; os = "Windows PC"; }
    else if (ua.includes("Mac OS") || ua.includes("Macintosh")) { osCategory = "mac"; os = "macOS"; }
    else if (ua.includes("Linux")) { osCategory = "linux"; os = "Linux"; }

    let browser = "Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Firefox")) browser = "Firefox";

    // Normalize screen resolution so portrait vs landscape rotation doesn't mutate hash
    const minDim = Math.min(screen.width, screen.height);
    const maxDim = Math.max(screen.width, screen.height);
    const info = `${os} · ${browser} (${minDim}x${maxDim})`;

    // Stable hardware attributes (zero canvas random noise to survive iOS Safari anti-tracking)
    const parts: string[] = [
      osCategory,
      `${minDim}x${maxDim}`,
      String(screen.colorDepth || 24),
      String(navigator.hardwareConcurrency || 2),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Colombo",
    ];

    if (deviceUuid) {
      parts.push(deviceUuid);
    }

    const raw = parts.join("|");
    const encoded = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", encoded);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const hash = hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");

    return { hash, info, deviceUuid };
  } catch {
    const minDim = Math.min(screen.width, screen.height);
    const maxDim = Math.max(screen.width, screen.height);
    return {
      hash: `fallback-${minDim}x${maxDim}`,
      info: `Web Browser (${minDim}x${maxDim})`,
      deviceUuid: "",
    };
  }
}
