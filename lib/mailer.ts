// lib/mailer.ts - Gmail SMTP email sender using nodemailer

import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER || "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";

// Create a reusable transporter (connection pooled)
function createTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD environment variables are required. " +
      "Generate a Gmail App Password at: myaccount.google.com → Security → App Passwords"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    pool: true,
    maxConnections: 5,
  });
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send an email via Gmail SMTP.
 * Returns true on success, throws on failure.
 */
export async function sendMail(opts: MailOptions): Promise<boolean> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"IMHS – Institute of Medicine & Health Sciences" <${GMAIL_USER}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  return true;
}
