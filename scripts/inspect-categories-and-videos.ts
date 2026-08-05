import fs from "fs";
import readline from "readline";

async function inspectCategoriesAndVideos() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const termsMap = new Map<string, string>(); // term_id -> name
  const termTaxonomyMap = new Map<string, { termId: string; taxonomy: string }>(); // term_taxonomy_id -> { termId, taxonomy }
  const courseCategoriesMap = new Map<string, string[]>(); // coursePostId -> categoryNames[]

  const lessonMetaMap = new Map<string, Map<string, string>>(); // lessonPostId -> (key -> val)

  let currentTable: string | null = null;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith("INSERT INTO `wp_terms`")) {
      currentTable = "wp_terms";
    } else if (trimmed.startsWith("INSERT INTO `wp_term_taxonomy`")) {
      currentTable = "wp_term_taxonomy";
    } else if (trimmed.startsWith("INSERT INTO `wp_term_relationships`")) {
      currentTable = "wp_term_relationships";
    } else if (trimmed.startsWith("INSERT INTO `wp_postmeta`")) {
      currentTable = "wp_postmeta";
    } else if (trimmed.startsWith("INSERT INTO `")) {
      currentTable = null;
    }

    // 1. wp_terms: (term_id, name, slug, term_group)
    if (currentTable === "wp_terms" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*'([^']*)',\s*'([^']*)',\s*\d+\)/g));
      for (const m of matches) {
        termsMap.set(m[1], m[2]);
      }
    }

    // 2. wp_term_taxonomy: (term_taxonomy_id, term_id, taxonomy, ...)
    if (currentTable === "wp_term_taxonomy" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)'/g));
      for (const m of matches) {
        termTaxonomyMap.set(m[1], { termId: m[2], taxonomy: m[3] });
      }
    }

    // 3. wp_term_relationships: (object_id, term_taxonomy_id, term_order)
    if (currentTable === "wp_term_relationships" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*\d+\)/g));
      for (const m of matches) {
        const objectId = m[1]; // Course Post ID
        const termTaxId = m[2];
        const taxInfo = termTaxonomyMap.get(termTaxId);
        if (taxInfo && (taxInfo.taxonomy === "course-category" || taxInfo.taxonomy === "category" || taxInfo.taxonomy === "course-tag")) {
          const categoryName = termsMap.get(taxInfo.termId);
          if (categoryName) {
            if (!courseCategoriesMap.has(objectId)) courseCategoriesMap.set(objectId, []);
            courseCategoriesMap.get(objectId)!.push(categoryName);
          }
        }
      }
    }

    // 4. wp_postmeta for video and drive links
    if (currentTable === "wp_postmeta" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];

        if (key.includes("video") || key.includes("attachment") || key.includes("vimeo") || key.includes("drive") || key.includes("file")) {
          if (!lessonMetaMap.has(postId)) lessonMetaMap.set(postId, new Map());
          lessonMetaMap.get(postId)!.set(key, val);
        }
      }
    }
  }

  console.log("=========================================================================");
  console.log(` 🏷️ EXTRACTED CATEGORIES & LESSON MEDIA FROM SQL DUMP`);
  console.log("=========================================================================");
  console.log(`- Terms Found: ${termsMap.size}`);
  console.log(`- Course Categories Mapped: ${courseCategoriesMap.size} courses`);
  console.log(`- Lesson Meta Entries with Media: ${lessonMetaMap.size} lessons`);

  console.log("\n📋 Sample Course Categories:");
  let cCount = 0;
  for (const [id, cats] of courseCategoriesMap.entries()) {
    console.log(`  Course Post ${id}: Categories = [${cats.join(", ")}]`);
    cCount++;
    if (cCount >= 10) break;
  }

  console.log("\n📋 Sample Lesson Media Meta:");
  let lCount = 0;
  for (const [id, meta] of lessonMetaMap.entries()) {
    const entries = Array.from(meta.entries()).map(([k, v]) => `${k} => ${v.slice(0, 80)}`);
    console.log(`  Lesson ${id}: Meta = { ${entries.join(" | ")} }`);
    lCount++;
    if (lCount >= 10) break;
  }
}

inspectCategoriesAndVideos();
