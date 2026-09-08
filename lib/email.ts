/**
 * Shared transactional email sender (Brevo).
 *
 * Every cron route uses this. Before it existed, reminders sent via Brevo and
 * news sent via Resend — but only BREVO_API_KEY is configured, so news emails
 * silently logged "would send" and never reached anyone.
 *
 * With no BREVO_API_KEY set (local dev), sends are logged and skipped rather
 * than throwing, so crons still run end to end.
 */

export type SendEmailResult = { sent: boolean; skipped?: 'no-api-key' }

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  logPrefix = 'email',
): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[${logPrefix}] (no BREVO_API_KEY) Would send to ${to}: ${subject}`)
    return { sent: false, skipped: 'no-api-key' }
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Navly', email: process.env.BREVO_FROM_EMAIL ?? 'no-reply@navly.ca' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    throw new Error(`Brevo ${res.status}: ${await res.text()}`)
  }
  return { sent: true }
}
