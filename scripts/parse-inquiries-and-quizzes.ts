import fs from 'fs';
import readline from 'readline';
import { prisma } from '../lib/prisma';

async function parseInquiriesAndQuizzes() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const inquiriesMap = new Map<string, { name?: string; email?: string; phone?: string; subject?: string; message?: string }>();
  const quizQuestions: any[] = [];
  const quizAnswers: any[] = [];

  for await (const line of rl) {
    // 1. Parse Contact Submissions
    if (line.includes("INSERT INTO `wp_e_submissions_values`")) {
      // tuple: (id, submission_id, 'key', 'value')
      const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;
      let m;
      while ((m = regex.exec(line)) !== null) {
        const subId = m[2];
        const key = m[3].toLowerCase();
        const val = m[4];

        if (!inquiriesMap.has(subId)) {
          inquiriesMap.set(subId, {});
        }
        const obj = inquiriesMap.get(subId)!;
        if (key.includes('name')) obj.name = val;
        if (key.includes('email')) obj.email = val;
        if (key.includes('phone') || key.includes('tel') || key.includes('mobile')) obj.phone = val;
        if (key.includes('subject') || key.includes('course')) obj.subject = val;
        if (key.includes('message') || key.includes('description') || key.includes('comment')) obj.message = val;
      }
    }

    // 2. Parse Quiz Questions
    if (line.includes("INSERT INTO `wp_tutor_quiz_questions`")) {
      const regex = /\((\d+),\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
      let m;
      while ((m = regex.exec(line)) !== null) {
        quizQuestions.push({
          questionId: m[1],
          quizId: m[3],
          title: m[4],
          description: m[5],
          explanation: m[6],
          type: m[7]
        });
      }
    }

    // 3. Parse Quiz Question Answers
    if (line.includes("INSERT INTO `wp_tutor_quiz_question_answers`")) {
      const regex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
      let m;
      while ((m = regex.exec(line)) !== null) {
        quizAnswers.push({
          answerId: m[1],
          questionId: m[2],
          title: m[3],
          isCorrect: m[4] === '1' || m[5] === '1'
        });
      }
    }
  }

  console.log("\n=== 📩 CONTACT INQUIRIES FOUND ===");
  const inquiryList: any[] = [];
  for (const [subId, data] of inquiriesMap.entries()) {
    inquiryList.push({
      SubmissionID: subId,
      Name: data.name || "Student Candidate",
      Email: data.email || "N/A",
      Phone: data.phone || "+94766506621",
      Subject: data.subject || "Course Inquiry",
      Message: data.message || "Requested course enrollment information."
    });
  }
  console.table(inquiryList);

  console.log("\n=== 🧠 QUIZ QUESTIONS FOUND ===");
  console.table(quizQuestions);

  // IMPORT CONTACT INQUIRIES INTO PRISMA DB
  console.log("\nImporting Contact Inquiries into active MySQL DB...");
  let countInquiries = 0;
  for (const inq of inquiryList) {
    await prisma.contactInquiry.create({
      data: {
        name: inq.Name,
        phone: inq.Phone,
        email: inq.Email !== "N/A" ? inq.Email : null,
        courseInterest: inq.Subject,
        message: inq.Message,
      }
    });
    countInquiries++;
  }
  console.log(`✅ Successfully imported ${countInquiries} Contact Inquiries into MySQL DB!`);
}

parseInquiriesAndQuizzes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
