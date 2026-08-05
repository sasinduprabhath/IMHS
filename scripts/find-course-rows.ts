import fs from "fs";
import readline from "readline";

async function inspectCourseRows() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes("Forensic Pharmacy") || line.includes("FAST TRACK REVISION")) {
      console.log("=== COURSE ROW ===");
      console.log(line);
      break;
    }
  }
}

inspectCourseRows();
