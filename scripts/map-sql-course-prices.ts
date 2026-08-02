import fs from 'fs';
import readline from 'readline';

async function parseSqlDump() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const posts = new Map<string, string>();
  const courseMeta = new Map<string, { priceType?: string; price?: string; regularPrice?: string; salePrice?: string }>();

  for await (const line of rl) {
    if (line.startsWith("INSERT INTO `wp_posts` VALUES")) {
      // Split tuples in single insert statement
      const tuples = line.split("),(");
      for (const t of tuples) {
        const parts = t.split(",");
        if (parts.length > 5) {
          const id = parts[0].replace(/^[^\d]*/, "");
          const title = parts[4] ? parts[4].replace(/^'|'$/g, "").trim() : "";
          const postType = parts[parts.length - 3] ? parts[parts.length - 3].replace(/^'|'$/g, "").trim() : "";
          
          if (title && (postType === 'courses' || postType === 'product' || postType === 'page')) {
            posts.set(id, title);
          }
        }
      }
    }

    if (line.startsWith("INSERT INTO `wp_postmeta` VALUES")) {
      const tuples = line.split("),(");
      for (const t of tuples) {
        if (t.includes('_price') || t.includes('_regular_price') || t.includes('_sale_price') || t.includes('_tutor_course_price_type')) {
          const m = t.match(/(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'/);
          if (m) {
            const postId = m[2];
            const key = m[3];
            const val = m[4];

            if (!courseMeta.has(postId)) {
              courseMeta.set(postId, {});
            }
            const record = courseMeta.get(postId)!;
            if (key === '_tutor_course_price_type') record.priceType = val;
            if (key === '_price') record.price = val;
            if (key === '_regular_price') record.regularPrice = val;
            if (key === '_sale_price') record.salePrice = val;
          }
        }
      }
    }
  }

  console.log("\nFound course meta records count:", courseMeta.size);
  const foundPrices: any[] = [];
  for (const [postId, meta] of courseMeta.entries()) {
    const title = posts.get(postId) || `Post #${postId}`;
    foundPrices.push({
      postId,
      title,
      priceType: meta.priceType || 'N/A',
      currentPrice: meta.price || '0',
      regularPrice: meta.regularPrice || meta.price || '0',
      salePrice: meta.salePrice || 'N/A'
    });
  }

  console.table(foundPrices.slice(0, 30));
}

parseSqlDump();
