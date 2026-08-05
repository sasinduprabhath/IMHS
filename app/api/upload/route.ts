import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToGoogleDrive } from "@/lib/googleDrive";

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

    // Upload to Google Drive (or fallback local storage)
    const result = await uploadToGoogleDrive({
      buffer,
      fileName: file.name,
      mimeType: file.type,
      folderName: folder === "briefs" ? "briefs" : "submissions",
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: file.name,
      fileSize: file.size,
      isGoogleDrive: result.isGoogleDrive,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Server failed to process file upload." }, { status: 500 });
  }
}
