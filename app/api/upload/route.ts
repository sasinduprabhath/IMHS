import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure target folder public/practice/prescriptions exists
    const uploadDir = path.join(process.cwd(), "public", "practice", "prescriptions");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename with original extension
    const ext = path.extname(file.name) || ".png";
    const sanitizeName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `case-${Date.now()}-${sanitizeName}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to public/practice/prescriptions/
    await writeFile(filePath, buffer);

    const relativeUrl = `/practice/prescriptions/${filename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      filename,
    });
  } catch (error: any) {
    console.error("Error saving file to public/practice/prescriptions/:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to public directory" },
      { status: 500 }
    );
  }
}
