import fs from 'fs';
import readline from 'readline';

async function dumpAllSqlPrices() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const posts = new Map<string, string>();
  const meta = new Map<string, { priceType?: string; price?: string; regular?: string; sale?: string }>();

  for await (const line of rl) {
    if (line.includes('_price') || line.includes('_regular_price') || line.includes('_sale_price') || line.includes('_tutor_course_price_type')) {
      const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;
      const matches = Array.from(line.matchAll(regex));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];

        if (['_price', '_regular_price', '_sale_price', '_tutor_course_price_type'].includes(key)) {
          if (!meta.has(postId)) {
            meta.set(postId, {});
          }
          const rec = meta.get(postId)!;
          if (key === '_tutor_course_price_type') rec.priceType = val;
          if (key === '_price') rec.price = val;
          if (key === '_regular_price') rec.regular = val;
          if (key === '_sale_price') rec.sale = val;
        }
      }
    }

    if (line.includes('wp_posts') || line.includes('INSERT INTO `wp_posts`')) {
      const postMatches = Array.from(line.matchAll(/\((\d+),\s*\d+,\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)'/g));
      for (const m of postMatches) {
        const id = m[1];
        const title = m[2];
        if (id && title && title.length > 1) {
          posts.set(id, title);
        }
      }
    }
  }

  console.log("\n=========================================================================================");
  console.log(`=== FOUND ${meta.size} POSTS WITH PRICE METADATA IN u328662350_iIq7V.sql ===`);
  console.log("=========================================================================================\n");

  const results: any[] = [];
  for (const [postId, data] of meta.entries()) {
    const title = posts.get(postId) || `Post ID #${postId}`;
    results.push({
      PostID: postId,
      Title: title,
      PriceType: data.priceType || 'paid',
      CurrentPrice: data.price ? `LKR ${data.price}` : '0',
      RegularPrice: data.regular ? `LKR ${data.regular}` : (data.price ? `LKR ${data.price}` : '0'),
      SalePrice: data.sale ? `LKR ${data.sale}` : 'None',
    });
  }

  console.table(results);
}

dumpAllSqlPrices();
