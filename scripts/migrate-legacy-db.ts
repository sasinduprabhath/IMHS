import fs from "fs";
import path from "path";
import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function extractVimeoInfo(metaValue: string | null): { vimeoVideoId: string | null; driveFileId: string | null } {
  if (!metaValue) return { vimeoVideoId: null, driveFileId: null };

  const vimeoMatch = metaValue.match(/vimeo\.com\/(?:video\/)?([0-9]+)(?:\?h=([a-zA-Z0-9]+))?/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const hash = vimeoMatch[2];
    return {
      vimeoVideoId: hash ? `${videoId}/${hash}` : videoId,
      driveFileId: null,
    };
  }

  const driveMatch = metaValue.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      vimeoVideoId: null,
      driveFileId: driveMatch[1],
    };
  }

  return { vimeoVideoId: null, driveFileId: null };
}

async function main() {
  const defaultSqlPath = path.join(process.cwd(), "u328662350_iIq7V.sql");
  const fallbackPath = "C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql";
  const targetSqlPath =
    process.argv[2] ||
    process.env.SQL_BACKUP_PATH ||
    (fs.existsSync(defaultSqlPath) ? defaultSqlPath : fallbackPath);

  console.log("=========================================================================");
  console.log(" 🚀 STARTING FULL MASTER DATA SYNC & MIGRATION FOR IMHS CLINICAL PORTAL");
  console.log("=========================================================================");
  console.log(`📁 Source SQL Dump File: ${targetSqlPath}`);

  if (!fs.existsSync(targetSqlPath)) {
    console.error(`❌ ERROR: SQL file not found at path: ${targetSqlPath}`);
    console.error(`Usage: npx tsx scripts/migrate-legacy-db.ts /path/to/backup.sql`);
    process.exit(1);
  }

  console.log("⚡ Reading and parsing SQL dump file line by line...\n");

  const postMetaThumbnail: Map<string, string> = new Map(); // course_id -> attachment_id
  const attachedFiles: Map<string, string> = new Map(); // att_id -> relative file path
  const termNames: Map<string, string> = new Map(); // term_id -> term_name
  const termTaxonomies: Map<string, string> = new Map(); // term_taxonomy_id -> term_id

  const wpUsers: { id: string; login: string; pass: string; email: string; name: string; phone?: string }[] = [];

  const fileStream = fs.createReadStream(targetSqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;

    // 1. Parse wp_users
    if (line.includes("INSERT INTO `wp_users`")) {
      const tuples = line.split(/\),\s*\(/);
      for (const t of tuples) {
        const match = t.match(/^\(?\s*(\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'/);
        if (match) {
          wpUsers.push({
            id: match[1],
            login: match[2],
            pass: match[3],
            email: match[4],
            name: match[5] || match[2],
          });
        }
      }
    }

    // 2. Parse wp_postmeta thumbnail & attached file
    if (line.includes("'_thumbnail_id'")) {
      const regex = /\((\d+),\s*(\d+),\s*'_thumbnail_id',\s*'(\d+)'\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        postMetaThumbnail.set(match[2], match[3]);
      }
    }

    if (line.includes("'_wp_attached_file'")) {
      const regex = /\((\d+),\s*(\d+),\s*'_wp_attached_file',\s*'([^']+)'\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        attachedFiles.set(match[2], match[3]);
      }
    }

    // 3. Parse wp_terms
    if (line.includes("INSERT INTO `wp_terms`")) {
      const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*\d+\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        termNames.set(match[1], match[2]);
      }
    }

    // 4. Parse wp_term_taxonomy
    if (line.includes("INSERT INTO `wp_term_taxonomy`")) {
      const regex = /\((\d+),\s*(\d+),\s*'([^']+)'/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[3].includes("course") || match[3].includes("category")) {
          termTaxonomies.set(match[1], match[2]);
        }
      }
    }
  }

  console.log(`✅ Parsed ${lineCount} lines from SQL dump.`);
  console.log(`- Users found in dump: ${wpUsers.length}`);
  console.log(`- Attached File Links found: ${attachedFiles.size}`);
  console.log(`- Course Thumbnail Mappings found: ${postMetaThumbnail.size}\n`);

  // Phase 1: Sync Users from SQL dump into Prisma DB
  console.log("🔄 Phase 1: Syncing Users & Passwords from SQL dump...");
  let syncedUsersCount = 0;
  for (const u of wpUsers) {
    if (!u.email || !u.email.includes("@")) continue;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: u.email }, { studentId: u.login.toUpperCase() }],
      },
    });

    if (!existingUser) {
      const role = u.login.toLowerCase().includes("admin") || u.email.toLowerCase().includes("admin") ? "ADMIN" : "STUDENT";
      await prisma.user.create({
        data: {
          email: u.email,
          studentId: u.login.toUpperCase(),
          name: u.name || u.login,
          phone: u.phone ?? "",          // phone required by schema; legacy WP users have none
          passwordHash: u.pass, // Intact $wp$ bcrypt hash
          role,
          status: "ACTIVE",
        },
      });
      syncedUsersCount++;
    }
  }
  console.log(`✅ Phase 1 Complete: Synced ${syncedUsersCount} new User accounts into database.\n`);

  // Phase 2: Update Prisma Database Courses with Categories & Cover Images
  console.log("🔄 Phase 2: Syncing Course Categories and Cover Images in Database...");
  const courses = await prisma.course.findMany();
  let updatedCoursesCount = 0;

  for (const course of courses) {
    const thumbId = postMetaThumbnail.get(course.id);
    let coverImage = course.coverImage;

    if (thumbId && attachedFiles.has(thumbId)) {
      const relativePath = attachedFiles.get(thumbId);
      coverImage = `https://imhsedu.com/wp-content/uploads/${relativePath}`;
    } else if (!coverImage) {
      coverImage = "https://imhsedu.com/wp-content/uploads/2025/09/Blue-and-White-Modern-Pharmacy-Lab-Poster-13.png";
    }

    let category = course.category || "Pharmacy Practice";
    const t = course.title.toLowerCase();
    const s = course.slug.toLowerCase();

    if (t.includes("manufacturing") || s.includes("manufacturing")) {
      category = "Pharmaceutical Manufacturing";
    } else if (t.includes("forensic") || s.includes("forensic")) {
      category = "Forensic Pharmacy";
    } else if (t.includes("pharmacology") || s.includes("pharmacology")) {
      category = "Pharmacology";
    } else if (t.includes("pharmaceutics") || s.includes("pharmaceutics")) {
      category = "Pharmaceutics";
    } else if (t.includes("revision") || t.includes("fast track") || s.includes("revision")) {
      category = "SLMC Exam Revision";
    } else if (t.includes("foundation") || s.includes("foundation")) {
      category = "Foundation in Pharmaceutical Science";
    } else if (t.includes("laboratory") || t.includes("lab") || s.includes("lab")) {
      category = "Medical Laboratory Technology";
    } else if (t.includes("modern pharmacy") || t.includes("slmc") || s.includes("modern-pharmacy")) {
      category = "Modern Pharmacy (SLMC Registration)";
    }

    await prisma.course.update({
      where: { id: course.id },
      data: {
        coverImage,
        category,
        enrollmentValidity: "Lifetime Access",
      },
    });
    updatedCoursesCount++;
  }

  console.log(`✅ Phase 2 Complete: Synced Categories & Cover Images for ${updatedCoursesCount} courses.\n`);

  // Phase 3: Ensure System Administrator (admin@imhs.edu.lk / admin123)
  console.log("🔄 Phase 3: Ensuring System Administrator Account...");
  const adminEmail = "admin@imhs.edu.lk";
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "IMHS System Administrator",
      phone: "+94778025050",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "IMHS System Administrator",
      email: adminEmail,
      phone: "+94778025050",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Phase 3 Complete: Ensured System Administrator (admin@imhs.edu.lk / admin123).\n");

  console.log("=========================================================================");
  console.log("  🎉 FULL DATA SYNC & MASTER MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("=========================================================================");
}

main()
  .catch((err) => {
    console.error("Migration Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
