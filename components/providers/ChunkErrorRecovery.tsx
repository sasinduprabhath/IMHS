"use client";

import { useEffect } from "react";

export function ChunkErrorRecovery() {
  useEffect(() => {
    function triggerSelfHeal() {
      try {
        const lastReload = sessionStorage.getItem("imhs_chunk_reload");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
          sessionStorage.setItem("imhs_chunk_reload", String(now));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }

    const handleError = (e: ErrorEvent) => {
      if (e.target && (e.target as HTMLElement).tagName) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "LINK" || tag === "SCRIPT") {
          const src = (e.target as any).src || (e.target as any).href || "";
          if (src.includes("/_next/static/")) {
            triggerSelfHeal();
          }
        }
      }
      if (e.message && /Loading chunk .* failed|Failed to load chunk|ChunkLoadError/i.test(e.message)) {
        triggerSelfHeal();
      }
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason ? (e.reason.message || String(e.reason)) : "";
      if (/Loading chunk .* failed|Failed to load chunk|ChunkLoadError/i.test(reason)) {
        triggerSelfHeal();
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
