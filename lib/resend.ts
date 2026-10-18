import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const INK_NAVY = "#0F172A";
const SIGNAL_INDIGO = "#4F46E5";

// Overridable for local/test environments where notify.worldteachers.academy
// isn't an authorized sending domain on the API key in use (e.g. Resend's
// sandbox domain, onboarding@resend.dev, which only delivers to the Resend
// account's own owner email — fine for us to test with, not usable for real
// applicants). Production should leave RESEND_FROM_EMAIL unset so it keeps
// using the real domain below.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "World Teachers Academy <noreply@notify.worldteachers.academy>";

export async function sendOtpEmail(email: string, code: string) {
  // The Resend SDK never throws on an API-level failure (invalid key,
  // unverified domain, rejected address, etc.) — it always resolves and
  // returns { data, error } instead. Without checking `error` here, a failed
  // send looks identical to a successful one to every caller: the OTP row
  // still gets inserted, request-code still returns 200, and the apply modal
  // advances to "enter your code" even though no email was ever delivered.
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
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

  if (error) {
    // The SDK's own internal error logging is skipped in production (see
    // its logError()), so without this, a failure here would be completely
    // invisible in production logs too — not just to the end user.
    console.error("[sendOtpEmail] Resend rejected the send:", error);
    throw new Error(error.message || "Resend failed to send the verification email");
  }
}
