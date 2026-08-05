import fs from "fs";
import readline from "readline";

async function inspectSqlCourses() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inPosts = false;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_posts`")) {
      inPosts = true;
    } else if (line.startsWith("INSERT INTO `") || line.startsWith("CREATE TABLE")) {
      inPosts = false;
    }

    if (inPosts) {
      if (line.includes("'courses'") || line.includes("'course'")) {
        console.log(`[COURSE POST] ${line.slice(0, 300)}`);
      }
    }
  }
}

inspectSqlCourses();
