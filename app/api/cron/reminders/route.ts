/**
 * Cron route — deadline expiry reminders + daily check-in reminders.
 *
 * Called by Vercel Cron (see vercel.json) or manually via GET with
 * Authorization: Bearer <CRON_SECRET>
 *
 * Email is sent via Brevo. Set BREVO_API_KEY and BREVO_FROM_EMAIL in env.
 * If no key is set, emails are logged only (safe for development).
 *
 * Dedup: deadline reminders are recorded in public.deadline_reminders.
 * Each (user_id, deadline_id, threshold_days) is sent at most once.
 */
import { createClient } from '@supabase/supabase-js'
import { EMPTY_PROFILE, type IntakeData } from '@/lib/profile'
import { computeDeadlines, ALERT_DAYS, formatDeadlineDate } from '@/lib/deadlines'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[reminders] (no BREVO_API_KEY) Would send to ${to}: ${subject}`)
    return
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Navly', email: process.env.BREVO_FROM_EMAIL ?? 'no-reply@navly.ca' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Brevo ${res.status}: ${body}`)
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

function deadlineEmailHtml(opts: {
  label: string
  date: string
  daysUntil: number
  action: string
  officialUrl: string
  isExpired: boolean
}): string {
  const { label, date, daysUntil, action, officialUrl, isExpired } = opts
  const statusColor = isExpired ? '#D62828' : daysUntil <= 60 ? '#D97706' : '#1D4ED8'
  const daysLine = isExpired
    ? `<strong style="color:${statusColor}">Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago</strong>`
    : `expires in <strong style="color:${statusColor}">${daysUntil} day${daysUntil !== 1 ? 's' : ''}</strong>`

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:8px">${isExpired ? 'Expired' : 'Reminder'}: ${label}</h2>
      <p style="color:#374151">Your <strong>${label}</strong> ${daysLine} — date: <strong>${date}</strong>.</p>
      <p style="color:#374151;margin-top:12px">${action}</p>
      <div style="margin-top:20px">
        <a href="https://navly.ca/dashboard/dates"
           style="display:inline-block;background:#D62828;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-right:12px">
          View in Navly
        </a>
        <a href="${officialUrl}"
           style="display:inline-block;background:#0B1F3A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Official IRCC guidance
        </a>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#9CA3AF">
        Navly is a planning tool only — not legal advice. Always verify dates and requirements at canada.ca
        before making decisions. For your specific situation, consult a licensed Regulated Canadian
        Immigration Consultant (RCIC) or immigration lawyer.
      </p>
    </div>
  `
}

function checkinReminderHtml(streak: number): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:8px">Daily Canada check-in</h2>
      <p style="color:#374151">Don't forget to confirm you were in Canada today to keep your presence log accurate.</p>
      ${streak > 0 ? `<p style="color:#374151">Your current streak: <strong style="color:#F97316">${streak} day${streak !== 1 ? 's' : ''}</strong></p>` : ''}
      <a href="https://navly.ca/dashboard/days"
         style="display:inline-block;margin-top:16px;background:#0B1F3A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Log today's check-in
      </a>
      <p style="margin-top:24px;font-size:12px;color:#9CA3AF">
        This tracker is for personal planning only. Final presence counts depend on official government records.
      </p>
    </div>
  `
}

// ─── Threshold logic ──────────────────────────────────────────────────────────

