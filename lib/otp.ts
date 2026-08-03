// lib/otp.ts — OTP generation, hashing, and email template utilities

import bcrypt from "bcryptjs";
import crypto from "crypto";

/** Generate a cryptographically-random 6-digit OTP */
export function generateOtp(): string {
  const buf = crypto.randomBytes(3); // 3 bytes = 24 bits → enough for 0–999999
  const num = ((buf[0] << 16) | (buf[1] << 8) | buf[2]) % 1_000_000;
  return num.toString().padStart(6, "0");
}

/** Bcrypt-hash an OTP for safe DB storage */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/** Compare a plain OTP against its stored hash */
export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/** Return expiry DateTime 10 minutes from now */
export function otpExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}

/** Mask an email for display:  student@gmail.com → s*****t@gmail.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const masked = local[0] + "*".repeat(Math.min(local.length - 2, 5)) + local[local.length - 1];
  return `${masked}@${domain}`;
}

/** Build the HTML OTP email body */
export function buildOtpEmail(opts: {
  name: string;
  otp: string;
  waLink: string;
}): { subject: string; html: string; text: string } {
  const { name, otp, waLink } = opts;
  const digits = otp.split("");

  const subject = `Your IMHS Login Code: ${otp.slice(0, 3)} ${otp.slice(3)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IMHS Login Verification</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#F0F5FB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F5FB;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,18,30,.10);">

          <!-- Top accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#F16726,#0E57A4,#F16726);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="background:linear-gradient(160deg,#0A1628,#0C1A30);padding:28px 32px 24px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">IMHS</div>
              <div style="font-size:11px;color:rgba(255,255,255,.45);letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Institute of Medicine & Health Sciences</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px 28px;">
              <p style="margin:0 0 6px;font-size:15px;color:#4A5B70;">Hello, <strong style="color:#0A121E;">${name}</strong></p>
              <p style="margin:0 0 28px;font-size:14px;color:#64748B;line-height:1.6;">
                Use the verification code below to complete your login to the IMHS Student Portal.
                This code expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Digits -->
              <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  ${digits.map((d, i) => `
                  <td style="padding:0 ${i === 2 ? "12px" : "4px"} 0 ${i === 3 ? "12px" : "4px"};">
                    <div style="width:48px;height:64px;background:#EBF3FA;border:2px solid #BFDBFE;border-radius:12px;text-align:center;line-height:64px;font-size:28px;font-weight:800;color:#0E57A4;font-family:'Courier New',monospace;">
                      ${d}
                    </div>
                  </td>`).join("")}
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;text-align:center;">
                ⏱ Code expires in 10 minutes &nbsp;|&nbsp; Single-use only
              </p>

              <div style="background:#FEF3EC;border:1px solid #FDBA74;border-radius:10px;padding:14px 18px;margin:20px 0 0;">
                <p style="margin:0;font-size:12px;color:#9A3412;line-height:1.5;">
                  <strong>🔒 Security Notice:</strong> IMHS staff will never ask for this code. 
                  If you did not attempt to log in, please contact us immediately.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 36px;text-align:center;">
              <p style="margin:0 0 12px;font-size:12px;color:#94A3B8;">
                Need help? Contact IMHS Support on WhatsApp.
              </p>
              <a href="${waLink}" style="display:inline-block;background:linear-gradient(135deg,#F16726,#D95316);color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:10px 20px;border-radius:100px;">
                WhatsApp Support →
              </a>
              <p style="margin:16px 0 0;font-size:11px;color:#CBD5E1;">
                © ${new Date().getFullYear()} IMHS · Maharagama, Sri Lanka · info.imhsedu@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `IMHS Login Verification Code\n\nHello ${name},\n\nYour login code is: ${otp.slice(0, 3)} ${otp.slice(3)}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nIf you did not attempt to log in, contact IMHS Support immediately.\n\nIMHS — Institute of Medicine & Health Sciences`;

  return { subject, html, text };
}
