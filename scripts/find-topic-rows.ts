import fs from "fs";
import readline from "readline";

async function findTopicRows() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inPosts = false;
  let topicCount = 0;
  let lessonCount = 0;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_posts`")) {
      inPosts = true;
    } else if (line.startsWith("INSERT INTO `") || line.startsWith("CREATE TABLE")) {
      inPosts = false;
    }

    if (inPosts) {
      if (line.includes("'topics'")) {
        topicCount++;
        if (topicCount <= 5) {
          console.log(`[TOPIC SAMPLE ${topicCount}] ${line.slice(0, 300)}`);
        }
      }
      if (line.includes("'lesson'")) {
        lessonCount++;
        if (lessonCount <= 5) {
          console.log(`[LESSON SAMPLE ${lessonCount}] ${line.slice(0, 300)}`);
        }
      }
    }
  }

  console.log(`Total Topic lines: ${topicCount}, Total Lesson lines: ${lessonCount}`);
}

findTopicRows();
