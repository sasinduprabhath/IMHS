/**
 * Helper module for generating WhatsApp wa.me deep links and Meta Cloud API payloads across IMHS platform.
 * Clean, emoji-free text formatting for 100% reliable URL parameter encoding and rendering.
 */

const DEFAULT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94778025050";

/**
 * Clean phone number for wa.me URL format (only digits)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // If no country code, default to Sri Lanka (+94)
  if (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) {
    return `94${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `94${digits.substring(1)}`;
  }
  return digits;
}

/**
 * Generate deep link for admin to send student login credentials
 */
export function createStudentCredentialsWALink(
  studentPhone: string,
  studentName: string,
  email: string,
  tempPass: string,
  courseTitles: string[]
): string {
  const cleanPhone = formatPhoneForWhatsApp(studentPhone);
  const coursesList = courseTitles.map((t) => `  • ${t}`).join("\n");
  const portalUrl = "https://imhs.edu.lk/login";

  const message = `INSTITUTE OF MEDICINE AND HEALTH SCIENCES (IMHS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Welcome to IMHS Student Portal, ${studentName}!*

Your official student account has been created and your course enrollment is now *ACTIVE*.

*YOUR LOGIN CREDENTIALS:*
• Login Portal: ${portalUrl}
• Email: ${email}
• Temporary Password: ${tempPass}

*ENROLLED PROGRAM(S):*
${coursesList}

*IMPORTANT NOTICE:*
Please log in to your portal and update your password under your *Profile Settings*.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• IMHS Help Desk: +94 77 802 5050
• Maharagama Campus, Sri Lanka`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate deep link for password reset notification
 */
export function createPasswordResetWALink(
  studentPhone: string,
  studentName: string,
  email: string,
  tempPass: string
): string {
  const cleanPhone = formatPhoneForWhatsApp(studentPhone);
  const portalUrl = "https://imhs.edu.lk/login";

  const message = `INSTITUTE OF MEDICINE AND HEALTH SCIENCES (IMHS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*PASSWORD RESET NOTIFICATION*

Hello *${studentName}*,

Your IMHS Student Portal password has been reset by the administrator.

*UPDATED LOGIN CREDENTIALS:*
• Login Portal: ${portalUrl}
• Email: ${email}
• New Password: ${tempPass}

*IMPORTANT NOTICE:*
Please log in to your portal and update your password under your *Profile Settings*.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• IMHS Help Desk: +94 77 802 5050
• Maharagama Campus, Sri Lanka`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate deep link for prospective student inquiring about a specific course
 */
export function createCourseInquiryWALink(courseTitle?: string, courseCode?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(DEFAULT_PHONE);
  let text = "Hello IMHS, I would like to inquire about enrolling in your programs.";
  if (courseTitle) {
    const code = courseCode ? ` [${courseCode}]` : "";
    text = `Hello IMHS, I would like to inquire about *${courseTitle}*${code}. Please provide more information about enrollment.`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate deep link for student inquiring about a frozen course enrollment
 */
export function createFrozenCourseInquiryWALink(
  courseTitle: string,
  courseCode?: string,
  studentName?: string,
  studentEmail?: string
): string {
  const cleanPhone = formatPhoneForWhatsApp(DEFAULT_PHONE);
  const code = courseCode ? ` [${courseCode}]` : "";
  const nameStr = studentName ? `\nStudent Name: ${studentName}` : "";
  const emailStr = studentEmail ? `\nEmail: ${studentEmail}` : "";

  const text = `Hello IMHS Help Desk,

My course access for *${courseTitle}*${code} is currently frozen on my Student Portal.${nameStr}${emailStr}

Please help me reactivate my course enrollment. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Meta WhatsApp Cloud API JSON payload for a reaction message
 * Target endpoint: POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
 */
export function buildMetaWhatsAppReactionPayload(recipientPhone: string, messageId: string, emoji: string = "\uD83D\uDC4D") {
  const cleanPhone = formatPhoneForWhatsApp(recipientPhone);
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "reaction",
    reaction: {
      message_id: messageId,
      emoji: emoji
    }
  };
}

/**
 * Generate Meta WhatsApp Cloud API JSON payload for text message dispatch
 */
export function buildMetaWhatsAppTextPayload(recipientPhone: string, bodyText: string) {
  const cleanPhone = formatPhoneForWhatsApp(recipientPhone);
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: {
      preview_url: true,
      body: bodyText
    }
  };
}
