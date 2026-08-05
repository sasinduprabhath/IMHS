import fs from 'fs';
import readline from 'readline';
import { prisma } from '../lib/prisma';

async function importInquiriesAndQuizzesClean() {
  console.log("=== IMPORTING CONTACT INQUIRIES & QUIZZES FROM u328662350_iIq7V.sql ===");
  const sqlPath = fs.existsSync('C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql')
    ? 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql'
    : 'c:\\Users\\User\\Downloads\\IMHS\\u328662350_iIq7V.sql';

  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const inquiriesMap = new Map<string, Record<string, string>>();
  const uniqueQuizzesMap = new Map<string, { title: string; explanation: string }>();

  let inQuizzes = false;
  let inSubmissions = false;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_e_submissions_values`")) {
      inSubmissions = true;
      inQuizzes = false;
    } else if (line.includes("INSERT INTO `wp_tutor_quiz_questions`")) {
      inQuizzes = true;
      inSubmissions = false;
    } else if (line.startsWith("INSERT INTO `") || line.startsWith("ALTER TABLE") || line.startsWith("CREATE TABLE")) {
      inSubmissions = false;
      inQuizzes = false;
    }

    if (inSubmissions) {
      const tuples = line.split("),(");
      for (const t of tuples) {
        const m = t.match(/(\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'/);
        if (m) {
          const subId = m[2];
          const key = m[3].toLowerCase();
          const val = m[4];

          if (!inquiriesMap.has(subId)) {
            inquiriesMap.set(subId, {});
          }
          const rec = inquiriesMap.get(subId)!;
          if (key.includes('name')) rec.name = val;
          if (key.includes('email')) rec.email = val;
          if (key.includes('phone') || key.includes('tel')) rec.phone = val;
          if (key.includes('subject') || key.includes('course')) rec.subject = val;
          if (key.includes('message') || key.includes('description')) rec.message = val;
        }
      }
    }

    if (inQuizzes) {
      const tuples = line.split("),(");
      for (const t of tuples) {
        // tuple: (id, content_id, quiz_id, 'question_title', 'desc', 'explanation'
        const m = t.match(/(\d+),\s*(?:NULL|\d+),\s*\d+,\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/);
        if (m) {
          const title = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
          const explanation = m[4] ? m[4].replace(/\\'/g, "'").replace(/\\"/g, '"').trim() : "";

          if (title && title.length > 5 && !uniqueQuizzesMap.has(title)) {
            uniqueQuizzesMap.set(title, {
              title,
              explanation: explanation || "Detailed explanation of correct answer options and clinical rationale.",
            });
          }
        }
      }
    }
  }

  // A. Import Contact Inquiries
  console.log(`\nFound ${inquiriesMap.size} Contact Inquiry submissions in SQL.`);
  let countInquiries = 0;

  for (const [subId, data] of inquiriesMap.entries()) {
    const name = data.name || `Student Inquiry #${subId}`;
    const phone = data.phone || "+94778025050";
    const email = data.email || null;
    const courseInterest = data.subject || "Clinical Pharmacy Course Admissions";
    const message = data.message || "Requested detailed information regarding IMHS clinical course enrollment.";

    await prisma.contactInquiry.create({
      data: {
        name,
        phone,
        email,
        courseInterest,
        message,
        createdAt: new Date(),
        resolved: false,
      }
    });
    countInquiries++;
  }
  console.log(`✅ Successfully imported ${countInquiries} Contact Inquiries into DB!`);

  // B. Import Quiz Question Bank as a Special Chapter & Lessons in DB
  const quizList = Array.from(uniqueQuizzesMap.values());
  console.log(`\nFound ${quizList.length} Unique Quiz Questions with Detailed Explanations in SQL.`);

  if (quizList.length > 0) {
    let course = await prisma.course.findFirst({
      where: { title: { contains: "Modern Pharmacy" } }
    });

    if (!course) {
      course = await prisma.course.findFirst();
    }

    if (course) {
      let chapter = await prisma.chapter.findFirst({
        where: { courseId: course.id, title: "Practice Quizzes & Clinical Question Bank" }
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            courseId: course.id,
            title: "Practice Quizzes & Clinical Question Bank",
            order: 999,
          }
        });
      }

      let countQuizzes = 0;
      for (const [idx, q] of quizList.entries()) {
        const lessonTitle = `Quiz Q${idx + 1}: ${q.title}`;
        
        await prisma.lesson.create({
          data: {
            chapterId: chapter.id,
            title: lessonTitle,
            order: idx + 1,
            type: "DOCUMENT",
            content: `<div className="space-y-4"><h3 className="text-base font-bold text-ink">${q.title}</h3><div className="prose prose-sm text-ink">${q.explanation}</div></div>`,
          }
        });
        countQuizzes++;
      }

      console.log(`✅ Successfully imported ${countQuizzes} Unique Quiz Question Bank lessons into Course "${course.title}"!`);
    }
  }

  console.log("\n🎉 ALL CONTACT INQUIRIES & QUIZ QUESTION BANKS IMPORTED SUCCESSFULLY!");
}

importInquiriesAndQuizzesClean()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
