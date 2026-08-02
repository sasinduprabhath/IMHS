import fs from 'fs';
import readline from 'readline';

async function getRaw() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('_regular_price')) {
      const regex = /\(\d+,\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;
      let m;
      let count = 0;
      while ((m = regex.exec(line)) !== null && count < 20) {
        console.log(`Meta ID: ${m[0]} -> Post ID: ${m[1]}, Key: ${m[2]}, Val: ${m[3]}`);
        count++;
      }
      break;
    }
  }
}

getRaw();
