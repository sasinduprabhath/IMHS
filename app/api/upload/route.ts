import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "submissions"; // "briefs" | "submissions"

    if (!file) {
      return NextResponse.json({ error: "No file selected for upload." }, { status: 400 });
    }

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum limit of 50MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/briefs or public/uploads/submissions
    const targetFolder = folder === "briefs" ? "briefs" : "submissions";
    const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate clean unique filename
    const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanOriginalName}`;
    const fullPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(fullPath, buffer);

    const publicUrl = `/uploads/${targetFolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Server failed to process file upload." }, { status: 500 });
  }
}
