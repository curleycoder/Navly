/**
 * Cron route — sends permit expiry warnings and daily check-in reminders.
 *
 * Called by Vercel Cron (see vercel.json) or manually via GET with
 * Authorization: Bearer <CRON_SECRET>
 *
 * Email is sent via Resend (https://resend.com). Set RESEND_API_KEY in env.
 * If no key is set, notifications are logged only (safe for development).
 */
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[reminders] (no RESEND_API_KEY) Would send to ${to}: ${subject}`)
    return
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'Navly <no-reply@navly.ca>',
      to,
      subject,
      html,
    }),
  })
}

function permitExpiryHtml(daysLeft: number, permitType: string): string {
  const urgency = daysLeft <= 30 ? 'critical' : 'warning'
  const color = urgency === 'critical' ? '#D62828' : '#D97706'
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:8px">Permit expiry reminder</h2>
      <p style="color:#374151">Your <strong>${permitType}</strong> expires in <strong style="color:${color}">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.</p>
      ${urgency === 'critical'
        ? '<p style="color:#D62828;font-weight:600">This is urgent — file your extension or change of status immediately to maintain implied status.</p>'
        : '<p style="color:#374151">Apply to extend or renew at least 30 days before expiry to stay on valid status.</p>'
      }
      <a href="https://navly.ca/dashboard/pr-tracker" style="display:inline-block;margin-top:16px;background:#D62828;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        View my tracker
      </a>
      <p style="margin-top:24px;font-size:12px;color:#9CA3AF">
        Navly is a planning tool only — not legal advice. Consult a licensed RCIC or immigration lawyer for your specific situation.
      </p>
    </div>
  `
}

function checkinReminderHtml(streak: number): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:8px">Daily Canada check-in</h2>
      <p style="color:#374151">Don't forget to confirm you were in Canada today to keep your presence log accurate.</p>
      ${streak > 0 ? `<p style="color:#374151">Your current streak: <strong style="color:#F97316">${streak} day${streak !== 1 ? 's' : ''}</strong> 🔥</p>` : ''}
      <a href="https://navly.ca/dashboard/days" style="display:inline-block;margin-top:16px;background:#0B1F3A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Log today's check-in
      </a>
      <p style="margin-top:24px;font-size:12px;color:#9CA3AF">
        This tracker is for personal planning only. Final presence counts depend on official government records.
      </p>
    </div>
  `
}

export async function GET(req: Request) {
  // Auth check
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const today = new Date().toISOString().slice(0, 10)
  let permitWarnings = 0
  let checkinReminders = 0
  const errors: string[] = []

  // Fetch all users with profile data
  const { data: profiles, error: profilesErr } = await db
    .from('profiles')
    .select('id, profile_data')

  if (profilesErr) {
    return Response.json({ error: profilesErr.message }, { status: 500 })
  }

  // Fetch user emails via auth.users (service role required)
  const { data: { users }, error: usersErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (usersErr) {
    return Response.json({ error: usersErr.message }, { status: 500 })
  }

  const emailById: Record<string, string> = {}
  for (const u of users) {
    if (u.email) emailById[u.id] = u.email
  }

  for (const row of profiles ?? []) {
    const email = emailById[row.id]
    if (!email) continue

    const profile = row.profile_data as Record<string, string>

    // ── Permit expiry warning ──────────────────────────────────────────────
    const expiryStr = profile.visaExpiryDate || (profile.permitExpiry ? profile.permitExpiry + '-01' : '')
    if (expiryStr) {
      const expiry = new Date(expiryStr)
      const daysLeft = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      // Warn at 90, 60, 30, 14, and 7 days
      if ([90, 60, 30, 14, 7].includes(daysLeft)) {
        const permitType = profile.workPermitType || profile.status || 'permit'
        try {
          await sendEmail(
            email,
            `Action needed: your ${permitType} expires in ${daysLeft} days`,
            permitExpiryHtml(daysLeft, permitType)
          )
          permitWarnings++
        } catch (e) {
          errors.push(`permit warning for ${row.id}: ${(e as Error).message}`)
        }
      }
    }

    // ── Daily check-in reminder ────────────────────────────────────────────
    // Only send to tracker subscribers
    const { data: sub } = await db
      .from('subscriptions')
      .select('plan')
      .eq('user_id', row.id)
      .eq('status', 'active')
      .maybeSingle()

    if (sub?.plan === 'tracker') {
      // Check if user already checked in today
      const { data: presence } = await db
        .from('presence_logs')
        .select('date')
        .eq('user_id', row.id)
        .eq('date', today)
        .maybeSingle()

      if (!presence) {
        // Get streak from presence data
        const { data: streakRow } = await db
          .from('presence_streaks')
          .select('streak')
          .eq('user_id', row.id)
          .maybeSingle()
        const streak = streakRow?.streak ?? 0

        try {
          await sendEmail(
            email,
            "Don't forget your Canada check-in today",
            checkinReminderHtml(streak)
          )
          checkinReminders++
        } catch (e) {
          errors.push(`check-in reminder for ${row.id}: ${(e as Error).message}`)
        }
      }
    }
  }

  return Response.json({
    ok: true,
    date: today,
    permitWarnings,
    checkinReminders,
    errors: errors.length > 0 ? errors : undefined,
  })
}
