import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import https from "https";

const prisma = new PrismaClient();
const PUBLIC_FACULTY_DIR = path.join(process.cwd(), "public", "faculty");

if (!fs.existsSync(PUBLIC_FACULTY_DIR)) {
  fs.mkdirSync(PUBLIC_FACULTY_DIR, { recursive: true });
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
        console.error(`Failed to download ${url}: HTTP ${res.statusCode}`);
        resolve(false);
      }
    }).on("error", (err) => {
      console.error(`Download error for ${url}:`, err);
      resolve(false);
    });
  });
}

// Exact 1-to-1 mapping from https://imhsedu.com/our-mentors/
const EXACT_MENTORS = [
  {
    name: "Dr. Isuru Wijesinghe",
    title: "Mentor",
    bio: "Ph.D. in Pharmaceutical Sciences, MSc, B.Pharm. Founder & Executive Director of IMHS.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/1.png",
    fileName: "mentor-1.png",
    order: 1,
  },
  {
    name: "Mrs. MGEJ Dharmasiri",
    title: "Mentor",
    bio: "Senior Lecturer in Pharmaceutical Chemistry & Quality Assurance.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/2.png",
    fileName: "mentor-2.png",
    order: 2,
  },
  {
    name: "Mr. V Hari Harshan",
    title: "Mentor",
    bio: "Senior Lecturer in Pharmacognosy & Clinical Pathology.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/3.png",
    fileName: "mentor-3.png",
    order: 3,
  },
  {
    name: "Dr. Niranga Meegaskada",
    title: "Mentor",
    bio: "Senior Lecturer in Medical & Clinical Practice.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/5.png",
    fileName: "mentor-5.png",
    order: 4,
  },
  {
    name: "GWT Madhumali",
    title: "Mentor",
    bio: "Lecturer in Pharmaceutical Technology & Industrial QA.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/6.png",
    fileName: "mentor-6.png",
    order: 5,
  },
  {
    name: "Dr. P. R Sanjeewa Pathirana",
    title: "Mentor",
    bio: "Senior Lecturer & Clinical Pharmacology Advisor.",
    imageUrl: "https://imhsedu.com/wp-content/uploads/2024/08/4.png",
    fileName: "mentor-4.png",
    order: 6,
  },
];

async function main() {
  console.log("Downloading exact 1-to-1 mentor images from imhsedu.com/our-mentors/ ...");

  // Clear existing faculty DB records
  await prisma.facultyMember.deleteMany({});

  for (const m of EXACT_MENTORS) {
    const destPath = path.join(PUBLIC_FACULTY_DIR, m.fileName);
    console.log(`Downloading ${m.imageUrl} -> ${destPath}`);
    const downloaded = await downloadFile(m.imageUrl, destPath);

    const localPhotoUrl = downloaded ? `/faculty/${m.fileName}` : m.imageUrl;

    const created = await prisma.facultyMember.create({
      data: {
        name: m.name,
        title: m.title,
        bio: m.bio,
        photoUrl: localPhotoUrl,
        order: m.order,
      },
    });

    console.log(`✅ Saved mentor ${created.name} with image: ${created.photoUrl}`);
  }

  console.log("Done syncing exact mentor images!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
