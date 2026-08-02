import fs from 'fs';
import readline from 'readline';

async function listTables() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const createTables: string[] = [];
  for await (const line of rl) {
    if (line.includes('CREATE TABLE')) {
      createTables.push(line);
    }
  }

  console.log("Tables in u328662350_iIq7V.sql:", createTables);
}

listTables();
