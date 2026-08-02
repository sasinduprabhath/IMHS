import fs from "fs";
import readline from "readline";

async function parseExactWpTerms() {
  const sqlFilePath = "C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql";

  const fileStream = fs.createReadStream(sqlFilePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const terms: { id: string; name: string; slug: string }[] = [];
  const categoryTaxonomies: { termTaxId: string; termId: string; taxonomy: string; count: number }[] = [];

  let inWpTerms = false;
  let inWpTermTax = false;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_terms`")) {
      inWpTerms = true;
    }
    if (inWpTerms) {
      const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*\d+\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        terms.push({ id: match[1], name: match[2], slug: match[3] });
      }
      if (line.endsWith(";")) {
        inWpTerms = false;
      }
    }

    if (line.includes("INSERT INTO `wp_term_taxonomy`")) {
      inWpTermTax = true;
    }
    if (inWpTermTax) {
      const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'[^']*',\s*\d+,\s*(\d+)\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        categoryTaxonomies.push({
          termTaxId: match[1],
          termId: match[2],
          taxonomy: match[3],
          count: parseInt(match[4], 10),
        });
      }
      if (line.endsWith(";")) {
        inWpTermTax = false;
      }
    }
  }

  console.log(`\nFound ${terms.length} terms in wp_terms and ${categoryTaxonomies.length} entries in wp_term_taxonomy.\n`);

  console.log("=======================================================");
  console.log("  ALL COURSE CATEGORIES & TERMS IN SQL DUMP");
  console.log("=======================================================\n");

  for (const tax of categoryTaxonomies) {
    const term = terms.find((t) => t.id === tax.termId);
    if (term) {
      console.log(`📂 [Taxonomy: ${tax.taxonomy}] ➔ Name: "${term.name}" | Slug: "${term.slug}" | Count: ${tax.count}`);
    }
  }

  if (categoryTaxonomies.length === 0 || categoryTaxonomies.filter((t) => t.taxonomy.includes("course")).length === 0) {
    console.log("\n--- Raw wp_terms dump ---");
    terms.forEach((t) => console.log(`Term #${t.id}: Name: "${t.name}" (slug: ${t.slug})`));
  }
}

parseExactWpTerms().catch(console.error);