// Returns the single threshold to notify for this deadline today, or null if
// it's too early (> 180 days out) or already past the expired state.
// Only the closest upcoming threshold is returned — prevents multiple emails
// on first sign-up when several thresholds are already past.
function thresholdToSend(daysUntil: number): number | null {
  if (daysUntil < 0) return 0  // expired notification
  // ALERT_DAYS is [180, 120, 90, 60, 30, 7] — sort ascending to find smallest >= daysUntil
  const ascending = [...ALERT_DAYS].sort((a, b) => a - b)
  return ascending.find(t => t >= daysUntil) ?? null
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const today = new Date().toISOString().slice(0, 10)
  let deadlinesSent = 0
  let checkinsSent = 0
  const errors: string[] = []

  // ── Fetch all profiles (paginated) ──────────────────────────────────────────
  const PAGE_SIZE = 500
  const profiles: { id: string; profile_data: Record<string, unknown> }[] = []
  let offset = 0
  while (true) {
    const { data: page, error } = await db
      .from('profiles')
      .select('id, profile_data')
      .not('profile_data', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!page || page.length === 0) break
    profiles.push(...page)
    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  // ── Fetch user emails ────────────────────────────────────────────────────────
  const emailById: Record<string, string> = {}
  let authPage = 1
  while (true) {
    const { data: { users }, error } = await db.auth.admin.listUsers({ page: authPage, perPage: 1000 })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    if (!users || users.length === 0) break
    for (const u of users) {
      if (u.email) emailById[u.id] = u.email
    }
    if (users.length < 1000) break
    authPage++
  }

  // ── Process each profile ─────────────────────────────────────────────────────
  for (const row of profiles) {
    const email = emailById[row.id]
    if (!email) continue

    const profile: IntakeData = { ...EMPTY_PROFILE, ...(row.profile_data as Partial<IntakeData>) }

    // ── Deadline reminders (only sent to users who explicitly opted in) ──────
    if (profile.reminderOptIn !== 'yes') continue
    const deadlines = computeDeadlines(profile).filter(d => d.relevant)

    for (const d of deadlines) {
      const threshold = thresholdToSend(d.daysUntil)
      if (threshold === null) continue  // > 180 days out, too early

      // Check if already sent for this threshold + this exact date
      // Including deadline_date means a changed expiry date allows new reminders
      const { data: existing } = await db
        .from('deadline_reminders')
        .select('id')
        .eq('user_id', row.id)
        .eq('deadline_id', d.id)
        .eq('deadline_date', d.date)
        .eq('threshold_days', threshold)
        .maybeSingle()

      if (existing) continue  // already sent

      // Safe subjects: no permit types or dates visible on lock screens / shared inboxes
      const subject = d.status === 'expired'
        ? 'Navly reminder: an important date has passed'
        : 'Navly reminder: an important date is coming up'

      const html = deadlineEmailHtml({
        label: d.label,
        date: formatDeadlineDate(d.date),
        daysUntil: d.daysUntil,
        action: d.action,
        officialUrl: d.officialUrl,
        isExpired: d.status === 'expired',
      })

      try {
        await sendEmail(email, subject, html)
        await db.from('deadline_reminders').insert({
          user_id: row.id,
          deadline_id: d.id,
          deadline_date: d.date,
          threshold_days: threshold,
        })
        deadlinesSent++
      } catch (e) {
        errors.push(`deadline ${d.id} for ${row.id}: ${(e as Error).message}`)
      }
    }

    // ── Daily check-in reminder (tracker subscribers only) ───────────────────
    const { data: sub } = await db
      .from('subscriptions')
      .select('plan')
      .eq('user_id', row.id)
      .eq('status', 'active')
      .maybeSingle()

    if (sub?.plan === 'tracker') {
      const { data: alreadyCheckedIn } = await db
        .from('presence_logs')
        .select('date')
        .eq('user_id', row.id)
        .eq('date', today)
        .maybeSingle()

      if (!alreadyCheckedIn) {
        const { data: streakRow } = await db
          .from('presence_streaks')
          .select('streak')
          .eq('user_id', row.id)
          .maybeSingle()

        try {
          await sendEmail(
            email,
            "Don't forget your Canada check-in today",
            checkinReminderHtml(streakRow?.streak ?? 0)
          )
          checkinsSent++
        } catch (e) {
          errors.push(`check-in for ${row.id}: ${(e as Error).message}`)
        }
      }
    }
  }

  return Response.json({
    ok: true,
    date: today,
    deadlinesSent,
    checkinsSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
