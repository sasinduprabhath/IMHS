import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // ── Force HTTPS Everywhere (Production Reverse Proxy / CDN / Cloudflare) ──
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");
  if (process.env.NODE_ENV === "production" && proto === "http" && host) {
    const httpsUrl = `https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;
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
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // ── /login ──────────────────────────────────────────────────
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(
        new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", req.url)
      );
    }
    return NextResponse.next();
  }

  // ── /verify-otp - always accessible (unauthenticated students need it) ──
  if (isVerifyOtp) {
    if (token) {
      // Already logged in - send to the right place
      return NextResponse.redirect(
        new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", req.url)
      );
    }
    return NextResponse.next();
  }

  // ── /admin ──────────────────────────────────────────────────
  if (isAdminPage) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // ── /dashboard ──────────────────────────────────────────────
  if (isStudentDash) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/verify-otp",
    "/api/admin/:path*",
    "/api/student/:path*",
  ],
};
