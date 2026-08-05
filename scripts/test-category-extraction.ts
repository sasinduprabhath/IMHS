import fs from "fs";
import readline from "readline";

async function testCategoryExtraction() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const termsMap = new Map<string, string>(); // term_id -> term_name
  const termTaxonomyMap = new Map<string, { termId: string; taxonomy: string }>(); // term_tax_id -> info
  const postCategoryRel = new Map<string, string[]>(); // coursePostId -> termTaxIds

  let currentTarget: string | null = null;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith("INSERT INTO `wp_terms`")) currentTarget = "wp_terms";
    else if (trimmed.startsWith("INSERT INTO `wp_term_taxonomy`")) currentTarget = "wp_term_taxonomy";
    else if (trimmed.startsWith("INSERT INTO `wp_term_relationships`")) currentTarget = "wp_term_relationships";
    else if (trimmed.startsWith("INSERT INTO `")) currentTarget = null;

    if (currentTarget === "wp_terms" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*'([^']*)',\s*'([^']*)',\s*\d+\)/g));
      for (const m of matches) {
        termsMap.set(m[1], m[2]);
      }
    }

    if (currentTarget === "wp_term_taxonomy" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)'/g));
      for (const m of matches) {
        termTaxonomyMap.set(m[1], { termId: m[2], taxonomy: m[3] });
      }
    }

    if (currentTarget === "wp_term_relationships" && trimmed.startsWith("(")) {
      const matches = Array.from(trimmed.matchAll(/\((\d+),\s*(\d+),\s*\d+\)/g));
      for (const m of matches) {
        const postId = m[1];
        const termTaxId = m[2];
        if (!postCategoryRel.has(postId)) postCategoryRel.set(postId, []);
        postCategoryRel.get(postId)!.push(termTaxId);
      }
    }
  }

  console.log(`=========================================================================`);
  console.log(` 🏷️ CATEGORY TAXONOMY EXTRACTION TEST RESULTS`);
  console.log(`=========================================================================`);
  console.log(`- Terms Parsed: ${termsMap.size}`);
  console.log(`- Term Taxonomies Parsed: ${termTaxonomyMap.size}`);
  console.log(`- Post Relationships Mapped: ${postCategoryRel.size}`);

  let count = 0;
  for (const [postId, taxIds] of postCategoryRel.entries()) {
    const categoryNames: string[] = [];
    for (const tid of taxIds) {
      const taxInfo = termTaxonomyMap.get(tid);
      if (taxInfo && (taxInfo.taxonomy === "course-category" || taxInfo.taxonomy === "category" || taxInfo.taxonomy === "course-tag")) {
        const name = termsMap.get(taxInfo.termId);
        if (name) categoryNames.push(name);
      }
    }

    if (categoryNames.length > 0) {
      console.log(`  Course Post ID ${postId}: Categories = [${categoryNames.join(", ")}]`);
      count++;
      if (count >= 15) break;
    }
  }
}

testCategoryExtraction();
