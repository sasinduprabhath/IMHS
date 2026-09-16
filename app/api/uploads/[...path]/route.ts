import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".zip": "application/zip",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Prevent path traversal attacks
    const sanitizedSegments = pathSegments.map((segment) =>
      segment.replace(/(\.\.|\/|\\)/g, "")
    ).filter(Boolean);

    if (sanitizedSegments.length === 0) {
      return new NextResponse("Invalid Path", { status: 400 });
    }

    // Candidate search locations in priority order:
    // 1. public/uploads/...
    // 2. public/courses/... (handles legacy course image uploads)
    // 3. public/... (general public folder fallback)
    const publicBaseDir = path.join(process.cwd(), "public");
    const candidatePaths = [
      path.join(publicBaseDir, "uploads", ...sanitizedSegments),
      path.join(publicBaseDir, "courses", ...sanitizedSegments),
      path.join(publicBaseDir, ...sanitizedSegments),
    ];

    let resolvedPath: string | null = null;
    for (const candidate of candidatePaths) {
      if (candidate.startsWith(publicBaseDir) && fs.existsSync(candidate)) {
        const stat = fs.statSync(candidate);
        if (stat.isFile()) {
          resolvedPath = candidate;
          break;
        }
      }
    }

    if (!resolvedPath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("Error serving uploaded asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
