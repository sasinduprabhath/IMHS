import fs from "fs";
import path from "path";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

async function runTests() {
  console.log("==========================================================");
  console.log(" 🧪 TESTING SEO OPTIMIZATION & LOCAL ASSET ROUTING");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Root Layout metadataBase & JSON-LD
  const layoutPath = path.join(process.cwd(), "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");

  assert(layoutContent.includes('metadataBase: new URL("https://imhsedu.com")'), "Root layout defines metadataBase as https://imhsedu.com");
  assert(layoutContent.includes('EducationalOrganization'), "Root layout injects schema.org/EducationalOrganization JSON-LD");
  assert(layoutContent.includes('WebSite'), "Root layout injects schema.org/WebSite JSON-LD");
  assert(layoutContent.includes('template: "%s | IMHS"'), "Root layout defines title template for child pages");

  // 2. Sitemap testing
  const sitemapEntries = await sitemap();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 5, `Sitemap generated ${sitemapEntries.length} URL entries`);
  assert(sitemapEntries.every(entry => entry.url.startsWith("https://imhsedu.com")), "All sitemap entries strictly use https://imhsedu.com canonical origin");
  assert(sitemapEntries.some(entry => entry.url === "https://imhsedu.com/courses"), "Sitemap includes /courses page with high priority");
  assert(sitemapEntries.some(entry => entry.url === "https://imhsedu.com/about"), "Sitemap includes /about page");

  // 3. Robots.txt testing
  const robotsConfig = robots();
  assert(robotsConfig.sitemap === "https://imhsedu.com/sitemap.xml", "Robots.txt points to https://imhsedu.com/sitemap.xml");
  assert(
    Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules[0]?.disallow?.includes("/admin")
      : (robotsConfig.rules as any)?.disallow?.includes("/admin"),
    "Robots.txt disallows admin and internal routes"
  );

  // 4. Local downloaded video verification
  const localVideoPath = path.join(process.cwd(), "public", "gallery", "convocation-video.mp4");
  assert(fs.existsSync(localVideoPath), "Local convocation video exists at public/gallery/convocation-video.mp4");
  if (fs.existsSync(localVideoPath)) {
    const sizeMb = fs.statSync(localVideoPath).size / (1024 * 1024);
    assert(sizeMb > 20, `Local convocation video is complete (${sizeMb.toFixed(1)} MB)`);
  }

  // 5. HomePageClient video routing verification
  const homeClientPath = path.join(process.cwd(), "components", "marketing", "HomePageClient.tsx");
  const homeClientContent = fs.readFileSync(homeClientPath, "utf8");
  assert(!homeClientContent.includes("https://imhsedu.com/wp-content/uploads"), "HomePageClient has zero remote wp-content video links");
  assert(homeClientContent.includes("/gallery/convocation-video.mp4"), "HomePageClient serves convocation video via local /gallery/convocation-video.mp4 route");

  // 6. Course Detail Page Schema verification
  const courseDetailPath = path.join(process.cwd(), "app", "(marketing)", "courses", "[slug]", "page.tsx");
  const courseDetailContent = fs.readFileSync(courseDetailPath, "utf8");
  assert(courseDetailContent.includes('"@type": "Course"'), "Course detail page renders schema.org/Course structured data");
  assert(courseDetailContent.includes('canonical: `https://imhsedu.com/courses/${slug}`'), "Course detail page generates dynamic canonical URL");

  // 7. Faculty & Dr. Isuru Pages Schema
  const drIsuruPath = path.join(process.cwd(), "app", "(marketing)", "dr-isuru-wijesinghe", "page.tsx");
  const drIsuruContent = fs.readFileSync(drIsuruPath, "utf8");
  assert(drIsuruContent.includes('"@type": "Person"'), "Dr. Isuru Wijesinghe profile page renders schema.org/Person structured data");
  assert(drIsuruContent.includes('canonical: "https://imhsedu.com/dr-isuru-wijesinghe"'), "Dr. Isuru profile page has canonical URL");

  console.log("==========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
