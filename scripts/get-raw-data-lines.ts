import fs from 'fs';
import readline from 'readline';

async function getRawDataLines() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let captureSubmissions = 0;
  let captureQuizzes = 0;

  for await (const line of rl) {
    if (line.includes("INSERT INTO `wp_e_submissions_values`")) {
      captureSubmissions = 5;
    } else if (captureSubmissions > 0) {
      console.log("SUBMISSION LINE TUPLE:", line);
      captureSubmissions--;
    }

    if (line.includes("INSERT INTO `wp_tutor_quiz_questions`")) {
      captureQuizzes = 5;
    } else if (captureQuizzes > 0) {
      console.log("QUIZ QUESTION LINE TUPLE:", line);
      captureQuizzes--;
    }
  }
}

getRawDataLines();
