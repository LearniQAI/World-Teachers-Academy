import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const INK_NAVY = "#0F172A";
const SIGNAL_INDIGO = "#4F46E5";

export async function sendOtpEmail(email: string, code: string) {
  await resend.emails.send({
    from: "World Teachers Academy <noreply@notify.worldteachers.academy>",
    to: email,
    subject: `Your verification code is ${code}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#F8FAFC; padding:32px;">
        <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #E2E5EE;">
          <div style="background:${INK_NAVY}; padding:24px; text-align:center;">
            <span style="color:#ffffff; font-size:18px; font-weight:700; letter-spacing:0.5px;">World Teachers Academy</span>
          </div>
          <div style="padding:32px 28px;">
            <p style="margin:0 0 8px; font-size:13px; color:#64748B;">
              You requested this because you tried to view a teaching job on World Teachers Academy.
            </p>
            <p style="margin:16px 0 0; font-size:14px; color:${INK_NAVY};">
              Your verification code is:
            </p>
            <div style="text-align:center; margin:20px 0;">
              <span style="display:inline-block; font-size:32px; font-weight:700; letter-spacing:6px; color:${SIGNAL_INDIGO}; background:#EEF2FF; padding:14px 24px; border-radius:10px;">
                ${code}
              </span>
            </div>
            <p style="margin:0; font-size:13px; color:#64748B;">
              This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}
