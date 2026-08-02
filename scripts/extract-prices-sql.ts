import fs from 'fs';
import readline from 'readline';

async function extractPricesFromSql() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const courseTitles = new Map<string, string>();
  const coursePrices = new Map<string, { regular?: string; sale?: string; price?: string; priceType?: string }>();

  for await (const line of rl) {
    // 1. Collect Post titles from wp_posts
    if (line.includes("INSERT INTO `wp_posts` VALUES")) {
      const rows = line.split("),(");
      for (const r of rows) {
        // match (ID, post_author, post_date, ..., post_title, ..., post_type)
        const parts = r.split("','");
        if (parts.length > 5) {
          const firstPart = parts[0]; // contains (ID, author...
          const idMatch = firstPart.match(/(\d+)/);
          const id = idMatch ? idMatch[1] : null;
          const title = parts[3] ? parts[3].trim() : "";
          if (id && title) {
            courseTitles.set(id, title);
          }
        }
      }
    }

    // 2. Collect Meta from wp_postmeta
    if (line.includes("INSERT INTO `wp_postmeta` VALUES")) {
      // split by tuples
      const chunks = line.split("),(");
      for (const chunk of chunks) {
        if (
          chunk.includes('_regular_price') ||
          chunk.includes('_sale_price') ||
          chunk.includes('_price') ||
          chunk.includes('_tutor_course_price_type')
        ) {
          // match tuple: (meta_id, post_id, 'meta_key', 'meta_value')
          const m = chunk.match(/(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'/);
          if (m) {
            const postId = m[2];
            const key = m[3];
            const val = m[4];

            if (!coursePrices.has(postId)) {
              coursePrices.set(postId, {});
            }
            const record = coursePrices.get(postId)!;
            if (key === '_regular_price') record.regular = val;
            if (key === '_sale_price') record.sale = val;
            if (key === '_price') record.price = val;
            if (key === '_tutor_course_price_type') record.priceType = val;
          }
        }
      }
    }
  }

  console.log("\nFound course price records count in u328662350_iIq7V.sql:", coursePrices.size);
  const tableData: any[] = [];
  for (const [postId, p] of coursePrices.entries()) {
    if (p.regular || p.sale || p.price || p.priceType) {
      tableData.push({
        PostID: postId,
        CourseTitle: courseTitles.get(postId) || `Post #${postId}`,
        PriceType: p.priceType || 'paid',
        CurrentPrice: p.price ? `LKR ${p.price}` : 'Free / 0',
        RegularPrice: p.regular ? `LKR ${p.regular}` : (p.price ? `LKR ${p.price}` : '0'),
        SalePrice: p.sale ? `LKR ${p.sale}` : 'None',
      });
    }
  }

  console.table(tableData.slice(0, 40));
}

extractPricesFromSql();
