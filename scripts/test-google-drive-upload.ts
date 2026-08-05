import fs from "fs";
import path from "path";
import { uploadToGoogleDrive } from "../lib/googleDrive";

// Load .env manually
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function testDriveUpload() {
  console.log("=========================================================================");
  console.log(" 🧪 TESTING GOOGLE DRIVE UPLOAD WITH .env CREDENTIALS");
  console.log("=========================================================================");

  const dummyContent = Buffer.from("IMHS Google Drive Integration Test File", "utf-8");

  try {
    const res = await uploadToGoogleDrive({
      buffer: dummyContent,
      fileName: "IMHS_Test_Document.txt",
      mimeType: "text/plain",
      folderName: "submissions",
    });

    console.log("\n=========================================================================");
    if (res.isGoogleDrive) {
      console.log(" 🎉 SUCCESS! File successfully uploaded to Google Drive!");
      console.log(` 🔗 Google Drive View URL: ${res.url}`);
      console.log(` 🆔 File ID: ${res.driveFileId}`);
    } else {
      console.log(" ⚠️ NOTICE: Upload fell back to Local Storage.");
      console.log(` 📁 Local URL: ${res.url}`);
      console.log("\nPlease verify the 3 steps below:");
      console.log(" 1. GOOGLE_SERVICE_ACCOUNT_EMAIL is set in .env");
      console.log(" 2. GOOGLE_PRIVATE_KEY is set in .env");
      console.log(" 3. GOOGLE_DRIVE_FOLDER_ID is set in .env AND the Google Drive Folder is shared with the Service Account email as Editor!");
    }
    console.log("=========================================================================");
  } catch (err: any) {
    console.error("❌ Test failed:", err);
  }
}

testDriveUpload();
