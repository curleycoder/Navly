/**
 * Cron route — fetches Express Entry draw results from the official IRCC JSON feed
 * and upserts into express_entry_draws.
 *
 * Run the migration first:
 *   supabase/migrations/004_express_entry_draws.sql
 *
 * Called by Vercel Cron (see vercel.json) or manually:
 *   GET /api/cron/sync-ee-draws
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Source: https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json
 */
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import { calculateScore } from '@/lib/scoring'
import { EMPTY_PROFILE, type IntakeData } from '@/lib/profile'

const EE_DRAWS_JSON =
  'https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json'

// Reference page for source_url stored in rule_snapshots
const EE_DRAWS_PAGE =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type IRCCRound = {
  drawNumber: string
  drawDate: string        // 'YYYY-MM-DD'
  drawName: string        // draw type label
  drawSize: string        // invitations issued
  drawCRS: string         // CRS cutoff
  drawCutOff: string      // tie-break date/time string e.g. "January 07, 2026 at 05:23:31 UTC"
  [key: string]: string   // dd1..dd18 distribution buckets
}

type DrawRow = {
  draw_number: number
  draw_date: string
  draw_type: string
  crs_cutoff: number
  invitations: number
  tie_break_rule: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseTieBreak(raw: string): string | null {
  if (!raw || raw === 'N/A' || raw === '-') return null
  const cleaned = raw.replace(/\s+at\s+/i, ' ').replace(/\s*UTC\s*/i, 'Z')
  const d = new Date(cleaned)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function toDrawRow(r: IRCCRound): DrawRow | null {
  const draw_number = parseInt(r.drawNumber, 10)
  const crs_cutoff = parseInt(r.drawCRS, 10)
  const invitations = parseInt(r.drawSize.replace(/,/g, ''), 10)
  if (isNaN(draw_number) || isNaN(crs_cutoff) || isNaN(invitations) || !r.drawDate) return null
  return {
    draw_number,
    draw_date: r.drawDate,           // already 'YYYY-MM-DD'
    draw_type: r.drawName || 'Unknown',
    crs_cutoff,
    invitations,
    tie_break_rule: parseTieBreak(r.drawCutOff),
  }
}

// ── Draw alerts ───────────────────────────────────────────────────────────────

/**
 * Only alert on genuinely recent rounds. Without this window the very first run
 * after deploy would email every subscriber about ~300 historical draws.
 */
const ALERT_WINDOW_DAYS = 14

function drawAlertHtml(draw: DrawRow, score: number | null): string {
  const gap = score === null ? null : score - draw.crs_cutoff
  const standing =
    score === null
      ? `<p style="margin:0 0 16px;color:#475569">Complete your profile in Navly to see how your score compares to this round.</p>`
      : gap !== null && gap >= 0
        ? `<p style="margin:0 0 16px;color:#475569">Your estimated score is <strong>${score}</strong> — <strong style="color:#059669">${gap} point${gap === 1 ? '' : 's'} above</strong> this cut-off.</p>`
        : `<p style="margin:0 0 16px;color:#475569">Your estimated score is <strong>${score}</strong> — <strong>${Math.abs(gap as number)} point${Math.abs(gap as number) === 1 ? '' : 's'} below</strong> this cut-off.</p>`

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin:0 0 8px">A new Express Entry round was published</h2>
      <p style="margin:0 0 16px;color:#475569">${draw.draw_type} &middot; ${draw.draw_date}</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
        <tr>
          <td style="padding:10px 12px;background:#F1F5F9;border-radius:8px 0 0 8px;color:#475569;font-size:14px">CRS cut-off</td>
          <td style="padding:10px 12px;background:#F1F5F9;border-radius:0 8px 8px 0;text-align:right;font-weight:700;color:#0B1F3A">${draw.crs_cutoff}</td>
        </tr>
        <tr><td colspan="2" style="height:6px"></td></tr>
        <tr>
          <td style="padding:10px 12px;background:#F1F5F9;border-radius:8px 0 0 8px;color:#475569;font-size:14px">Invitations issued</td>
          <td style="padding:10px 12px;background:#F1F5F9;border-radius:0 8px 8px 0;text-align:right;font-weight:700;color:#0B1F3A">${draw.invitations.toLocaleString()}</td>
        </tr>
      </table>
      ${standing}
      <a href="https://navly.ca/dashboard/news"
         style="display:inline-block;background:#0B1F3A;color:#fff;padding:11px 20px;border-radius:10px;text-decoration:none;font-weight:600">
        See your standing
      </a>
      <p style="margin:24px 0 0;color:#94A3B8;font-size:12px;line-height:1.6">
        Estimates only — Navly is not an immigration consultant and this is not advice.
        Always confirm with IRCC or a licensed representative.<br>
        Manage email preferences in your Navly profile settings.
      </p>
    </div>`
}

/**
 * Emails tracker subscribers who opted in about draws published in the last
 * ALERT_WINDOW_DAYS and not already sent to them.
 * Never throws — a failed alert must not fail the sync itself.
 */
async function sendDrawAlerts(
  db: ReturnType<typeof adminDb>,
  draws: DrawRow[],
): Promise<{ alertsSent: number; alertErrors: string[] }> {
  const alertErrors: string[] = []
  let alertsSent = 0

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ALERT_WINDOW_DAYS)
  const recent = draws.filter(d => new Date(d.draw_date + 'T12:00:00') >= cutoffDate)
  if (recent.length === 0) return { alertsSent, alertErrors }

  // Paid tracker subscribers only — draw alerts are a PR Tracker feature.
  const { data: subs, error: subErr } = await db
    .from('subscriptions')
    .select('user_id, expires_at')
    .eq('plan', 'tracker')
    .eq('status', 'active')
  if (subErr) return { alertsSent, alertErrors: [`subscriptions: ${subErr.message}`] }

  const nowMs = Date.now()
  const paidUserIds = [...new Set(
    (subs ?? [])
      .filter(s => !s.expires_at || new Date(s.expires_at).getTime() > nowMs)
      .map(s => s.user_id),
  )]
  if (paidUserIds.length === 0) return { alertsSent, alertErrors }

  const { data: profileRows, error: profErr } = await db
    .from('profiles')
    .select('id, profile_data')
    .in('id', paidUserIds)
  if (profErr) return { alertsSent, alertErrors: [`profiles: ${profErr.message}`] }

  // Already-sent pairs, so a re-run never double-emails.
  const { data: sentRows } = await db
    .from('draw_notifications')
    .select('user_id, draw_number')
    .in('user_id', paidUserIds)
  const alreadySent = new Set((sentRows ?? []).map(r => `${r.user_id}:${r.draw_number}`))

  const emailById: Record<string, string> = {}
  let authPage = 1
  while (true) {
    const { data: { users }, error } = await db.auth.admin.listUsers({ page: authPage, perPage: 1000 })
    if (error) { alertErrors.push(`auth: ${error.message}`); break }
    if (!users || users.length === 0) break
    for (const u of users) if (u.email) emailById[u.id] = u.email
    if (users.length < 1000) break
    authPage++
  }

  for (const row of profileRows ?? []) {
    const email = emailById[row.id]
    if (!email) continue

    const profile: IntakeData = { ...EMPTY_PROFILE, ...(row.profile_data as Partial<IntakeData>) }
    if (profile.reminderOptIn !== 'yes') continue   // explicit email consent required

    let score: number | null = null
    try {
      score = calculateScore(profile).crs?.total ?? null
    } catch {
      score = null   // incomplete profile — still worth telling them a draw happened
    }

    for (const draw of recent) {
      if (alreadySent.has(`${row.id}:${draw.draw_number}`)) continue
      try {
        // Subject carries no score or program — these land on lock screens.
        await sendEmail(
          email,
          'Navly: a new Express Entry round was published',
          drawAlertHtml(draw, score),
          'draw-alerts',
        )
        await db.from('draw_notifications').insert({ user_id: row.id, draw_number: draw.draw_number })
        alertsSent++
      } catch (e) {
        alertErrors.push(`draw ${draw.draw_number} for ${row.id}: ${(e as Error).message}`)
      }
    }
  }

  return { alertsSent, alertErrors }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the official IRCC JSON feed (no scraping needed)
  let rounds: IRCCRound[]
  try {
    const res = await fetch(EE_DRAWS_JSON, {
      headers: { 'User-Agent': 'Navly-SourceBot/1.0' },
      cache: 'no-store',
    })
    if (!res.ok) {
      return Response.json({ error: `IRCC JSON feed returned HTTP ${res.status}` }, { status: 502 })
    }
    const json = await res.json() as { rounds: IRCCRound[] }
    rounds = json.rounds ?? []
  } catch (e) {
    return Response.json({ error: `Fetch failed: ${(e as Error).message}` }, { status: 502 })
  }

  const allDraws = rounds.map(toDrawRow).filter((d): d is DrawRow => d !== null)
  // Deduplicate by draw_number (feed occasionally contains duplicates)
  const draws = [...new Map(allDraws.map(d => [d.draw_number, d])).values()]

  if (draws.length === 0) {
    return Response.json({ ok: false, error: 'No draws in JSON response.' }, { status: 200 })
  }

  // Upsert into Supabase in one batch call
  const db = adminDb()
  const now = new Date().toISOString()
  const errors: string[] = []

  const { error: upsertError, count } = await db
    .from('express_entry_draws')
    .upsert(
      draws.map(d => ({ ...d, synced_at: now })),
      { onConflict: 'draw_number', count: 'exact' }
    )

  if (upsertError) errors.push(upsertError.message)
  const upserted = count ?? draws.length

  // Store the latest draw as a rule_snapshot so the AI bot can retrieve it easily
  const latest = draws[0]
  if (latest) {
    await db.from('rule_snapshots').upsert(
      {
        rule_key: 'latest_ee_draw',
        category: 'express_entry',
        data: {
          draw_number: latest.draw_number,
          draw_date: latest.draw_date,
          draw_type: latest.draw_type,
          crs_cutoff: latest.crs_cutoff,
          invitations: latest.invitations,
          tie_break_rule: latest.tie_break_rule,
        },
        source_url: EE_DRAWS_PAGE,
        effective_date: latest.draw_date,
        last_checked_at: now,
        status: 'active',
      },
      { onConflict: 'rule_key' }
    )
  }

  // Alerts run after the upsert so the dashboard is already consistent with
  // whatever the email says. Failures here are reported, never fatal.
  const { alertsSent, alertErrors } = await sendDrawAlerts(db, draws)
  errors.push(...alertErrors)

  return Response.json({
    ok: errors.length === 0,
    parsed: draws.length,
    upserted,
    alertsSent,
    latest: latest ?? null,
    errors: errors.length > 0 ? errors : undefined,
  })
}
