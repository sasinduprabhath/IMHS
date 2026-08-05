import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log("=========================================================================");
  console.log(" 🖼️ FIXING COURSE COVER IMAGE URLS IN DATABASE");
  console.log("=========================================================================");

  const localCoursesDir = path.join(process.cwd(), "public", "courses");
  const localImagesMap = new Map<string, string>();

  if (fs.existsSync(localCoursesDir)) {
    const files = fs.readdirSync(localCoursesDir);
    for (const f of files) {
      localImagesMap.set(f.toLowerCase(), `/courses/${f}`);
    }
  }

  console.log(`📸 Indexed ${localImagesMap.size} local images in public/courses/`);

  const courses = await prisma.course.findMany();
  let updatedCount = 0;

  for (const c of courses) {
    let newCoverImage = c.coverImage;

    if (c.coverImage && (c.coverImage.includes("http://") || c.coverImage.includes("https://"))) {
      const filename = path.basename(c.coverImage).toLowerCase();

      // Check if exact file exists in public/courses/
      if (localImagesMap.has(filename)) {
        newCoverImage = localImagesMap.get(filename)!;
      } else {
        // Find fuzzy match
        for (const [imgName, localPath] of localImagesMap.entries()) {
          if (imgName.includes(filename) || filename.includes(imgName)) {
            newCoverImage = localPath;
            break;
          }
        }
      }
    }

    if (newCoverImage !== c.coverImage) {
      await prisma.course.update({
        where: { id: c.id },
        data: { coverImage: newCoverImage },
      });
      console.log(`   ✓ Fixed "${c.title}": ${c.coverImage} -> ${newCoverImage}`);
      updatedCount++;
    }
  }

  console.log("=========================================================================");
  console.log(` 🎉 DONE! Updated ${updatedCount} course image URLs to local paths.`);
  console.log("=========================================================================");
}

fixImageUrls()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
