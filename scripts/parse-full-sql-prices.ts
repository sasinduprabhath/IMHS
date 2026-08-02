import fs from 'fs';
import readline from 'readline';

async function parseFullSqlPrices() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const posts = new Map<string, string>();
  const meta = new Map<string, { priceType?: string; price?: string; regular?: string; sale?: string }>();

  for await (const line of rl) {
    if (line.includes('_regular_price') || line.includes('_sale_price') || line.includes('_price') || line.includes('_tutor_course_price_type')) {
      const tuples = line.split("),(");
      for (const t of tuples) {
        if (t.includes('_regular_price') || t.includes('_sale_price') || t.includes('_price') || t.includes('_tutor_course_price_type')) {
          // Format: (meta_id, post_id, 'meta_key', 'meta_value'
          const parts = t.split(",");
          if (parts.length >= 4) {
            const postId = parts[1].trim();
            const key = parts[2].replace(/^'|'$/g, "").trim();
            const val = parts[3] ? parts[3].replace(/^'|'$/g, "").replace(/\);?$/, "").trim() : "";

            if (['_regular_price', '_sale_price', '_price', '_tutor_course_price_type'].includes(key)) {
              if (!meta.has(postId)) {
                meta.set(postId, {});
              }
              const obj = meta.get(postId)!;
              if (key === '_tutor_course_price_type') obj.priceType = val;
              if (key === '_price') obj.price = val;
              if (key === '_regular_price') obj.regular = val;
              if (key === '_sale_price') obj.sale = val;
            }
          }
        }
      }
    }

    if (line.includes("INSERT INTO `wp_posts`")) {
      const tuples = line.split("),(");
      for (const t of tuples) {
        const parts = t.split(",");
        if (parts.length > 5) {
          const id = parts[0].replace(/^[^\d]*/, "");
          const title = parts[4] ? parts[4].replace(/^'|'$/g, "").trim() : "";
          if (id && title) {
            posts.set(id, title);
          }
        }
      }
    }
  }

  console.log("\n==========================================================================");
  console.log("=== COURSE PRICES EXTRACTED FROM u328662350_iIq7V.sql DUMP FILE ===");
  console.log("==========================================================================\n");

  const results: any[] = [];
  for (const [postId, data] of meta.entries()) {
    if (data.price || data.regular || data.sale || data.priceType) {
      const title = posts.get(postId) || `Post ID #${postId}`;
      results.push({
        PostID: postId,
        CourseTitle: title,
        PriceType: data.priceType || 'paid',
        CurrentPrice: data.price ? `LKR ${data.price}` : (data.regular ? `LKR ${data.regular}` : '0'),
        RegularPrice: data.regular ? `LKR ${data.regular}` : (data.price ? `LKR ${data.price}` : '0'),
        SalePrice: data.sale ? `LKR ${data.sale}` : 'None',
      });
    }
  }

  console.table(results);
}

parseFullSqlPrices();
