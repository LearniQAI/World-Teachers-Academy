export const sent: { email: string; code: string }[] = [];
export async function sendOtpEmail(email: string, code: string) { sent.push({ email, code }); }
