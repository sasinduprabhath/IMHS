import fs from 'fs';
import readline from 'readline';

async function scanRawPostmeta() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('wp_postmeta') && (line.includes('_regular_price') || line.includes('_tutor_course_price_type'))) {
      console.log("FOUND POSTMETA LINE LENGTH:", line.length);
      const matches = line.match(/\(\d+,\d+,'[^']+',[^)]+\)/g);
      if (matches) {
        console.log("TUPLE MATCHES SAMPLE:", matches.filter(m => m.includes('price')).slice(0, 10));
      } else {
        console.log("NO TUPLE MATCH, LINE HEAD:", line.substring(0, 300));
      }
      break;
    }
  }
}

scanRawPostmeta();
