import fs from "fs";
import path from "path";
import readline from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get list of local image files in public/courses
const localCoursesDir = path.join(process.cwd(), "public", "courses");
const localImages = fs.existsSync(localCoursesDir) ? fs.readdirSync(localCoursesDir) : [];

console.log(`📸 Local Assets: Found ${localImages.length} course banner images in public/courses/`);

function findBestLocalImage(title: string, slug: string): string {
  const t = title.toLowerCase();
  const s = slug.toLowerCase();

  for (const img of localImages) {
    const imgLower = img.toLowerCase();
    if (t.includes("fast track") && (imgLower.includes("fast-track") || imgLower.includes("morden-pharmacy-fast-track"))) {
      return `/courses/${img}`;
    }
    if ((t.includes("manufacturing") || s.includes("manufacturing")) && (imgLower.includes("yellow-and-grey") || imgLower.includes("poster-3"))) {
      return `/courses/${img}`;
    }
    if ((t.includes("laboratory") || t.includes("diploma") || s.includes("diploma")) && (imgLower.includes("poster-768x543") || imgLower.includes("moder-pharmacy-7"))) {
      return `/courses/${img}`;
    }
    if (t.includes("science") && imgLower.includes("imhs-modern-pharmacy-course-4")) {
      return `/courses/${img}`;
    }
    if (t.includes("pharmacy") && (imgLower.includes("blue-and-white-modern-pharmacy-lab-poster-13") || imgLower.includes("modern-pharmacy-course-04"))) {
      return `/courses/${img}`;
    }
  }

  const firstBanner = localImages.find((i) => i.endsWith(".png") || i.endsWith(".jpg") || i.endsWith(".jpeg"));
  return firstBanner ? `/courses/${firstBanner}` : "/courses/Blue-and-White-Modern-Pharmacy-Lab-Poster-13.png";
}

function extractVideoOrDriveInfo(metaValue: string | null): { vimeoVideoId: string | null; driveFileId: string | null; type: "VIDEO" | "DOCUMENT" } {
  if (!metaValue) return { vimeoVideoId: null, driveFileId: null, type: "VIDEO" };

  const vimeoMatch = metaValue.match(/vimeo\.com\/(?:video\/)?([0-9]+)(?:\?h=([a-zA-Z0-9]+))?/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const hash = vimeoMatch[2];
    return {
      vimeoVideoId: hash ? `${videoId}/${hash}` : videoId,
      driveFileId: null,
      type: "VIDEO",
    };
  }

  const driveMatch = metaValue.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      vimeoVideoId: null,
      driveFileId: driveMatch[1],
      type: "DOCUMENT",
    };
  }

  if (metaValue.endsWith(".pdf") || metaValue.endsWith(".pptx") || metaValue.endsWith(".docx")) {
    return {
      vimeoVideoId: null,
      driveFileId: metaValue,
      type: "DOCUMENT",
    };
  }

  return { vimeoVideoId: null, driveFileId: null, type: "VIDEO" };
}

interface ParsedUser {
  wpId: string;
  userLogin: string;
  userPass: string;
  email: string;
  displayName: string;
  phone?: string;
}

interface ParsedPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  type: string;
  parentId: string;
  status: string;
  content: string;
  order: number;
}

