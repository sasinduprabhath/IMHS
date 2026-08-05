import fs from "fs";
import path from "path";
import readline from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get list of local image files in public/courses
const localCoursesDir = path.join(process.cwd(), "public", "courses");
const localImages = fs.existsSync(localCoursesDir) ? fs.readdirSync(localCoursesDir) : [];

console.log(`📸 Found ${localImages.length} local course banner images in public/courses/`);

// Intelligent matcher for local image
function findBestLocalImage(title: string, slug: string, defaultFallback: string): string {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();

  for (const img of localImages) {
    const imgLower = img.toLowerCase();

    if (t.includes("fast track") && (imgLower.includes("fast-track") || imgLower.includes("morden-pharmacy-fast-track"))) {
      return `/courses/${img}`;
    }
    if ((t.includes("pharmaceutical manufacturing") || s.includes("manufacturing")) && (imgLower.includes("yellow-and-grey") || imgLower.includes("poster-3"))) {
      return `/courses/${img}`;
    }
    if ((t.includes("laboratory") || t.includes("diploma") || s.includes("diploma")) && (imgLower.includes("poster-768x543") || imgLower.includes("moder-pharmacy-7"))) {
      return `/courses/${img}`;
    }
    if (t.includes("pharmaceutical science") && imgLower.includes("imhs-modern-pharmacy-course-4")) {
      return `/courses/${img}`;
    }
    if (t.includes("modern pharmacy") && (imgLower.includes("blue-and-white-modern-pharmacy-lab-poster-13") || imgLower.includes("modern-pharmacy-course-04"))) {
      return `/courses/${img}`;
    }
  }

  // Fallback to first matched image or relative local path
  if (localImages.length > 0) {
    const candidate = localImages.find(i => i.endsWith(".png") || i.endsWith(".jpg") || i.endsWith(".jpeg"));
    if (candidate) return `/courses/${candidate}`;
  }

  return defaultFallback;
}

async function syncAllCoursesWithLocalImages() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  console.log("=========================================================================");
  console.log(" 🚀 SYNCING ALL BACKUP COURSES WITH LOCAL /courses/ IMAGES & PRICES");
  console.log("=========================================================================");

  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inPosts = false;
  let inMeta = false;

  const coursesMap = new Map<string, { id: string; title: string; slug: string; content: string }>();
  const metaPrices = new Map<string, { price?: number; regularPrice?: number }>();
  const metaThumbnails = new Map<string, string>(); // courseId -> thumbId
  const attachedFiles = new Map<string, string>(); // attId -> filename

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_posts`")) {
      inPosts = true;
      inMeta = false;
    } else if (line.includes("INSERT INTO `wp_postmeta`")) {
      inPosts = false;
      inMeta = true;
    } else if (line.startsWith("INSERT INTO `") || line.startsWith("CREATE TABLE")) {
      inPosts = false;
      inMeta = false;
    }

    if (inPosts && (line.includes("'courses'") || line.includes("'course'"))) {
      const items = line.split("),(");
      for (const item of items) {
        if (item.includes("'courses'") || item.includes("'course'")) {
          const parts = item.split("', '");
          // Extract post_title (index ~3), post_name/slug, etc.
          const match = item.match(/\((\d+),\s*\d+,\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)'/);
          if (match) {
            const id = match[1];
            const content = match[2];
            const title = match[3];
            const status = match[4];
            const slug = match[5];

            if ((status === "publish" || status === "private") && title && slug && !title.includes("New Course") && !slug.includes("trashed")) {
              coursesMap.set(id, { id, title, slug, content });
            }
          } else {
            // Direct fallback extract by regex
            const idMatch = item.match(/^\(?\s*(\d+)/);
            const titleMatch = item.match(/,\s*'([^']+)',\s*'[^']*',\s*'(publish|private)'/);
            const slugMatch = item.match(/,\s*'([a-z0-9-]+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'https?:/);
            if (idMatch && titleMatch && slugMatch) {
              const id = idMatch[1];
              const title = titleMatch[1];
              const slug = slugMatch[1];
              coursesMap.set(id, { id, title, slug, content: "" });
            }
          }
        }
      }
    }

    if (inMeta) {
      const matches = Array.from(line.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];

        if (key === "_price" || key === "_regular_price") {
          const num = Math.round(parseFloat(val) || 0);
          if (num > 0) {
            if (!metaPrices.has(postId)) metaPrices.set(postId, {});
            const rec = metaPrices.get(postId)!;
            if (key === "_price") rec.price = num;
            if (key === "_regular_price") rec.regularPrice = num;
          }
        }
        if (key === "_thumbnail_id") {
          metaThumbnails.set(postId, val);
        }
        if (key === "_wp_attached_file") {
          attachedFiles.set(postId, val);
        }
      }
    }
  }

  console.log(`📦 Found ${coursesMap.size} published courses in SQL dump.`);

  let syncedCount = 0;

  for (const [id, c] of coursesMap.entries()) {
    const prices = metaPrices.get(id);
    const price = prices?.price || 4500;
    const originalPrice = prices?.regularPrice || price + 1500;

    // Check if thumbnail file exists locally in public/courses/
    const thumbId = metaThumbnails.get(id);
    const attached = thumbId ? attachedFiles.get(thumbId) : null;
    const attachedBasename = attached ? path.basename(attached) : null;

    let coverImage = "";
    if (attachedBasename && fs.existsSync(path.join(localCoursesDir, attachedBasename))) {
      coverImage = `/courses/${attachedBasename}`;
    } else {
      coverImage = findBestLocalImage(c.title, c.slug, "/courses/Blue-and-White-Modern-Pharmacy-Lab-Poster-13.png");
    }

    // Determine category and level based on course title
    let category = "Modern Pharmacy (SLMC Registration)";
    let level = "Intermediate";

    if (c.title.toLowerCase().includes("manufacturing")) {
      category = "Pharmaceutical Manufacturing";
      level = "Expert";
    } else if (c.title.toLowerCase().includes("laboratory") || c.title.toLowerCase().includes("diploma")) {
      category = "Medical Laboratory Technology";
      level = "All Levels";
    } else if (c.title.toLowerCase().includes("foundation")) {
      category = "Foundation in Pharmaceutical Science";
      level = "Beginner";
    } else if (c.title.toLowerCase().includes("fast track") || c.title.toLowerCase().includes("revision")) {
      category = "SLMC Fast Track Revision";
      level = "Advanced";
    }

    const existingCourse = await prisma.course.findFirst({
      where: { OR: [{ slug: c.slug }, { title: c.title }] },
    });

    if (existingCourse) {
      await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          title: c.title,
          price,
          originalPrice,
          coverImage,
          category,
          level,
          description: c.content || existingCourse.description,
        },
      });
    } else {
      await prisma.course.create({
        data: {
          title: c.title,
          slug: c.slug,
          description: c.content || `${c.title} by IMHS - Institute of Medicine and Health Sciences.`,
          price,
          originalPrice,
          coverImage,
          category,
          level,
        },
      });
    }
    syncedCount++;
    console.log(`✅ Synced Course: "${c.title}" | Price: LKR ${price} | Image: ${coverImage}`);
  }

  console.log("=========================================================================");
  console.log(` 🎉 SUCCESSFULLY SYNCED ALL ${syncedCount} COURSES WITH LOCAL /courses/ IMAGES!`);
  console.log("=========================================================================");
}

syncAllCoursesWithLocalImages()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
