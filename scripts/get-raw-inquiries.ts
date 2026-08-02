import fs from 'fs';
import readline from 'readline';

async function getRawInquiries() {
  const sqlPath = 'C:\\Users\\User\\Downloads\\u328662350_iIq7V.sql';
  const fileStream = fs.createReadStream(sqlPath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('wp_e_submissions_values')) {
      console.log("SUBMISSIONS VALUES LINE:", line.substring(0, 500));
    }
    if (line.includes('wp_tutor_quiz_questions')) {
      console.log("QUIZ QUESTIONS LINE:", line.substring(0, 500));
    }
  }
}

getRawInquiries();
