import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Prevents JavaScript heap out of memory on production VPS instances
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.102",
    "*.local",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "docs.google.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "maps.google.com",
      },
      {
        protocol: "https",
        hostname: "*.google.com",
      },
      {
        protocol: "https",
        hostname: "imhsedu.com",
      },
      {
        protocol: "https",
        hostname: "*.imhsedu.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://player.vimeo.com https://www.youtube.com https://s.ytimg.com https://www.google.com https://maps.googleapis.com https://*.google.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://i.vimeocdn.com https://drive.google.com https://*.googleusercontent.com https://lh3.googleusercontent.com https://docs.google.com https://www.google.com https://maps.google.com https://*.google.com https://imhsedu.com https://*.imhsedu.com https://img.youtube.com https://i.ytimg.com",
      "frame-src 'self' https://player.vimeo.com https://*.vimeo.com https://drive.google.com https://docs.google.com https://www.google.com https://maps.google.com https://*.google.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
      "connect-src 'self' https://generativelanguage.googleapis.com https://vimeo.com https://*.vimeo.com https://drive.google.com https://*.google.com https://*.googleapis.com https://www.youtube.com https://imhsedu.com https://*.imhsedu.com https://cloudflareinsights.com https://*.cloudflareinsights.com",
      "media-src 'self' blob: data: https://*.vimeocdn.com https://player.vimeo.com https://*.vimeo.com https://imhsedu.com https://*.imhsedu.com https://www.youtube.com https://*.googlevideo.com",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ];

    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; "),
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      ...(isProd
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : []),
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Dynamic HTML and API routes must always revalidate so mobile browsers never serve stale HTML with outdated chunk hashes
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff2?)).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/uploads/courses/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self' data: https:; style-src 'unsafe-inline'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; sandbox",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
      {
        source: "/practice/prescriptions/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
      {
        source: "/courses/:file(upload_[a-zA-Z0-9_.-]+)",
        destination: "/api/uploads/courses/:file",
      },
      {
        source: "/practice/prescriptions/:path*",
        destination: "/api/uploads/practice/prescriptions/:path*",
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
