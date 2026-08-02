import fs from 'fs';
import readline from 'readline';
import { prisma } from '../lib/prisma';

async function importCoursePricesToDb() {
  console.log("=== STARTING IMPORT OF COURSE PRICES FROM u328662350_iIq7V.sql ===");
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';

  if (!fs.existsSync(sqlPath)) {
    console.error("SQL dump file not found at:", sqlPath);
    return;
  }

  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const posts = new Map<string, string>();
  const metaPrices = new Map<string, { price?: number; regularPrice?: number; salePrice?: number }>();

  const metaRegex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;

  for await (const line of rl) {
    if (line.includes('_price') || line.includes('_regular_price') || line.includes('_sale_price')) {
      const matches = Array.from(line.matchAll(metaRegex));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const valStr = m[4];
        const numVal = Math.round(parseFloat(valStr) || 0);

        if (['_price', '_regular_price', '_sale_price'].includes(key) && numVal > 0) {
          if (!metaPrices.has(postId)) {
            metaPrices.set(postId, {});
          }
          const record = metaPrices.get(postId)!;
          if (key === '_price') record.price = numVal;
          if (key === '_regular_price') record.regularPrice = numVal;
          if (key === '_sale_price') record.salePrice = numVal;
        }
      }
    }

    if (line.includes('wp_posts')) {
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

  console.log(`Parsed ${metaPrices.size} price records from SQL dump.`);

  // Load existing courses from Prisma
  const dbCourses = await prisma.course.findMany();
  console.log(`Found ${dbCourses.length} courses in active Prisma database.`);

  let updatedCount = 0;

  for (const course of dbCourses) {
    const courseTitleLower = course.title.toLowerCase().trim();
    let bestMatchPrice: { price?: number; regularPrice?: number; salePrice?: number } | null = null;

    // Search for match in SQL data
    for (const [postId, meta] of metaPrices.entries()) {
      const sqlTitle = (posts.get(postId) || "").toLowerCase().trim();

      if (!sqlTitle) continue;

      if (
        courseTitleLower === sqlTitle ||
        courseTitleLower.includes(sqlTitle) ||
        sqlTitle.includes(courseTitleLower)
      ) {
        if (meta.price || meta.regularPrice || meta.salePrice) {
          bestMatchPrice = meta;
          break;
        }
      }
    }

    // Fallback default pricing if specific batch matched
    if (!bestMatchPrice) {
      if (courseTitleLower.includes("modern pharmacy course")) {
        bestMatchPrice = { price: 4500, regularPrice: 6000 };
      } else if (courseTitleLower.includes("forensic pharmacy")) {
        bestMatchPrice = { price: 9000, regularPrice: 15000 };
      } else if (courseTitleLower.includes("fast track revision")) {
        if (courseTitleLower.includes("phase 01/02/03") || courseTitleLower.includes("full")) {
          bestMatchPrice = { price: 32000, regularPrice: 45000 };
        } else if (courseTitleLower.includes("phase 03")) {
          bestMatchPrice = { price: 12000, regularPrice: 18000 };
        } else if (courseTitleLower.includes("phase 02")) {
          bestMatchPrice = { price: 10000, regularPrice: 15000 };
        } else if (courseTitleLower.includes("phase 01")) {
          bestMatchPrice = { price: 10000, regularPrice: 15000 };
        }
      } else if (courseTitleLower.includes("certificate course in pharmacy practice")) {
        bestMatchPrice = { price: 25000, regularPrice: 35000 };
      }
    }

    if (bestMatchPrice) {
      const finalPrice = bestMatchPrice.price || bestMatchPrice.salePrice || bestMatchPrice.regularPrice || 4500;
      const finalOriginalPrice = bestMatchPrice.regularPrice && bestMatchPrice.regularPrice > finalPrice
        ? bestMatchPrice.regularPrice
        : Math.round(finalPrice * 1.35);

      await prisma.course.update({
        where: { id: course.id },
        data: {
          price: finalPrice,
          originalPrice: finalOriginalPrice,
        },
      });

      console.log(`✅ Updated "${course.title}" -> Price: LKR ${finalPrice} | Original: LKR ${finalOriginalPrice}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 IMPORT COMPLETED! Successfully updated ${updatedCount} courses with prices in MySQL DB.`);
}

importCoursePricesToDb()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
