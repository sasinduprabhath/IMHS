import fs from "fs";
import readline from "readline";

async function mapCoursesToImagesAccurate() {
  const sqlFilePath = "C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql";

  const postMetaThumbnail: Map<string, string> = new Map(); // course_id -> attachment_id
  const attachedFiles: Map<string, string> = new Map(); // att_id -> relative file path
  const postTitles: Map<string, string> = new Map(); // post_id -> title

  console.log("Parsing SQL dump...");
  const fileStream = fs.createReadStream(sqlFilePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // 1. Thumbnail ID mapping
    if (line.includes("'_thumbnail_id'")) {
      const regex = /\((\d+),\s*(\d+),\s*'_thumbnail_id',\s*'(\d+)'\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        postMetaThumbnail.set(match[2], match[3]);
      }
    }

    // 2. Attached file mapping
    if (line.includes("'_wp_attached_file'")) {
      const regex = /\((\d+),\s*(\d+),\s*'_wp_attached_file',\s*'([^']+)'\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        attachedFiles.set(match[2], match[3]);
      }
    }

    // 3. Post titles: Match wp_posts tuples
    if (line.startsWith("INSERT INTO `wp_posts`")) {
      // Find all (ID, ..., title)
      const tuples = line.split(/\),\s*\(/);
      for (const tuple of tuples) {
        const idMatch = tuple.match(/^\(?\s*(\d+)\s*,/);
        if (idMatch) {
          const postId = idMatch[1];
          // Title is after content and before excerpt/status
          const fields = tuple.split("','");
          if (fields.length > 5) {
            // Find non-empty title field
            for (let i = 1; i < fields.length; i++) {
              const field = fields[i].trim();
              if (field.length > 3 && !field.startsWith("http") && !field.startsWith("202") && !field.includes("<") && field.length < 120) {
                if (field.toLowerCase().includes("pharmacy") || field.toLowerCase().includes("diploma") || field.toLowerCase().includes("course") || field.toLowerCase().includes("batch") || field.toLowerCase().includes("revision") || field.toLowerCase().includes("laboratory")) {
                  postTitles.set(postId, field);
                  break;
                }
              }
            }
          }
        }
      }
    }
  }

  console.log("\n=======================================================");
  console.log("  MAPPED COURSE TITLES & COVER IMAGES FROM SQL DUMP");
  console.log("=======================================================\n");

  const results: any[] = [];

  for (const [courseId, thumbId] of postMetaThumbnail.entries()) {
    const title = postTitles.get(courseId);
    const filePath = attachedFiles.get(thumbId);

    if (filePath) {
      const fullUrl = `https://imhsedu.com/wp-content/uploads/${filePath}`;
      results.push({
        courseId,
        title: title || `Course ID #${courseId}`,
        thumbId,
        fullUrl,
      });
    }
  }

  results.forEach((res, i) => {
    console.log(`${i + 1}. [ID #${res.courseId}] ${res.title}`);
    console.log(`   🖼️ Cover Image URL: ${res.fullUrl}\n`);
  });

  console.log(`Total Course Image Mappings Found: ${results.length}`);
}

mapCoursesToImagesAccurate().catch(console.error);
