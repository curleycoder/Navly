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
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[reminders] (no BREVO_API_KEY) Would send to ${to}: ${subject}`)
    return
  }
  await fetch('https://api.brevo.com/v3/smtp/email', {
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
}

function permitExpiryHtml(daysLeft: number, permitType: string, expiryDate: string, renewalFee: string, renewalUrl: string): string {
  const urgency = daysLeft <= 30 ? 'critical' : 'warning'
  const color = urgency === 'critical' ? '#D62828' : '#D97706'
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:8px">Permit expiry reminder</h2>
      <p style="color:#374151">Your <strong>${permitType}</strong> expires in <strong style="color:${color}">${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong> — on <strong>${expiryDate}</strong>.</p>
      ${urgency === 'critical'
        ? '<p style="color:#D62828;font-weight:600">This is urgent — file your extension or change of status immediately to maintain implied status.</p>'
        : '<p style="color:#374151">Apply to extend or renew at least 30 days before expiry to stay on valid status.</p>'
      }
      <table style="margin-top:16px;border-collapse:collapse;width:100%">
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:13px;color:#374151;font-weight:600">Expiry date</td>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:13px;color:#374151">${expiryDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#374151;font-weight:600">Renewal fee</td>
          <td style="padding:8px 12px;border:1px solid #E5E7EB;font-size:13px;color:#374151">${renewalFee}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:13px;color:#374151;font-weight:600">How to renew</td>
          <td style="padding:8px 12px;background:#F9FAFB;border:1px solid #E5E7EB;font-size:13px"><a href="${renewalUrl}" style="color:#D62828">IRCC renewal instructions →</a></td>
        </tr>
      </table>
      <div style="margin-top:16px;display:flex;gap:12px">
        <a href="https://navly.ca/dashboard" style="display:inline-block;background:#D62828;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View my tracker
        </a>
        <a href="${renewalUrl}" style="display:inline-block;background:#0B1F3A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Renew on IRCC
        </a>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#9CA3AF">
        Navly is a planning tool only — not legal advice. Fees shown are from IRCC's public fee schedule and may change. Always verify at canada.ca before submitting payment. Consult a licensed RCIC or immigration lawyer for advice about your specific situation.
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
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const today = new Date().toISOString().slice(0, 10)
  let permitWarnings = 0
  let checkinReminders = 0
  const errors: string[] = []

  // Fetch all users with profile data — paginated to handle any number of users
  const PAGE_SIZE = 500
  let profiles: { id: string; profile_data: Record<string, string> }[] = []
  let offset = 0
  while (true) {
    const { data: page, error: pageErr } = await db
      .from('profiles')
      .select('id, profile_data')
      .range(offset, offset + PAGE_SIZE - 1)
    if (pageErr) return Response.json({ error: pageErr.message }, { status: 500 })
    if (!page || page.length === 0) break
    profiles = profiles.concat(page)
    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  // Fetch user emails via auth.users — paginated to handle any number of users
  const emailById: Record<string, string> = {}
  let authPage = 1
  while (true) {
    const { data: { users }, error: usersErr } = await db.auth.admin.listUsers({ page: authPage, perPage: 1000 })
    if (usersErr) return Response.json({ error: usersErr.message }, { status: 500 })
    if (!users || users.length === 0) break
    for (const u of users) {
      if (u.email) emailById[u.id] = u.email
    }
    if (users.length < 1000) break
    authPage++
  }

  for (const row of profiles) {
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
        const permitInfoMap: Record<string, { label: string; fee: string; renewalUrl: string }> = {
          student: { label: 'Study permit', fee: '$150 CAD', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html' },
          'work-permit': { label: 'Work permit', fee: '$155 CAD', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html' },
          visitor: { label: 'Visitor status', fee: '$100 CAD', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/extend-stay.html' },
          'family-member': { label: 'Work/study permit', fee: '$155 CAD', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html' },
          pr: { label: 'PR card', fee: '$50 CAD', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html' },
        }
        const pInfo = permitInfoMap[profile.status] ?? { label: profile.workPermitType || profile.status || 'permit', fee: 'See IRCC website', renewalUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada.html' }
        const expiryDate = expiry.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
        try {
          await sendEmail(
            email,
            `Action needed: your ${pInfo.label} expires in ${daysLeft} days`,
            permitExpiryHtml(daysLeft, pInfo.label, expiryDate, pInfo.fee, pInfo.renewalUrl)
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
