import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuthPage      = pathname === "/login";
  const isVerifyOtp     = pathname === "/verify-otp";
  const isAdminPage     = pathname.startsWith("/admin");
  const isStudentDash   = pathname.startsWith("/dashboard");

  // ── /login ──────────────────────────────────────────────────
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(
        new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", req.url)
      );
    }
    return NextResponse.next();
  }

  // ── /verify-otp — always accessible (unauthenticated students need it) ──
  if (isVerifyOtp) {
    if (token) {
      // Already logged in — send to the right place
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
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/verify-otp"],
};
