import fs from "fs";
import readline from "readline";

async function inspectSqlChaptersLessons() {
  const sqlPath = "c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql";
  const fileStream = fs.createReadStream(sqlPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inPosts = false;
  let inMeta = false;

  const topicsMap = new Map<string, { id: string; title: string; parentCourseId: string; order: number }>();
  const lessonsMap = new Map<string, { id: string; title: string; parentTopicId: string; order: number; content: string }>();
  const lessonVideos = new Map<string, string>();

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_posts`")) {
      inPosts = true;
      inMeta = false;
    } else if (line.includes("INSERT INTO `wp_postmeta`")) {
      inPosts = false;
      inMeta = true;
    } else if (line.startsWith("INSERT INTO `") || line.startsWith("CREATE TABLE")) {
      inPosts = false;
      inMeta = false;
    }

    if (inPosts && (line.includes("'topics'") || line.includes("'lesson'"))) {
      const items = line.split("),(");
      for (const item of items) {
        if (item.includes("'topics'") || item.includes("'lesson'")) {
          // Extract ID, title, parentId, menu_order, post_type
          const match = item.match(/^\(?\s*(\d+),\s*\d+,\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*(\d+),\s*'([^']*)',\s*(\d+),\s*'([^']*)'/);
          if (match) {
            const id = match[1];
            const content = match[2];
            const title = match[3];
            const status = match[4];
            const parentId = match[6];
            const order = parseInt(match[8], 10) || 0;
            const type = match[9];

            if (type === "topics") {
              topicsMap.set(id, { id, title, parentCourseId: parentId, order });
            } else if (type === "lesson") {
              lessonsMap.set(id, { id, title, parentTopicId: parentId, order, content });
            }
          }
        }
      }
    }

    if (inMeta && (line.includes("video") || line.includes("vimeo") || line.includes("drive"))) {
      const matches = Array.from(line.matchAll(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g));
      for (const m of matches) {
        const postId = m[2];
        const key = m[3];
        const val = m[4];
        if (key.includes("video") || key.includes("vimeo") || key.includes("attachment")) {
          lessonVideos.set(postId, val);
        }
      }
    }
  }

  console.log("=========================================================================");
  console.log(` 📚 EXTRACTED TOPICS & LESSONS FROM SQL DUMP`);
  console.log("=========================================================================");
  console.log(`- Topics (Chapters) Found: ${topicsMap.size}`);
  console.log(`- Lessons Found: ${lessonsMap.size}`);
  console.log(`- Video/Drive Metadata Entries Found: ${lessonVideos.size}`);

  console.log("\n📋 Sample Topics:");
  let count = 0;
  for (const [id, t] of topicsMap.entries()) {
    console.log(`  Topic ${id}: "${t.title}" (Course ID: ${t.parentCourseId}, Order: ${t.order})`);
    count++;
    if (count >= 10) break;
  }
}

inspectSqlChaptersLessons();
