import fs from "fs";
import readline from "readline";

async function scanTables() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const tableCounts = new Map<string, number>();

  for await (const line of rl) {
    if (line.startsWith("INSERT INTO `")) {
      const match = line.match(/^INSERT INTO `([^`]+)`/);
      if (match) {
        const table = match[1];
        // Count tuples by counting '),' or estimate
        const count = (line.match(/\),\s*\(/g) || []).length + 1;
        tableCounts.set(table, (tableCounts.get(table) || 0) + count);
      }
    }
  }

  console.log("=========================================================================");
  console.log(" 📊 SQL DUMP ALL TABLE SUMMARY");
  console.log("=========================================================================");
  for (const [table, count] of tableCounts.entries()) {
    if (table.startsWith("wp_")) {
      console.log(`- ${table}: ~${count} records`);
    }
  }
}

scanTables();
