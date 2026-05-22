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

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
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

  const draws = rounds.map(toDrawRow).filter((d): d is DrawRow => d !== null)

  if (draws.length === 0) {
    return Response.json({ ok: false, error: 'No draws in JSON response.' }, { status: 200 })
  }

  // Upsert into Supabase
  const db = adminDb()
  const now = new Date().toISOString()
  let upserted = 0
  const errors: string[] = []

  for (const draw of draws) {
    const { error } = await db.from('express_entry_draws').upsert(
      { ...draw, synced_at: now },
      { onConflict: 'draw_number' }
    )
    if (error) errors.push(`Draw #${draw.draw_number}: ${error.message}`)
    else upserted++
  }

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

  return Response.json({
    ok: errors.length === 0,
    parsed: draws.length,
    upserted,
    latest: latest ?? null,
    errors: errors.length > 0 ? errors : undefined,
  })
}
