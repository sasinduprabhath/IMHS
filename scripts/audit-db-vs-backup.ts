import fs from "fs";
import path from "path";
import readline from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runAudit() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  console.log("================================================================================");
  console.log(" 🔍 COMPARING MYSQL DATABASE VS. u328662350_iIq7V.sql BACKUP");
  console.log("================================================================================");

  if (!fs.existsSync(sqlPath)) {
    console.error("❌ ERROR: SQL file not found at:", sqlPath);
    process.exit(1);
  }

  console.log(`📁 Source SQL Dump File: ${sqlPath}`);
  console.log("⚡ Reading SQL Dump...");

  const usersMap = new Map<string, { wpId: string; userLogin: string; userPass: string; email: string; displayName: string }>();
  const postsMap = new Map<string, { id: string; authorId: string; title: string; slug: string; type: string; parentId: string; status: string; content: string; order: number }>();
  const postMetaMap = new Map<string, Map<string, string>>();

  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentTarget: string | null = null;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith("INSERT INTO `wp_users`")) currentTarget = "wp_users";
    else if (trimmed.startsWith("INSERT INTO `wp_posts`")) currentTarget = "wp_posts";
    else if (trimmed.startsWith("INSERT INTO `wp_postmeta`")) currentTarget = "wp_postmeta";
    else if (trimmed.startsWith("INSERT INTO `") || trimmed.startsWith("CREATE TABLE") || trimmed.startsWith("ALTER TABLE")) currentTarget = null;

    if (currentTarget === "wp_users" && trimmed.startsWith("(")) {
      const match = trimmed.match(/^\(\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*'([^']*)'\)/);
      if (match) {
        const wpId = match[1];
        const userLogin = match[2].trim().toUpperCase();
        const userPass = match[3].trim();
        const email = match[5].trim().toLowerCase();
        const displayName = match[10].trim() || userLogin;
        if (email && email.includes("@")) {
          usersMap.set(wpId, { wpId, userLogin, userPass, email, displayName });
        }
      }
    }

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
          postsMap.set(id, { id, authorId, title, slug, type, parentId, status, content, order });
        }
      }
    }

    if (currentTarget === "wp_postmeta" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];
        if (!postMetaMap.has(postId)) postMetaMap.set(postId, new Map());
        postMetaMap.get(postId)!.set(key, val);
      }
    }
  }

  // Filter SQL entities
  const sqlCourses = Array.from(postsMap.values()).filter(
    (p) =>
      (p.type === "courses" || p.type === "course") &&
      (p.status === "publish" || p.status === "private") &&
      p.title &&
      !p.title.includes("New Course") &&
      !p.slug.includes("trashed")
  );

  const sqlEnrollments = Array.from(postsMap.values()).filter(
    (p) => p.type === "tutor_enrolled" || p.type === "tutor_enrolled_courses"
  );

  const sqlTopics = Array.from(postsMap.values()).filter((p) => p.type === "topics");
  const sqlLessons = Array.from(postsMap.values()).filter(
    (p) =>
      p.type === "lesson" &&
      !p.title.toLowerCase().includes("quiz") &&
      !p.title.toLowerCase().includes("mcq")
  );

  // Fetch Database entities via Prisma
  console.log("⚡ Querying Current Database (Prisma)...");
  const dbUsers = await prisma.user.findMany({ select: { id: true, email: true, studentId: true, role: true } });
  const dbCourses = await prisma.course.findMany({ select: { id: true, slug: true, title: true, price: true, coverImage: true } });
  const dbChapters = await prisma.chapter.findMany({ select: { id: true, title: true, courseId: true } });
  const dbLessons = await prisma.lesson.findMany({ select: { id: true, title: true, type: true, vimeoVideoId: true, driveFileId: true } });
  const dbEnrollments = await prisma.enrollment.findMany({ select: { id: true, userId: true, courseId: true } });

  console.log("\n================================================================================");
  console.log(" 📊 SIDE-BY-SIDE TALLY COMPARISON REPORT");
  console.log("================================================================================");

  console.log("\n1. USER ACCOUNTS & REGISTRATION IDs:");
  console.log(`   - SQL Backup Users Extracted: ${usersMap.size}`);
  console.log(`   - Current Database Users:     ${dbUsers.length}`);

  let matchedUsers = 0;
  for (const u of usersMap.values()) {
    if (dbUsers.some((dbU) => dbU.email.toLowerCase() === u.email.toLowerCase())) {
      matchedUsers++;
    }
  }
  console.log(`   - Tally Match: ${matchedUsers} / ${usersMap.size} (${((matchedUsers / usersMap.size) * 100).toFixed(1)}%)`);

  console.log("\n2. COURSES & CATALOG:");
  console.log(`   - SQL Backup Published Courses: ${sqlCourses.length}`);
  console.log(`   - Current Database Courses:      ${dbCourses.length}`);

  let matchedCourses = 0;
  for (const c of sqlCourses) {
    if (dbCourses.some((dbC) => dbC.slug === c.slug || dbC.title === c.title)) {
      matchedCourses++;
    }
  }
  console.log(`   - Tally Match: ${matchedCourses} / ${sqlCourses.length} (${((matchedCourses / sqlCourses.length) * 100).toFixed(1)}%)`);

  console.log("\n3. CHAPTERS / TOPICS:");
  console.log(`   - SQL Backup Topics Extracted: ${sqlTopics.length}`);
  console.log(`   - Current Database Chapters:   ${dbChapters.length}`);

  console.log("\n4. LESSONS & VIDEO/DOCUMENT CONTENT:");
  console.log(`   - SQL Backup Lessons Extracted:  ${sqlLessons.length}`);
  console.log(`   - Current Database Lessons:      ${dbLessons.length}`);
  const vimeoLessons = dbLessons.filter((l) => l.vimeoVideoId);
  const driveLessons = dbLessons.filter((l) => l.driveFileId);
  console.log(`   - DB Lessons with Vimeo Video ID: ${vimeoLessons.length}`);
  console.log(`   - DB Lessons with Google Drive ID: ${driveLessons.length}`);

  console.log("\n5. STUDENT ENROLLMENTS:");
  console.log(`   - SQL Backup Enrollment Records: ${sqlEnrollments.length}`);
  console.log(`   - Current Database Enrollments:   ${dbEnrollments.length}`);

  console.log("\n================================================================================");
  console.log(" 🔍 SAMPLE DATA INTEGRITY CHECKS");
  console.log("================================================================================");

  console.log("\nSample 5 Courses from DB:");
  dbCourses.slice(0, 5).forEach((c, idx) => {
    console.log(`   ${idx + 1}. [${c.slug}] "${c.title}" (Price: LKR ${c.price}, Image: ${c.coverImage})`);
  });

  console.log("\nSample 5 Users from DB:");
  dbUsers.slice(0, 5).forEach((u, idx) => {
    console.log(`   ${idx + 1}. ID: ${u.studentId || 'N/A'} | Email: ${u.email} | Role: ${u.role}`);
  });

  console.log("\n================================================================================");
}

runAudit()
  .catch((e) => {
    console.error("Audit error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
