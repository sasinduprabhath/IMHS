import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { generateSafeFileName } from "@/lib/fileValidation";

/**
 * Uploads a file directly to Google Drive.
 * Supports:
 * 1. Google OAuth2 Refresh Token (Uploads directly into personal/workspace Drive quota)
 * 2. Google Service Account (Requires Shared Drive or Workspace delegation)
 * 3. Local Public Storage fallback
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
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const targetFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // ── OPTION A: GOOGLE OAUTH2 REFRESH TOKEN (Direct Personal/Workspace Storage) ──
  if (clientId && clientSecret && refreshToken && targetFolderId) {
    try {
      console.log("🚀 Attempting Google Drive API upload via OAuth2 Refresh Token...");
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const fileMetadata: any = {
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
        // Only set public reader permission for public coursework briefs, keep submissions private
        if (folderName === "briefs") {
          await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: "reader", type: "anyone" },
          }).catch(() => {});
        }

        const driveUrl = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
        console.log(`✅ File uploaded to Google Drive via OAuth2: ${driveUrl}`);
        return {
          url: driveUrl,
          driveFileId: fileId,
          isGoogleDrive: true,
        };
      }
    } catch (err: any) {
      console.error("❌ Google OAuth2 Upload Error:", err?.message || err);
    }
  }

  // ── OPTION B: SERVICE ACCOUNT (Shared Drives / Workspace) ─────────────────
  if (clientEmail && privateKey && targetFolderId) {
    try {
      console.log("🚀 Attempting Google Drive API upload via Service Account...");
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v3", auth });

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const fileMetadata: any = {
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
        supportsAllDrives: true,
      });

      const fileId = response.data.id;
      const webViewLink = response.data.webViewLink;

      if (fileId) {
        if (folderName === "briefs") {
          await drive.permissions.create({
            fileId: fileId,
            requestBody: { role: "reader", type: "anyone" },
            supportsAllDrives: true,
          }).catch(() => {});
        }

        const driveUrl = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
        console.log(`✅ File uploaded to Google Drive via Service Account: ${driveUrl}`);
        return {
          url: driveUrl,
          driveFileId: fileId,
          isGoogleDrive: true,
        };
      }
    } catch (err: any) {
      console.error("❌ Google Service Account Upload Error:", err?.message || err);
    }
  }

  // ── OPTION C: LOCAL STORAGE FALLBACK ─────────────────────────────────────
  const targetFolder = folderName === "briefs" ? "briefs" : "submissions";
  const uploadDir = path.join(process.cwd(), "public", "uploads", targetFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(fileName) || ".bin";
  const { safeFileName } = generateSafeFileName(fileName, ext);
  const fullPath = path.join(uploadDir, safeFileName);

  fs.writeFileSync(fullPath, buffer);

  const localUrl = `/uploads/${targetFolder}/${safeFileName}`;
  console.log(`📁 File saved to local storage fallback: ${localUrl}`);

  return {
    url: localUrl,
    isGoogleDrive: false,
  };
}
