import fs from 'fs';
import readline from 'readline';

async function inspectAllTables() {
  console.log("=== COMPREHENSIVE ANALYSIS OF u328662350_iIq7V.sql DUMP FILE ===");
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';

  if (!fs.existsSync(sqlPath)) {
    console.error("SQL file not found.");
    return;
  }

  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const tableCounts = new Map<string, number>();

  for await (const line of rl) {
    if (line.includes("INSERT INTO `")) {
      const match = line.match(/INSERT INTO `([^`]+)`/);
      if (match) {
        const tableName = match[1];
        const count = (line.match(/\),\(/g) || []).length + 1;
        tableCounts.set(tableName, (tableCounts.get(tableName) || 0) + count);
      }
    }
  }

  console.log("\n📊 MAJOR TABLES & RECORD COUNTS IN u328662350_iIq7V.sql:");
  const tableData: any[] = [];
  for (const [table, count] of tableCounts.entries()) {
    tableData.push({ TableName: table, TotalRecords: count });
  }

  tableData.sort((a, b) => b.TotalRecords - a.TotalRecords);
  console.table(tableData.slice(0, 40));
}

inspectAllTables();
