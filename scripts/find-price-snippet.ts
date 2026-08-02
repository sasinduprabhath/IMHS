import fs from 'fs';
import readline from 'readline';

async function snippet() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('_regular_price') || line.includes('_tutor_course_price_type')) {
      const idx = line.indexOf('_regular_price');
      if (idx !== -1) {
        console.log("EXACT SNIPPET AROUND REGULAR_PRICE:", line.substring(Math.max(0, idx - 50), Math.min(line.length, idx + 100)));
      }
      const idx2 = line.indexOf('_tutor_course_price_type');
      if (idx2 !== -1) {
        console.log("EXACT SNIPPET AROUND TUTOR_PRICE_TYPE:", line.substring(Math.max(0, idx2 - 50), Math.min(line.length, idx2 + 100)));
      }
      break;
    }
  }
}

snippet();
