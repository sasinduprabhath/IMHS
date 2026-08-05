import fs from "fs";
import readline from "readline";

async function inspectUsersLines() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let printNext = 0;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_users`")) {
      printNext = 15;
    }
    if (printNext > 0) {
      console.log(`[USER_LINE] ${line}`);
      printNext--;
    }
  }
}

inspectUsersLines();
