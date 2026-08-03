import fs from "fs";
import path from "path";
import https from "https";

const PUBLIC_GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
if (!fs.existsSync(PUBLIC_GALLERY_DIR)) {
  fs.mkdirSync(PUBLIC_GALLERY_DIR, { recursive: true });
}

function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      } else {
        console.error(`Failed ${url}: HTTP ${res.statusCode}`);
        resolve(false);
      }
    }).on("error", (err) => {
      console.error(`Error ${url}:`, err);
      resolve(false);
    });
  });
}

const VIDEOS = [
  {
    url: "https://imhsedu.com/wp-content/uploads/2026/03/WhatsApp-Video-2026-03-11-at-12.11.46-AM.mp4",
    name: "gallery-video-1.mp4",
  },
  {
    url: "https://imhsedu.com/wp-content/uploads/2026/03/WhatsApp-Video-2026-03-11-at-12.11.45-AM.mp4",
    name: "gallery-video-2.mp4",
  },
  {
    url: "https://imhsedu.com/wp-content/uploads/2026/03/WhatsApp-Video-2026-02-16-at-23.03.31.mp4",
    name: "gallery-video-3.mp4",
  },
];

async function main() {
  console.log("Downloading IMHS Gallery MP4 videos...");
  for (const v of VIDEOS) {
    const dest = path.join(PUBLIC_GALLERY_DIR, v.name);
    console.log(`Downloading ${v.url} -> ${dest}`);
    const ok = await downloadFile(v.url, dest);
    console.log(`${v.name}: ${ok ? "SUCCESS" : "FAILED"}`);
  }
}

main();
