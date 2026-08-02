import fs from 'fs';
import readline from 'readline';

async function scanSqlForCoursePrices() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  if (!fs.existsSync(sqlPath)) {
    console.log("SQL file not found at:", sqlPath);
    return;
  }

  console.log("Scanning 413MB SQL file for price meta keys and course price values...");
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const priceMatches: string[] = [];
  const metaKeysFound = new Set<string>();

  for await (const line of rl) {
    if (line.includes('_price') || line.includes('_regular_price') || line.includes('_sale_price') || line.includes('tutor_course_price') || line.includes('_course_price')) {
      // Find matches in postmeta inserts
      const matches = line.match(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g);
      if (matches) {
        for (const m of matches) {
          if (m.includes('price')) {
            metaKeysFound.add(m);
            if (priceMatches.length < 30) {
              priceMatches.push(m);
            }
          }
        }
      }
    }
  }

  console.log("Found Meta Keys related to price:", Array.from(metaKeysFound).slice(0, 20));
  console.log("Sample Price entries found:", priceMatches.slice(0, 15));
}

scanSqlForCoursePrices();
