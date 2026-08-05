import fs from "fs";
import readline from "readline";

async function inspectAllPrices() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const priceMap = new Map<string, { price?: number; regularPrice?: number; salePrice?: number }>();
  const metaRegex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;

  for await (const line of rl) {
    if (line.includes("_price") || line.includes("_regular_price") || line.includes("_sale_price")) {
      const matches = Array.from(line.matchAll(metaRegex));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const valStr = m[4];
        const numVal = Math.round(parseFloat(valStr) || 0);

        if (["_price", "_regular_price", "_sale_price"].includes(key) && numVal > 0) {
          if (!priceMap.has(postId)) {
            priceMap.set(postId, {});
          }
          const record = priceMap.get(postId)!;
          if (key === "_price") record.price = numVal;
          if (key === "_regular_price") record.regularPrice = numVal;
          if (key === "_sale_price") record.salePrice = numVal;
        }
      }
    }
  }

  console.log(`=========================================================================`);
  console.log(` 💰 EXTRACTED COURSE PRICES FROM SQL DUMP (${priceMap.size} Posts)`);
  console.log(`=========================================================================`);

  for (const [postId, p] of priceMap.entries()) {
    console.log(`Post ID: ${postId} -> Price: ${p.price || p.regularPrice} | Original: ${p.regularPrice}`);
  }
}

inspectAllPrices();
