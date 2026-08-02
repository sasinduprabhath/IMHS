import fs from 'fs';
import readline from 'readline';
import { prisma } from '../lib/prisma';

async function importInquiriesAndQuizzes() {
  console.log("=== IMPORTING CONTACT INQUIRIES & QUIZZES FROM u328662350_iIq7V.sql ===");
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';

  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const quizQuestions: { title: string; explanation: string; type: string; mark: string }[] = [];
  const submissionsMap = new Map<string, Record<string, string>>();

  for await (const line of rl) {
    // 1. Contact Form Submissions
    if (line.includes("INSERT INTO `wp_e_submissions_values`")) {
      const match = line.match(/\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/);
      if (match) {
        const subId = match[2];
        const key = match[3].toLowerCase();
        const val = match[4];

        if (!submissionsMap.has(subId)) {
          submissionsMap.set(subId, {});
        }
        const rec = submissionsMap.get(subId)!;
        if (key.includes('name')) rec.name = val;
        if (key.includes('email')) rec.email = val;
        if (key.includes('phone') || key.includes('tel')) rec.phone = val;
        if (key.includes('subject') || key.includes('course')) rec.subject = val;
        if (key.includes('message') || key.includes('description')) rec.message = val;
      }
    }

    // 2. Quiz Questions
    if (line.startsWith("(1") || line.startsWith("(2") || line.startsWith("(3") || line.startsWith("(4") || line.startsWith("(5") || line.startsWith("(6") || line.startsWith("(7") || line.startsWith("(8") || line.startsWith("(9") || line.includes("multiple_choice")) {
      // tuple: (question_id, content_id, quiz_id, 'question_title', 'question_description', 'answer_explanation', 'question_type'
      const m = line.match(/\(\d+,\s*(?:NULL|\d+),\s*\d+,\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/);
      if (m) {
        const title = m[1].replace(/\\'/g, "'").trim();
        const explanation = m[3].replace(/\\'/g, "'").trim();
        const type = m[4];

        if (title && title.length > 3) {
          quizQuestions.push({
            title,
            explanation,
            type,
            mark: '5'
          });
        }
      }
    }
  }

  // A. Import Contact Inquiries
  console.log(`\nFound ${submissionsMap.size} contact inquiry submissions.`);
  let countInquiries = 0;

  for (const [subId, data] of submissionsMap.entries()) {
    const name = data.name || "Student Candidate";
    const phone = data.phone || "+94778025050";
    const email = data.email || null;
    const courseInterest = data.subject || "Pharmacy Course Admissions Inquiry";
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

  // B. Import Quiz Question Bank as a Special Quiz Chapter & Lessons in DB
  console.log(`\nFound ${quizQuestions.length} Quiz Questions with Detailed Explanations.`);
  
  if (quizQuestions.length > 0) {
    // Find or create target course for Quizzes (e.g. Modern Pharmacy Course)
    let course = await prisma.course.findFirst({
      where: { title: { contains: "Modern Pharmacy" } }
    });

    if (!course) {
      course = await prisma.course.findFirst();
    }

    if (course) {
      // Find or create "Practice Quizzes & Question Bank" chapter
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
      for (const [idx, q] of quizQuestions.entries()) {
        await prisma.lesson.create({
          data: {
            chapterId: chapter.id,
            title: `Quiz Q${idx + 1}: ${q.title}`,
            order: idx + 1,
            type: "DOCUMENT",
            content: `<h3>${q.title}</h3><div>${q.explanation}</div>`,
          }
        });
        countQuizzes++;
      }

      console.log(`✅ Successfully imported ${countQuizzes} Quiz Question Bank lessons into Course "${course.title}"!`);
    }
  }

  console.log("\n🎉 ALL CONTACT INQUIRIES & QUIZ QUESTION BANKS IMPORTED SUCCESSFULLY!");
}

importInquiriesAndQuizzes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
