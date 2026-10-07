import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // ── Sanitize Reverse Proxy & Origin Headers ─────────────────────────
  // Behind Cloudflare + Nginx reverse proxies, multiple proxies can forward
  // duplicate headers joined with commas (e.g. Origin: 'https://imhsedu.com, https://imhsedu.com').
  // Node.js URL parser and Next.js Server Action CSRF validation will throw
  // ERR_INVALID_URL if the Origin or Host header contains a comma.
  const requestHeaders = new Headers(req.headers);
  for (const headerName of ["origin", "host", "x-forwarded-host", "x-forwarded-proto"]) {
    const val = requestHeaders.get(headerName);
    if (val && val.includes(",")) {
      const firstVal = val.split(",")[0].trim();
      requestHeaders.set(headerName, firstVal);
    }
  }

  // ── Force HTTPS Everywhere (Production Reverse Proxy / CDN / Cloudflare) ──
  const proto = requestHeaders.get("x-forwarded-proto") || req.headers.get("x-forwarded-proto");
  const host = requestHeaders.get("host") || req.headers.get("host");
  if (process.env.NODE_ENV === "production" && proto === "http" && host) {
    const cleanHost = host.split(",")[0].trim();
    const httpsUrl = `https://${cleanHost}${req.nextUrl.pathname}${req.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, { status: 301 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login";
  const isVerifyOtp = pathname === "/verify-otp";
  const isAdminPage = pathname.startsWith("/admin");
  const isStudentDash = pathname.startsWith("/dashboard");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isStudentApi = pathname.startsWith("/api/student");

  // Helper to return next response with sanitized headers
  const proceed = () =>
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  // Helper to safely build redirect URL from req.nextUrl without throwing ERR_INVALID_URL
  const safeRedirect = (destinationPath: string, searchParams?: Record<string, string>) => {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = destinationPath;
    if (searchParams) {
      for (const [k, v] of Object.entries(searchParams)) {
        redirectUrl.searchParams.set(k, v);
      }
    } else {
      redirectUrl.search = "";
    }
    return NextResponse.redirect(redirectUrl);
  };

  // ── /api/admin/* (Edge-level authorization enforcement) ────
  if (isAdminApi) {
    if (!token || token.role !== "ADMIN") {
      const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
      console.warn(`🛡️  SECURITY ALERT: [UNAUTHORIZED_ADMIN_ACCESS] (${clientIp}) Unauthorized access attempt to ${pathname}`);
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 401 }
      );
    }
    return proceed();
  }

  // ── /api/student/* (Except public AI chat assistant) ───────
  if (isStudentApi && pathname !== "/api/student/chat") {
    if (!token) {
      const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
      console.warn(`🛡️  SECURITY ALERT: [UNAUTHORIZED_STUDENT_ACCESS] (${clientIp}) Unauthenticated access attempt to ${pathname}`);
      return NextResponse.json(
        { error: "Unauthorized: Active session required." },
        { status: 401 }
      );
    }
    return proceed();
  }

  // ── /login ──────────────────────────────────────────────────
  if (isAuthPage) {
    if (token) {
      return safeRedirect(token.role === "ADMIN" ? "/admin" : "/dashboard");
    }
    return proceed();
  }

  // ── /verify-otp - always accessible (unauthenticated students need it) ──
  if (isVerifyOtp) {
    if (token) {
      // Already logged in - send to the right place
      return safeRedirect(token.role === "ADMIN" ? "/admin" : "/dashboard");
    }
    return proceed();
  }

  // ── /admin ──────────────────────────────────────────────────
  if (isAdminPage) {
    if (!token) {
      return safeRedirect("/login", { callbackUrl: pathname });
    }
    if (token.role !== "ADMIN") {
      return safeRedirect("/dashboard");
    }
  }

  // ── /dashboard ──────────────────────────────────────────────
  if (isStudentDash) {
    if (!token) {
      return safeRedirect("/login", { callbackUrl: pathname });
    }
  }

  return proceed();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf)$).*)",
  ],
};
