import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToGoogleDrive } from "@/lib/googleDrive";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { validateFileSignature, generateSafeFileName } from "@/lib/fileValidation";
import { logger } from "@/lib/logger";

const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_DOC_EXTENSIONS = new Set([".pdf", ".docx", ".doc", ".zip", ".png", ".jpg", ".jpeg"]);
const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "image/png",
  "image/jpeg",
]);
const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.security("UNAUTHORIZED_STUDENT_ACCESS", "Unauthenticated upload attempt rejected", { ip: clientIp, path: "/api/upload", method: "POST" });
      return NextResponse.json({ error: "Unauthorized: Active session required." }, { status: 401 });
    }

    const rateLimit = checkRateLimit(
      `upload:${session.user.id}:${clientIp}`,
      RATE_LIMITS.FILE_UPLOAD.maxAttempts,
      RATE_LIMITS.FILE_UPLOAD.windowMs
    );
    if (!rateLimit.success) {
      logger.security("RATE_LIMIT_EXCEEDED", "Upload rate limit exceeded", { userId: session.user.id, ip: clientIp, path: "/api/upload" });
      return rateLimitResponse(rateLimit.resetTime, rateLimit.limit, rateLimit.remaining, "Upload limit reached. Please wait a few minutes before uploading again.");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "prescriptions";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const userRole = (session.user as any)?.role;

    // ── 1. ASSIGNMENT SUBMISSION & CHAT ATTACHMENTS (Student or Admin) ───
    if (folder === "submissions" || folder === "chat") {
      if (file.size > MAX_DOC_SIZE) {
        logger.security("FILE_UPLOAD_BLOCKED", `File exceeded size limit: ${file.size} bytes`, { userId: session.user.id, ip: clientIp });
        return NextResponse.json({ error: "File exceeds 50MB maximum size limit." }, { status: 400 });
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.has(ext)) {
        logger.security("FILE_UPLOAD_BLOCKED", `Invalid submission extension: ${ext}`, { userId: session.user.id, ip: clientIp });
        return NextResponse.json(
          { error: `Invalid file format (${ext}). Allowed: PDF, DOCX, DOC, ZIP, PNG, JPG` },
          { status: 400 }
        );
      }

      if (file.type && !ALLOWED_DOC_MIMES.has(file.type)) {
        logger.security("FILE_UPLOAD_BLOCKED", `Disallowed submission MIME type: ${file.type}`, { userId: session.user.id, ip: clientIp });
        return NextResponse.json(
          { error: `Invalid file MIME type (${file.type}).` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Deep binary magic byte verification to prevent disguise/executable attacks
      const signatureCheck = validateFileSignature(buffer, ext);
      if (!signatureCheck.valid) {
        logger.security("FILE_UPLOAD_BLOCKED", `Magic byte signature check failed for ${file.name}: ${signatureCheck.error}`, {
          userId: session.user.id,
          ip: clientIp,
        });
        return NextResponse.json({ error: signatureCheck.error }, { status: 400 });
      }

      const { safeFileName, sanitizedOriginalName } = generateSafeFileName(file.name, ext);

      const driveRes = await uploadToGoogleDrive({
        buffer,
        fileName: sanitizedOriginalName,
        mimeType: file.type || "application/octet-stream",
        folderName: "submissions",
      });

      logger.info(`Assignment submission file uploaded successfully`, {
        userId: session.user.id,
        fileName: sanitizedOriginalName,
        safeFileName,
        isGoogleDrive: driveRes.isGoogleDrive,
      });

      return NextResponse.json({
        success: true,
        url: driveRes.url,
        fileName: sanitizedOriginalName,
        isGoogleDrive: driveRes.isGoogleDrive,
      });
    }

    // ── 2. COURSEWORK BRIEFS (Admin Only) ─────────────────────────────────
    if (folder === "briefs") {
      if (userRole !== "ADMIN") {
        logger.security("UNAUTHORIZED_ADMIN_ACCESS", "Non-admin attempted to upload coursework brief", { userId: session.user.id, ip: clientIp });
        return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 403 });
      }

      if (file.size > MAX_DOC_SIZE) {
        return NextResponse.json({ error: "File exceeds 50MB maximum size limit." }, { status: 400 });
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `Invalid file format (${ext}). Allowed: PDF, DOCX, ZIP, PNG, JPG` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const signatureCheck = validateFileSignature(buffer, ext);
      if (!signatureCheck.valid) {
        logger.security("FILE_UPLOAD_BLOCKED", `Magic byte signature check failed for brief: ${signatureCheck.error}`, { userId: session.user.id, ip: clientIp });
        return NextResponse.json({ error: signatureCheck.error }, { status: 400 });
      }

      const { sanitizedOriginalName } = generateSafeFileName(file.name, ext);

      const driveRes = await uploadToGoogleDrive({
        buffer,
        fileName: sanitizedOriginalName,
        mimeType: file.type || "application/octet-stream",
        folderName: "briefs",
      });

      logger.info(`Coursework brief uploaded by admin`, { userId: session.user.id, fileName: sanitizedOriginalName });

      return NextResponse.json({
        success: true,
        url: driveRes.url,
        fileName: sanitizedOriginalName,
        isGoogleDrive: driveRes.isGoogleDrive,
      });
    }

    // ── 3. COURSE COVER IMAGES & PRACTICE ASSETS (Admin Only) ────────────
    if (userRole !== "ADMIN") {
      logger.security("UNAUTHORIZED_ADMIN_ACCESS", "Non-admin attempted to upload course image", { userId: session.user.id, ip: clientIp });
      return NextResponse.json({ error: "Unauthorized: Admin access required." }, { status: 403 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image file exceeds 5MB maximum limit." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, JPEG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_IMAGE_MIMES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid MIME type. Only standard image files are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const signatureCheck = validateFileSignature(buffer, ext);
    if (!signatureCheck.valid) {
      logger.security("FILE_UPLOAD_BLOCKED", `Magic byte image check failed: ${signatureCheck.error}`, { userId: session.user.id, ip: clientIp });
      return NextResponse.json({ error: signatureCheck.error }, { status: 400 });
    }

    const targetSubfolder = folder === "courses" ? "uploads/courses" : "uploads/practice/prescriptions";
    const uploadDir = path.join(process.cwd(), "public", ...targetSubfolder.split("/"));
    await mkdir(uploadDir, { recursive: true });

    const { safeFileName } = generateSafeFileName(file.name, ext);
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    // Also write fallback to public/courses for legacy compatibility
    if (folder === "courses") {
      const legacyCoursesDir = path.join(process.cwd(), "public", "courses");
      await mkdir(legacyCoursesDir, { recursive: true });
      await writeFile(path.join(legacyCoursesDir, safeFileName), buffer);
    }

    const relativeUrl = `/${targetSubfolder}/${safeFileName}`;

    logger.info(`Course / asset image stored safely`, { userId: session.user.id, safeFileName, folder: targetSubfolder });

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename: safeFileName,
    });
  } catch (error: any) {
    logger.error("Error in upload API handler", error, { ip: clientIp, path: "/api/upload" });
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
