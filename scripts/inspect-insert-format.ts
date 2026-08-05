import fs from "fs";
import readline from "readline";

async function inspectInsertFormats() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_users`")) {
      console.log("=== WP_USERS LINE SAMPLE ===");
      console.log(line.slice(0, 500));
    }
    if (line.includes("INSERT INTO `wp_usermeta`")) {
      console.log("=== WP_USERMETA LINE SAMPLE ===");
      console.log(line.slice(0, 500));
    }
  }
}

inspectInsertFormats();
