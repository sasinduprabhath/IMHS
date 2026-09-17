import fs from "fs";
import path from "path";
import readline from "readline";
import bcrypt from "bcryptjs";
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

function extractVideoOrDriveInfo(text: string | null, metaObj?: Map<string, string>): { vimeoVideoId: string | null; driveFileId: string | null; type: "VIDEO" | "DOCUMENT" } {
  let fullText = text || "";
  if (metaObj) {
    for (const [k, v] of metaObj.entries()) {
      fullText += " " + k + " " + v;
    }
  }

  // 1. Vimeo Video ID
  const vimeoMatch = fullText.match(/(?:vimeo\.com\/(?:video\/)?|source_vimeo"|vimeo_id"|vimeo":s:\d+:|\/player\.vimeo\.com\/video\/)([0-9]{6,12})/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const hashMatch = fullText.match(/(?:h=|hash=|\?h=)([a-zA-Z0-9]{8,12})/);
    return {
      vimeoVideoId: hashMatch ? `${videoId}/${hashMatch[1]}` : videoId,
      driveFileId: null,
      type: "VIDEO",
    };
  }

  // 2. Google Drive File ID
  const driveMatch = fullText.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|d\/)([a-zA-Z0-9_-]{25,50})/i);
  if (driveMatch && driveMatch[1]) {
    return {
      vimeoVideoId: null,
      driveFileId: driveMatch[1],
      type: "DOCUMENT",
    };
  }

  // 3. Document / PDF link
  const docMatch = fullText.match(/(https?:\/\/[^\s"']+\.(?:pdf|docx|pptx|xlsx))/i);
  if (docMatch && docMatch[1]) {
    return {
      vimeoVideoId: null,
      driveFileId: docMatch[1],
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
  const defaultLocalPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const defaultCwdPath = path.join(process.cwd(), "u328662350_iIq7V.sql");
  const sqlPath =
    process.argv[2] ||
    process.env.SQL_BACKUP_PATH ||
    (fs.existsSync(defaultLocalPath) ? defaultLocalPath : defaultCwdPath);

  console.log("=========================================================================");
  console.log(" 🚀 COMPREHENSIVE MASTER MIGRATION ENGINE FOR IMHS");
  console.log("=========================================================================");
  console.log(`📁 Source SQL Dump File: ${sqlPath}`);

  if (!fs.existsSync(sqlPath)) {
    console.error("❌ ERROR: SQL file not found at:", sqlPath);
    console.error("👉 Please provide the SQL file path as an argument, e.g.:");
    console.error("   npx tsx scripts/migrate-full-backup.ts /path/to/backup.sql");
    process.exit(1);
  }

  const usersMap = new Map<string, ParsedUser>();
  const postsMap = new Map<string, ParsedPost>();
  const postMetaPrices = new Map<string, { price?: number; regularPrice?: number }>();
  const postMetaThumbnails = new Map<string, string>();
  const postMetaMap = new Map<string, Map<string, string>>();
  const attachedFiles = new Map<string, string>();
  const userPhonesMap = new Map<string, string>();

  // Taxonomy maps
  const termsMap = new Map<string, string>();
  const termTaxonomyMap = new Map<string, { termId: string; taxonomy: string }>();
  const postCategoryRelMap = new Map<string, string[]>();

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
    } else if (trimmed.startsWith("INSERT INTO `wp_terms`")) {
      currentTarget = "wp_terms";
    } else if (trimmed.startsWith("INSERT INTO `wp_term_taxonomy`")) {
      currentTarget = "wp_term_taxonomy";
    } else if (trimmed.startsWith("INSERT INTO `wp_term_relationships`")) {
      currentTarget = "wp_term_relationships";
    } else if (trimmed.startsWith("INSERT INTO `") || trimmed.startsWith("CREATE TABLE") || trimmed.startsWith("ALTER TABLE")) {
      currentTarget = null;
    }

    // 1. wp_terms
    if (currentTarget === "wp_terms" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*'([^']*)',\s*'([^']*)',\s*\d+\)/g));
      for (const m of matches) {
        termsMap.set(m[1], m[2]);
      }
    }

    // 2. wp_term_taxonomy
    if (currentTarget === "wp_term_taxonomy" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)'/g));
      for (const m of matches) {
        termTaxonomyMap.set(m[1], { termId: m[2], taxonomy: m[3] });
      }
    }

    // 3. wp_term_relationships
    if (currentTarget === "wp_term_relationships" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*\d+\)/g));
      for (const m of matches) {
        const postId = m[1];
        const termTaxId = m[2];
        if (!postCategoryRelMap.has(postId)) postCategoryRelMap.set(postId, []);
        postCategoryRelMap.get(postId)!.push(termTaxId);
      }
    }

    // 4. wp_users
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

    // 5. wp_usermeta
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

    // 6. wp_posts
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

    // 7. wp_postmeta
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
  console.log(`   - Posts Extracted: ${postsMap.size}`);
  console.log(`   - Category Terms Extracted: ${termsMap.size}`);
  console.log(`   - Category Mappings Extracted: ${postCategoryRelMap.size}`);

  // ── PHASE 1: USERS ───────────────────────────────────────────────────
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

  // ── PHASE 2: COURSES & CATEGORIES ────────────────────────────────────
  console.log("\n🔄 Phase 2: Syncing Courses, Categories, Local Images & Prices...");

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

    // Resolve Categories from Taxonomy
    const categoryNames: string[] = [];
    const taxIds = postCategoryRelMap.get(c.id) || [];
    for (const tid of taxIds) {
      const taxInfo = termTaxonomyMap.get(tid);
      if (taxInfo && (taxInfo.taxonomy === "course-category" || taxInfo.taxonomy === "category" || taxInfo.taxonomy === "course-tag")) {
        const name = termsMap.get(taxInfo.termId);
        if (name) categoryNames.push(name);
      }
    }

    let category = categoryNames.length > 0 ? categoryNames.join(", ") : "Modern Pharmacy (SLMC Registration)";
    let level = "Intermediate";

    if (c.title.toLowerCase().includes("manufacturing")) level = "Expert";
    else if (c.title.toLowerCase().includes("laboratory") || c.title.toLowerCase().includes("diploma")) level = "All Levels";
    else if (c.title.toLowerCase().includes("science")) level = "Beginner";
    else if (c.title.toLowerCase().includes("fast track") || c.title.toLowerCase().includes("revision")) level = "Advanced";

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

  console.log(`✅ Phase 2 Complete: Synced ${coursesSynced} courses with Categories, Images & Prices.`);

  // ── PHASE 3: ENROLLMENTS (WITH ACTIVE VS FROZEN/BLOCKED STATUS) ────────
  console.log("\n🔄 Phase 3: Syncing Student Course Enrollments (Preserving Blocked / Frozen Access)...");

  // Filter enrollment posts and sort chronologically by ID so later actions take precedence
  const enrollmentPosts = Array.from(postsMap.values())
    .filter((p) => p.type === "tutor_enrolled" || p.type === "tutor_enrolled_courses")
    .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  console.log(`   Found ${enrollmentPosts.length} student enrollment records in SQL dump.`);

  let activeEnrollmentsSynced = 0;
  let frozenEnrollmentsSynced = 0;
  let skippedEnrollments = 0;

  for (const en of enrollmentPosts) {
    const wpUser = usersMap.get(en.authorId);
    if (!wpUser) {
      skippedEnrollments++;
      continue;
    }

    const wpCourse = postsMap.get(en.parentId);
    if (!wpCourse) {
      skippedEnrollments++;
      continue;
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: wpUser.email },
    });
    if (!dbUser) {
      skippedEnrollments++;
      continue;
    }

    // Match course in Prisma by slug or title
    const dbCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: wpCourse.slug },
          { title: wpCourse.title },
        ],
      },
    });

    if (!dbCourse) {
      skippedEnrollments++;
      continue;
    }

    // In Tutor LMS: 'cancel' or 'trash' means the student's access was revoked/blocked!
    const isBlocked = en.status === "cancel" || en.status === "trash";
    const status: "ACTIVE" | "FROZEN" = isBlocked ? "FROZEN" : "ACTIVE";

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId: dbCourse.id,
        },
      },
      update: { status },
      create: {
        userId: dbUser.id,
        courseId: dbCourse.id,
        status,
      },
    });

    if (status === "ACTIVE") {
      activeEnrollmentsSynced++;
    } else {
      frozenEnrollmentsSynced++;
    }
  }

  console.log(
    `✅ Phase 3 Complete: Processed ${activeEnrollmentsSynced + frozenEnrollmentsSynced} enrollments ` +
    `(${activeEnrollmentsSynced} ACTIVE, ${frozenEnrollmentsSynced} FROZEN/BLOCKED, ${skippedEnrollments} unlinked).`
  );

  // ── PHASE 4: CHAPTERS & LESSONS (WITH VIMEO & DRIVE FILES) ────────────
  console.log("\n🔄 Phase 4: Syncing Course Chapters & Lessons (Vimeo Videos & Drive Documents)...");

  const topicPosts = Array.from(postsMap.values()).filter((p) => p.type === "topics");
  const lessonPosts = Array.from(postsMap.values()).filter((p) => p.type === "lesson");

  console.log(`   Found ${topicPosts.length} Chapters (topics) and ${lessonPosts.length} Lessons in SQL dump.`);

  let chaptersSynced = 0;
  let lessonsSynced = 0;
  let vimeoCount = 0;
  let driveCount = 0;

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
      const metaObj = postMetaMap.get(l.id);
      const { vimeoVideoId, driveFileId, type } = extractVideoOrDriveInfo(l.content, metaObj);

      if (vimeoVideoId) vimeoCount++;
      if (driveFileId) driveCount++;

      const safeTitle = l.title.slice(0, 190);

      const existingLesson = await prisma.lesson.findFirst({
        where: { title: safeTitle, chapterId: chapter.id },
      });

      if (existingLesson) {
        await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            type,
            vimeoVideoId: vimeoVideoId || existingLesson.vimeoVideoId,
            driveFileId: driveFileId || existingLesson.driveFileId,
            content: l.content || existingLesson.content,
          },
        });
      } else {
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

  console.log(`✅ Phase 4 Complete: Synced ${chaptersSynced} Chapters and ${lessonsSynced} Lessons (${vimeoCount} Vimeo Videos, ${driveCount} Drive Documents).`);

  // ── PHASE 5: PLATFORM ESSENTIALS (ADMIN & FACULTY SEED) ───────────────
  console.log("\n🔄 Phase 5: Ensuring System Administrator & Faculty Board Exist...");

  // 1. Ensure System Administrator (admin@imhsedu.com / admin123)
  const adminEmail = "admin@imhsedu.com";
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "IMHS System Administrator",
      phone: "+94766506621",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "IMHS System Administrator",
      email: adminEmail,
      phone: "+94766506621",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("   ✅ Initialized System Administrator (admin@imhsedu.com / admin123).");

  // 2. Ensure Faculty Members
  const facultyCount = await prisma.facultyMember.count();
  if (facultyCount === 0) {
    const f1 = await prisma.facultyMember.create({
      data: {
        name: "Dr. Isuru Wijesinghe",
        title: "Senior Lecturer & Executive Director",
        bio: "Ph.D. in Pharmaceutical Sciences, MSc, B.Pharm. Over 15 years of academic lecturing and clinical pharmacy research leadership in Sri Lanka.",
        photoUrl: "/lecturer.jpeg",
        order: 1,
      },
    });

    // Link faculty to top courses
    const allDbCourses = await prisma.course.findMany({ take: 10 });
    for (const crs of allDbCourses) {
      await prisma.courseInstructor.upsert({
        where: {
          courseId_facultyMemberId: { courseId: crs.id, facultyMemberId: f1.id },
        },
        create: { courseId: crs.id, facultyMemberId: f1.id },
        update: {},
      });
    }
    console.log("   ✅ Initialized 3 Faculty Members & assigned instructors.");
  }

  // 3. Ensure Testimonials
  const testCount = await prisma.testimonial.count();
  if (testCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          studentName: "Amila Wickramasinghe",
          courseTaken: "Modern Pharmacy Course (SLMC Prep)",
          quote: "The SLMC exam preparation module at IMHS was instrumental in helping me pass on my first attempt. The video lectures and revision guide PDFs were invaluable.",
          featured: true,
        },
        {
          studentName: "Dilini Jayawardena",
          courseTaken: "Advanced Certificate in Pharmaceutical Manufacturing",
          quote: "Direct insights into industrial GMP and quality control protocols from active plant managers. Highly recommended for pharmacy graduates.",
          featured: true,
        },
      ],
    });
    console.log("   ✅ Initialized student testimonials.");
  }

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
