import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

/**
 * Uploads a file directly to Google Drive.
 * Uses Google Drive API Service Account credentials from environment variables if present.
 * Falls back to local public uploads storage if credentials are missing.
 */
export async function uploadToGoogleDrive({
  buffer,
  fileName,
  mimeType,
  folderName = "submissions",
}: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderName?: "briefs" | "submissions";
}): Promise<{ url: string; driveFileId?: string; isGoogleDrive: boolean }> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const targetFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // ── 1. If Google Drive credentials exist in .env ─────────────────────────
  if (clientEmail && privateKey && targetFolderId) {
    try {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v3", auth });

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const fileMetadata = {
        name: `${folderName === "briefs" ? "[BRIEF]" : "[SUBMISSION]"} ${fileName}`,
        parents: [targetFolderId],
      };

      const media = {
        mimeType: mimeType || "application/octet-stream",
        body: stream,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });

      const fileId = response.data.id;
      const webViewLink = response.data.webViewLink;

      if (fileId) {
        // Set public reader permissions on the uploaded Drive file
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        }).catch(() => {});

        const driveUrl = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

        console.log(`✅ File uploaded to Google Drive: ${driveUrl}`);
        return {
          url: driveUrl,
          driveFileId: fileId,
          isGoogleDrive: true,
        };
      }
    } catch (err: any) {
      console.error("❌ Google Drive Upload Exception:", err?.message || err);
      // Fallback to local storage below if Drive API fails
    }
  }

  // ── 2. Fallback to Local Public Storage ──────────────────────────────────
  const targetFolder = folderName === "briefs" ? "briefs" : "submissions";
  const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanOriginalName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const uniqueFileName = `${Date.now()}_${cleanOriginalName}`;
  const fullPath = path.join(uploadDir, uniqueFileName);

  fs.writeFileSync(fullPath, buffer);

  const localUrl = `/uploads/${targetFolder}/${uniqueFileName}`;
  console.log(`📁 File saved to local storage: ${localUrl}`);

  return {
    url: localUrl,
    isGoogleDrive: false,
  };
}
