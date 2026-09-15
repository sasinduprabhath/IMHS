import fs from "fs";
import path from "path";
import readline from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncEnrollmentsFromBackup() {
  const defaultLocalPath = path.join(process.cwd(), "u328662350_iIq7V_original.sql");
  const defaultCwdPath = path.join(process.cwd(), "u328662350_iIq7V.sql");
  const serverPathOriginal = "/home/imhsedu.com/public_html/u328662350_iIq7V_original.sql";
  const serverPathClean = "/home/imhsedu.com/public_html/u328662350_iIq7V.sql";
  const sqlPath =
    process.argv[2] ||
    process.env.SQL_BACKUP_PATH ||
    (fs.existsSync(defaultLocalPath)
      ? defaultLocalPath
      : fs.existsSync(defaultCwdPath)
      ? defaultCwdPath
      : fs.existsSync(serverPathOriginal)
      ? serverPathOriginal
      : serverPathClean);

  console.log("=========================================================================");
  console.log(" 🎓 SYNC STUDENT ENROLLMENTS & BLOCKED STATUSES FROM SQL BACKUP");
  console.log("=========================================================================");
  console.log(`📁 Source SQL Dump File: ${sqlPath}`);

  if (!fs.existsSync(sqlPath)) {
    console.error("❌ ERROR: SQL file not found at:", sqlPath);
    console.error("👉 Please provide the SQL file path as an argument, e.g.:");
    console.error("   npx tsx scripts/sync-enrollments-from-backup.ts /path/to/backup.sql");
    process.exit(1);
  }

  const usersMap = new Map<string, { email: string; name: string }>();
  const coursesMap = new Map<string, { title: string; slug: string }>();
  const enrollmentPosts: Array<{
    id: string;
    authorId: string;
    status: string;
    parentId: string;
  }> = [];

  console.log("⚡ Step 1: Scanning SQL dump file line-by-line...");

  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let currentTarget: string | null = null;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith("INSERT INTO `wp_users`")) {
      currentTarget = "wp_users";
    } else if (trimmed.startsWith("INSERT INTO `wp_posts`")) {
      currentTarget = "wp_posts";
    } else if (trimmed.startsWith("INSERT INTO `") || trimmed.startsWith("CREATE TABLE") || trimmed.startsWith("ALTER TABLE")) {
      currentTarget = null;
    }

    // 1. wp_users (ID -> email)
    if (currentTarget === "wp_users" && trimmed.startsWith("(")) {
      const match = trimmed.match(/^\(\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*'([^']*)'\)/);
      if (match) {
        const wpId = match[1];
        const email = match[5].trim().toLowerCase();
        const displayName = match[10].trim() || match[2].trim();
        if (email && email.includes("@")) {
          usersMap.set(wpId, { email, name: displayName });
        }
      }
    }

    // 2. wp_posts (courses & tutor_enrolled)
    if (currentTarget === "wp_posts" && (trimmed.startsWith("(") || trimmed.includes("INSERT INTO"))) {
      const items = trimmed.split("),(");
      for (const item of items) {
        const match = item.match(/^\(?\s*(\d+),\s*(\d+),\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*(\d+),\s*'([^']*)',\s*(\d+),\s*'([^']*)'/);
        if (match) {
          const id = match[1];
          const authorId = match[2];
          const title = match[4];
          const status = match[6];
          const slug = match[7];
          const parentId = match[8];
          const type = match[11];

          if (type === "courses" || type === "course") {
            coursesMap.set(id, { title, slug });
          } else if (type === "tutor_enrolled" || type === "tutor_enrolled_courses") {
            enrollmentPosts.push({ id, authorId, status, parentId });
          }
        }
      }
    }
  }

  // Sort chronologically by post ID so later changes (e.g. cancellations or restores) take final precedence
  enrollmentPosts.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  console.log(`✅ Scan Complete! Found:`);
  console.log(`   - Users in dump       : ${usersMap.size}`);
  console.log(`   - Courses in dump     : ${coursesMap.size}`);
  console.log(`   - Enrollment records  : ${enrollmentPosts.length}`);

  console.log("\n⚡ Step 2: Synchronizing Enrollments into Prisma Database...");

  let activeCount = 0;
  let frozenCount = 0;
  let skippedCount = 0;
  const frozenStudentIds = new Set<string>();

  for (const en of enrollmentPosts) {
    const wpUser = usersMap.get(en.authorId);
    if (!wpUser) {
      skippedCount++;
      continue;
    }

    const wpCourse = coursesMap.get(en.parentId);
    if (!wpCourse) {
      skippedCount++;
      continue;
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: wpUser.email },
    });
    if (!dbUser) {
      skippedCount++;
      continue;
    }

    const dbCourse = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: wpCourse.slug },
          { title: wpCourse.title },
        ],
      },
    });

    if (!dbCourse) {
      skippedCount++;
      continue;
    }

    // In Tutor LMS: 'cancel' or 'trash' means access is blocked/revoked
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
      activeCount++;
    } else {
      frozenCount++;
      frozenStudentIds.add(dbUser.id);
    }
  }

  console.log("\n=========================================================================");
  console.log(" 🎉 ENROLLMENT SYNCHRONIZATION SUMMARY");
  console.log("=========================================================================");
  console.log(`✅ Active Enrollments Granted     : ${activeCount}`);
  console.log(`🔒 Frozen / Blocked Course Access : ${frozenCount}`);
  console.log(`👤 Students with Blocked Courses  : ${frozenStudentIds.size}`);
  console.log(`⚠️ Unlinked / Skipped Rows       : ${skippedCount}`);
  console.log("=========================================================================\n");
}

syncEnrollmentsFromBackup()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
