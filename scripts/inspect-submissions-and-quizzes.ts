import fs from 'fs';
import readline from 'readline';

async function inspectSubmissionsAndQuizzes() {
  console.log("=== INSPECTING CONTACT INQUIRIES & QUIZ DATA IN u328662350_iIq7V.sql ===");
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';

  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const inquiries: any[] = [];
  const quizQuestions: any[] = [];

  for await (const line of rl) {
    // 1. Inspect Submissions
    if (line.includes('wp_e_submissions_values')) {
      console.log("Found wp_e_submissions_values line length:", line.length);
      const tuples = line.split("),(");
      for (const t of tuples) {
        if (t.length > 5) {
          inquiries.push(t.substring(0, 150));
        }
      }
    }

    // 2. Inspect Quiz Questions
    if (line.includes('wp_tutor_quiz_questions')) {
      console.log("Found wp_tutor_quiz_questions line length:", line.length);
      const tuples = line.split("),(");
      for (const t of tuples) {
        if (t.length > 5) {
          quizQuestions.push(t.substring(0, 150));
        }
      }
    }
  }

  console.log("\nInquiry tuples sample:", inquiries.slice(0, 10));
  console.log("\nQuiz Question tuples sample:", quizQuestions.slice(0, 10));
}

inspectSubmissionsAndQuizzes();