async function migrateMasterBackup() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  console.log("=========================================================================");
  console.log(" 🚀 COMPREHENSIVE MASTER MIGRATION ENGINE FOR IMHS");
  console.log("=========================================================================");
  console.log(`📁 Source SQL Dump File: ${sqlPath}`);

  if (!fs.existsSync(sqlPath)) {
    console.error("❌ ERROR: SQL file not found at:", sqlPath);
    process.exit(1);
  }

  const usersMap = new Map<string, ParsedUser>();
  const postsMap = new Map<string, ParsedPost>();
  const postMetaPrices = new Map<string, { price?: number; regularPrice?: number }>();
  const postMetaThumbnails = new Map<string, string>();
  const postMetaMap = new Map<string, Map<string, string>>();
  const attachedFiles = new Map<string, string>();
  const userPhonesMap = new Map<string, string>();

  console.log("⚡ Step 1: Parsing SQL dump file line by line (413 MB)...");

  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentTarget: string | null = null;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith("INSERT INTO `wp_users`")) {
      currentTarget = "wp_users";
    } else if (trimmed.startsWith("INSERT INTO `wp_usermeta`")) {
      currentTarget = "wp_usermeta";
    } else if (trimmed.startsWith("INSERT INTO `wp_posts`")) {
      currentTarget = "wp_posts";
    } else if (trimmed.startsWith("INSERT INTO `wp_postmeta`")) {
      currentTarget = "wp_postmeta";
    } else if (trimmed.startsWith("INSERT INTO `") || trimmed.startsWith("CREATE TABLE") || trimmed.startsWith("ALTER TABLE")) {
      currentTarget = null;
    }

    // 1. Parse wp_users
    if (currentTarget === "wp_users" && trimmed.startsWith("(")) {
      const match = trimmed.match(/^\(\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*'([^']*)'\)/);
      if (match) {
        const wpId = match[1];
        const userLogin = match[2].trim();
        const userPass = match[3].trim();
        const email = match[5].trim().toLowerCase();
        const displayName = match[10].trim() || userLogin;

        if (email && email.includes("@")) {
          usersMap.set(wpId, {
            wpId,
            userLogin: userLogin.toUpperCase(),
            userPass,
            email,
            displayName,
          });
        }
      }
    }

    // 2. Parse wp_usermeta (Phones)
    if (currentTarget === "wp_usermeta" && trimmed.startsWith("(")) {
      const match = trimmed.match(/^\(\s*\d+,\s*(\d+),\s*'([^']*)',\s*'([^']*)'\)/);
      if (match) {
        const userId = match[1];
        const key = match[2];
        const val = match[3].trim();
        if (val && (key === "billing_phone" || key === "phone_number" || key === "digits_phone" || key === "mobile_number")) {
          userPhonesMap.set(userId, val);
        }
      }
    }

    // 3. Parse wp_posts (Courses, Topics/Chapters, Lessons, Enrollments)
    if (currentTarget === "wp_posts" && (trimmed.startsWith("(") || trimmed.includes("INSERT INTO"))) {
      const items = trimmed.split("),(");
      for (const item of items) {
        const match = item.match(/^\(?\s*(\d+),\s*(\d+),\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*(\d+),\s*'([^']*)',\s*(\d+),\s*'([^']*)'/);
        if (match) {
          const id = match[1];
          const authorId = match[2];
          const content = match[3];
          const title = match[4];
          const status = match[6];
          const slug = match[7];
          const parentId = match[8];
          const order = parseInt(match[10], 10) || 0;
          const type = match[11];

          postsMap.set(id, {
            id,
            authorId,
            title,
            slug,
            type,
            parentId,
            status,
            content,
            order,
          });
        }
      }
    }

    // 4. Parse wp_postmeta (Prices, Videos, Attachments, Cover Images)
    if (currentTarget === "wp_postmeta" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];

        if (!postMetaMap.has(postId)) {
          postMetaMap.set(postId, new Map());
        }
        postMetaMap.get(postId)!.set(key, val);

        if (key === "_price" || key === "_regular_price") {
          const num = Math.round(parseFloat(val) || 0);
          if (num > 0) {
            if (!postMetaPrices.has(postId)) postMetaPrices.set(postId, {});
            const rec = postMetaPrices.get(postId)!;
            if (key === "_price") rec.price = num;
            if (key === "_regular_price") rec.regularPrice = num;
          }
        }
        if (key === "_thumbnail_id") {
          postMetaThumbnails.set(postId, val);
        }
        if (key === "_wp_attached_file") {
          attachedFiles.set(postId, val);
        }
        if (key === "_tutor_course_product_id") {
          if (!postMetaPrices.has(postId)) postMetaPrices.set(postId, {});
          (postMetaPrices.get(postId) as any).productId = val;
        }
      }
    }
  }

  console.log(`✅ SQL Parsing Complete! Summary:`);
  console.log(`   - Users Extracted: ${usersMap.size}`);
  console.log(`   - Posts/Records Extracted: ${postsMap.size}`);
  console.log(`   - PostMeta Extracted: ${postMetaPrices.size} price records`);

  // ── PHASE 1: USERS & PASSWORDS & REG IDs ──────────────────────────────
  console.log("\n🔄 Phase 1: Migrating Student Accounts & Official Reg IDs...");
  let usersCreated = 0;
  let usersUpdated = 0;

  for (const [wpId, u] of usersMap.entries()) {
    const phone = userPhonesMap.get(wpId) || "";
    const studentId = u.userLogin || `IWPH${wpId}`;
    const role = u.email.toLowerCase().includes("admin") ? "ADMIN" : "STUDENT";

    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    try {
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: u.displayName,
            studentId,
            passwordHash: u.userPass,
            phone: phone || existing.phone || "",
          },
        });
        usersUpdated++;
      } else {
        await prisma.user.create({
          data: {
            name: u.displayName,
            email: u.email,
            studentId,
            passwordHash: u.userPass,
            role,
            phone,
          },
        });
        usersCreated++;
      }
    } catch {
      const fallbackId = `${studentId}-${wpId}`;
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: u.displayName,
            studentId: fallbackId,
            passwordHash: u.userPass,
            phone: phone || existing.phone || "",
          },
        });
        usersUpdated++;
      } else {
        await prisma.user.create({
          data: {
            name: u.displayName,
            email: u.email,
            studentId: fallbackId,
            passwordHash: u.userPass,
            role,
            phone,
          },
        });
        usersCreated++;
      }
    }
  }

  console.log(`✅ Phase 1 Complete: Created ${usersCreated} new accounts, updated ${usersUpdated} existing accounts.`);

  // ── PHASE 2: COURSES & LOCAL /courses/ COVER IMAGES ────────────────────
  console.log("\n🔄 Phase 2: Syncing All Courses with Local public/courses Images & Prices...");

  const coursePosts = Array.from(postsMap.values()).filter(
    (p) =>
      (p.type === "courses" || p.type === "course") &&
      (p.status === "publish" || p.status === "private") &&
      p.title &&
      !p.title.includes("New Course") &&
      !p.slug.includes("trashed")
  );

  console.log(`   Found ${coursePosts.length} course records in SQL dump.`);

  let coursesSynced = 0;

  for (const c of coursePosts) {
    const directPrices = postMetaPrices.get(c.id);
    const productId = (directPrices as any)?.productId;
    const productPrices = productId ? postMetaPrices.get(productId) : undefined;

    const price = directPrices?.price || productPrices?.price || directPrices?.regularPrice || productPrices?.regularPrice || 4500;
    const originalPrice = directPrices?.regularPrice || productPrices?.regularPrice || price + 1500;

    const thumbId = postMetaThumbnails.get(c.id);
    const attached = thumbId ? attachedFiles.get(thumbId) : null;
    const attachedFilename = attached ? path.basename(attached) : null;

    let coverImage = "";
    if (attachedFilename && fs.existsSync(path.join(localCoursesDir, attachedFilename))) {
      coverImage = `/courses/${attachedFilename}`;
    } else {
      coverImage = findBestLocalImage(c.title, c.slug);
    }

    let category = "Modern Pharmacy (SLMC Registration)";
    let level = "Intermediate";

    if (c.title.toLowerCase().includes("manufacturing")) {
      category = "Pharmaceutical Manufacturing";
      level = "Expert";
    } else if (c.title.toLowerCase().includes("laboratory") || c.title.toLowerCase().includes("diploma")) {
      category = "Medical Laboratory Technology";
      level = "All Levels";
    } else if (c.title.toLowerCase().includes("science")) {
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
          published: true,
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
          published: true,
        },
      });
    }
    coursesSynced++;
  }

  console.log(`✅ Phase 2 Complete: Synced ${coursesSynced} courses with local /courses/ images & prices.`);

  // ── PHASE 3: ENROLLMENTS ──────────────────────────────────────────────
  console.log("\n🔄 Phase 3: Syncing Student Course Enrollments...");

  const enrollmentPosts = Array.from(postsMap.values()).filter(
    (p) => p.type === "tutor_enrolled" || p.type === "tutor_enrolled_courses"
  );

  console.log(`   Found ${enrollmentPosts.length} student enrollment records in SQL dump.`);

  let enrollmentsSynced = 0;

  for (const en of enrollmentPosts) {
    const wpUser = usersMap.get(en.authorId);
    if (!wpUser) continue;

    const wpCourse = postsMap.get(en.parentId);
    const courseSlug = wpCourse ? wpCourse.slug : null;

    const dbUser = await prisma.user.findUnique({
      where: { email: wpUser.email },
    });

    if (!dbUser) continue;

    const dbCourse = courseSlug
      ? await prisma.course.findFirst({ where: { slug: courseSlug } })
      : await prisma.course.findFirst();

    if (dbCourse) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: dbUser.id,
            courseId: dbCourse.id,
          },
        },
        update: { status: "ACTIVE" },
        create: {
          userId: dbUser.id,
          courseId: dbCourse.id,
          status: "ACTIVE",
        },
      });
      enrollmentsSynced++;
    }
  }

  console.log(`✅ Phase 3 Complete: Verified ${enrollmentsSynced} student enrollments.`);

  // ── PHASE 4: CHAPTERS & LESSONS ────────────────────────────────────────
  console.log("\n🔄 Phase 4: Syncing Course Chapters (Topics) & Lesson Modules...");

  const topicPosts = Array.from(postsMap.values()).filter((p) => p.type === "topics");
  const lessonPosts = Array.from(postsMap.values()).filter((p) => p.type === "lesson");

  console.log(`   Found ${topicPosts.length} Chapters (topics) and ${lessonPosts.length} Lessons in SQL dump.`);

  let chaptersSynced = 0;
  let lessonsSynced = 0;

  for (const topic of topicPosts) {
    const parentCoursePost = postsMap.get(topic.parentId);
    if (!parentCoursePost) continue;

    const dbCourse = await prisma.course.findFirst({
      where: { OR: [{ slug: parentCoursePost.slug }, { title: parentCoursePost.title }] },
    });

    if (!dbCourse) continue;

    const safeChapterTitle = topic.title.slice(0, 190);

    let chapter = await prisma.chapter.findFirst({
      where: { title: safeChapterTitle, courseId: dbCourse.id },
    });

    if (!chapter) {
      chapter = await prisma.chapter.create({
        data: {
          title: safeChapterTitle,
          order: topic.order || chaptersSynced + 1,
          courseId: dbCourse.id,
        },
      });
      chaptersSynced++;
    }

    const childLessons = lessonPosts.filter(
      (l) =>
        l.parentId === topic.id &&
        l.type !== "tutor_quiz" &&
        !l.title.toLowerCase().includes("quiz") &&
        !l.title.toLowerCase().includes("mcq")
    );

    let lOrder = 1;
    for (const l of childLessons) {
      const meta = postMetaMap.get(l.id);
      const videoMeta = meta?.get("_tutor_lesson_video") || meta?.get("video") || null;
      const attachMeta = meta?.get("_tutor_lesson_attachments") || meta?.get("_wp_attached_file") || null;

      const { vimeoVideoId, driveFileId, type } = extractVideoOrDriveInfo(videoMeta || attachMeta);

      const safeTitle = l.title.slice(0, 190);

      const existingLesson = await prisma.lesson.findFirst({
        where: { title: safeTitle, chapterId: chapter.id },
      });

      if (!existingLesson) {
        await prisma.lesson.create({
          data: {
            title: safeTitle,
            order: l.order || lOrder++,
            type,
            vimeoVideoId,
            driveFileId,
            content: l.content || null,
            chapterId: chapter.id,
          },
        });
        lessonsSynced++;
      }
    }
  }

  console.log(`✅ Phase 4 Complete: Created/Verified ${chaptersSynced} Chapters and ${lessonsSynced} Lessons.`);

  console.log("=========================================================================");
  console.log(" 🎉 MASTER BACKUP MIGRATION & ASSET SYNC COMPLETED SUCCESSFULLY!");
  console.log("=========================================================================");
}

migrateMasterBackup()
  .catch((e) => {
    console.error("❌ Master Migration Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
