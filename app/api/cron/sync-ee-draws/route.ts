/**
 * Cron route — scrapes Express Entry draw results from the IRCC official page
 * and upserts into express_entry_draws.
 *
 * Run the migration first:
 *   supabase/migrations/004_express_entry_draws.sql
 *
 * Called by Vercel Cron (see vercel.json) or manually:
 *   GET /api/cron/sync-ee-draws
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/
 *         immigrate-canada/express-entry/submit-profile/rounds-invitations.html
 */
import { createClient } from '@supabase/supabase-js'

const EE_DRAWS_URL =
  'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── HTML parsing helpers ──────────────────────────────────────────────────────

/** Strip all HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract all <td> cell texts from a single <tr> block. */
function parseCells(row: string): string[] {
  const cells: string[] = []
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
  let m: RegExpExecArray | null
  while ((m = cellRegex.exec(row)) !== null) {
    cells.push(stripHtml(m[1]))
  }
  return cells
}

/**
 * Parse a date string like "May 14, 2026" or "14 May 2026" → "YYYY-MM-DD".
 * Returns null if unparseable.
 */
function parseDate(raw: string): string | null {
  const cleaned = raw.trim()
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10)
  }
  return null
}

/**
 * Parse a tie-break string like "October 24, 2024 at 09:01:26 UTC"
 * → ISO 8601 string. Returns null if unparseable.
 */
function parseTieBreak(raw: string): string | null {
  if (!raw || raw === 'N/A' || raw === '-') return null
  // Replace "at" with a space so Date can parse it
  const cleaned = raw.replace(/\s+at\s+/i, ' ').replace(/\s*UTC\s*/i, 'Z')
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d.toISOString()
  return null
}

/** Remove commas from numbers like "1,000" → 1000. */
function parseNumber(raw: string): number {
  return parseInt(raw.replace(/,/g, ''), 10)
}

// ── Draw type normalisation ───────────────────────────────────────────────────

/**
 * Normalise IRCC draw type label to a consistent slug-friendly value.
 * IRCC sometimes changes the exact wording; map known variants.
 */
function normaliseDrawType(raw: string): string {
  const t = raw.toLowerCase()
  if (t.includes('no program')) return 'No Program Specified'
  if (t.includes('canadian experience')) return 'Canadian Experience Class'
  if (t.includes('french')) return 'French Language Proficiency'
  if (t.includes('provincial nominee') || t.includes('pnp')) return 'Provincial Nominee Program'
  if (t.includes('federal skilled trades') || t.includes('fst')) return 'Federal Skilled Trades'
  if (t.includes('federal skilled worker') || t.includes('fsw')) return 'Federal Skilled Worker'
  if (t.includes('healthcare') || t.includes('health care')) return 'Healthcare Occupations'
  if (t.includes('stem')) return 'STEM Occupations'
  if (t.includes('trade')) return 'Trade Occupations'
  if (t.includes('transport')) return 'Transport Occupations'
  if (t.includes('agriculture') || t.includes('agri-food')) return 'Agriculture and Agri-Food'
  return raw.trim() // keep original if unknown
}

// ── Parser ────────────────────────────────────────────────────────────────────

type DrawRow = {
  draw_number: number
  draw_date: string
  draw_type: string
  crs_cutoff: number
  invitations: number
  tie_break_rule: string | null
}

function parseRowsFromBlock(block: string): DrawRow[] {
  const draws: DrawRow[] = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch: RegExpExecArray | null

  while ((rowMatch = rowRegex.exec(block)) !== null) {
    // Accept both <td> and <th> cells (IRCC sometimes uses <th> for data rows)
    const cells: string[] = []
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
    let cm: RegExpExecArray | null
    while ((cm = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripHtml(cm[1]))
    }

    if (cells.length < 5) continue

    const drawNumber = parseNumber(cells[0])
    const drawDate = parseDate(cells[1])
    const drawType = normaliseDrawType(cells[2])
    const crsScore = parseNumber(cells[3])
    const invitations = parseNumber(cells[4])
    const tieBreak = cells[5] ? parseTieBreak(cells[5]) : null

    if (isNaN(drawNumber) || !drawDate || isNaN(crsScore) || isNaN(invitations)) continue

    draws.push({
      draw_number: drawNumber,
      draw_date: drawDate,
      draw_type: drawType,
      crs_cutoff: crsScore,
      invitations,
      tie_break_rule: tieBreak,
    })
  }

  return draws
}

function parseDrawsFromHTML(html: string): DrawRow[] {
  const draws: DrawRow[] = []
  const seen = new Set<number>()

  // IRCC uses <details> per year, each containing a <table> with a <tbody>.
  // Collect ALL <tbody> blocks across the full page.
  const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/gi
  let tbodyMatch: RegExpExecArray | null

  while ((tbodyMatch = tbodyRegex.exec(html)) !== null) {
    for (const row of parseRowsFromBlock(tbodyMatch[1])) {
      if (!seen.has(row.draw_number)) {
        seen.add(row.draw_number)
        draws.push(row)
      }
    }
  }

  // Fallback: if no <tbody> found, try parsing <tr> rows directly from the full HTML
  if (draws.length === 0) {
    for (const row of parseRowsFromBlock(html)) {
      if (!seen.has(row.draw_number)) {
        seen.add(row.draw_number)
        draws.push(row)
      }
    }
  }

  // Sort descending by draw number (most recent first)
  draws.sort((a, b) => b.draw_number - a.draw_number)
  return draws
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const debug = new URL(req.url).searchParams.get('debug') === '1'

  // Fetch the IRCC EE draws page
  let html: string
  try {
    const res = await fetch(EE_DRAWS_URL, {
      headers: { 'User-Agent': 'Navly-SourceBot/1.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return Response.json({ error: `IRCC page returned HTTP ${res.status}` }, { status: 502 })
    }
    html = await res.text()
  } catch (e) {
    return Response.json({ error: `Fetch failed: ${(e as Error).message}` }, { status: 502 })
  }

  // Debug mode: return HTML structure info without writing to DB
  if (debug) {
    const tbodyCount = (html.match(/<tbody/gi) ?? []).length
    const tableCount = (html.match(/<table/gi) ?? []).length
    const trCount = (html.match(/<tr/gi) ?? []).length
    const firstTbody = html.match(/<tbody[^>]*>([\s\S]{0,2000})/i)?.[1] ?? 'not found'
    const firstTable = html.match(/<table[^>]*>([\s\S]{0,1000})/i)?.[1] ?? 'not found'
    return Response.json({
      debug: true,
      htmlLength: html.length,
      tableCount,
      tbodyCount,
      trCount,
      firstTableSnippet: stripHtml(firstTable).slice(0, 500),
      firstTbodySnippet: stripHtml(firstTbody).slice(0, 1000),
    })
  }

  const draws = parseDrawsFromHTML(html)

  if (draws.length === 0) {
    return Response.json({
      ok: false,
      error: 'No draws parsed — the IRCC page structure may have changed.',
      hint: 'Add ?debug=1 to inspect the HTML structure.',
    }, { status: 200 })
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
        source_url: EE_DRAWS_URL,
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
