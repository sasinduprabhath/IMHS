import fs from "fs";
import readline from "readline";

async function findVideoFormats() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;

  for await (const line of rl) {
    if (line.includes("'_video'")) {
      count++;
      console.log(`[_VIDEO SAMPLE ${count}] ${line.slice(0, 400)}`);
      if (count >= 15) break;
    }
  }
}

findVideoFormats();
