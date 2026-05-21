/**
 * Cron route — reads all active sources from official_sources, fetches each one,
 * detects changes via content hash, and upserts new items into immigration_updates.
 *
 * Called by Vercel Cron (see vercel.json) or manually:
 *   GET /api/cron/sync-sources
 *   Authorization: Bearer <CRON_SECRET>
 */
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── RSS parser ────────────────────────────────────────────────────────────────

type RSSItem = {
  guid: string
  title: string
  link: string
  description: string
  pubDate: string
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
      return m ? m[1].trim() : ''
    }
    const title = get('title')
    const link = get('link')
    if (!title || !link) continue
    items.push({
      guid: get('guid') || link,
      title,
      link,
      description: get('description'),
      pubDate: get('pubDate'),
    })
  }
  return items
}

// ── Classification ────────────────────────────────────────────────────────────

function classifyCategory(title: string, desc: string): string {
  const t = (title + ' ' + desc).toLowerCase()
  if (t.includes('express entry') || t.includes('invitation to apply') || t.includes('crs')) return 'express_entry'
  if (t.includes('provincial nominee') || t.includes('pnp')) return 'pnp'
  if (t.includes('pgwp') || t.includes('study permit') || t.includes('student')) return 'study'
  if (t.includes('work permit') || t.includes('lmia') || t.includes('open work')) return 'work'
  if (t.includes('family sponsorship') || t.includes('spousal') || t.includes('sponsor')) return 'family'
  if (t.includes('citizenship')) return 'citizenship'
  if (t.includes('permanent residen') || t.includes(' pr ') || t.includes(' pr,')) return 'pr'
  if (t.includes('visitor') || t.includes('eta') || t.includes('temporary resident')) return 'visitor'
  return 'general'
}

function classifyImpact(title: string, desc: string): string {
  const t = (title + ' ' + desc).toLowerCase()
  if (
    t.includes('suspended') || t.includes('cap') || t.includes('new policy') ||
    t.includes('removed') || t.includes('eliminated') || t.includes('cutoff changed') ||
    t.includes('no longer') || t.includes('major change')
  ) return 'high'
  if (
    t.includes('update') || t.includes('change') || t.includes('extended') ||
    t.includes('threshold') || t.includes('draw') || t.includes('invitation') ||
    t.includes('processing time')
  ) return 'medium'
  return 'low'
}

function classifyAffects(category: string): string[] {
  const map: Record<string, string[]> = {
    express_entry: ['worker', 'pr', 'student', 'outside'],
    pnp: ['worker', 'student', 'outside', 'visitor'],
    study: ['student'],
    work: ['worker', 'visitor', 'outside'],
    family: ['pr', 'visitor', 'outside'],
    citizenship: ['pr'],
    pr: ['worker', 'student', 'visitor', 'outside'],
    visitor: ['visitor'],
    general: [],
  }
  return map[category] ?? []
}

// ── Hash helper ───────────────────────────────────────────────────────────────

function hashContent(items: RSSItem[]): string {
  const content = items.map(i => i.guid + i.title + i.pubDate).join('|')
  return createHash('sha256').update(content).digest('hex')
}

// ── Sync a single RSS source ──────────────────────────────────────────────────

async function syncRSSSource(
  db: ReturnType<typeof adminDb>,
  source: { id: string; name: string; url: string; category: string }
): Promise<{ upserted: number; changed: boolean; error?: string }> {
  const now = new Date().toISOString()

  // Fetch feed
  let xml: string
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'Navly-SourceBot/1.0' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return { upserted: 0, changed: false, error: `HTTP ${res.status}` }
    xml = await res.text()
  } catch (e) {
    return { upserted: 0, changed: false, error: (e as Error).message }
  }

  const items = parseRSS(xml).slice(0, 20)
  if (items.length === 0) return { upserted: 0, changed: false }

  const newHash = hashContent(items)

  // Get last known hash from source_change_logs
  const { data: lastLog } = await db
    .from('source_change_logs')
    .select('new_hash')
    .eq('source_id', source.id)
    .order('changed_at', { ascending: false })
    .limit(1)
    .single()

  const lastHash = lastLog?.new_hash ?? null
  const changed = newHash !== lastHash

  if (changed) {
    // Log the change
    const topItem = items[0]
    await db.from('source_change_logs').insert({
      source_id: source.id,
      old_hash: lastHash,
      new_hash: newHash,
      changed_at: now,
      change_summary: `${items.length} items detected, newest: "${topItem.title}"`,
      raw_excerpt: topItem.description?.replace(/<[^>]+>/g, '').trim().slice(0, 500) ?? '',
    })
  }

  // Upsert new items into immigration_updates
  let upserted = 0
  for (const item of items) {
    const category = classifyCategory(item.title, item.description)
    const impact = classifyImpact(item.title, item.description)
    const affects = classifyAffects(category)
    const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : now

    const { error } = await db.from('immigration_updates').upsert(
      {
        source_id: source.id,
        title: item.title.slice(0, 500),
        summary: item.description.replace(/<[^>]+>/g, '').trim().slice(0, 1000),
        url: item.link,
        category,
        published_at: publishedAt,
        detected_at: now,
        impact_level: impact,
        affects,
        reviewed: false,
      },
      { onConflict: 'url' }
    )
    if (!error) upserted++
  }

  // Update source last_checked_at (and last_changed_at if content changed)
  const sourceUpdate: Record<string, string> = { last_checked_at: now }
  if (changed) sourceUpdate.last_changed_at = now

  await db.from('official_sources').update(sourceUpdate).eq('id', source.id)

  return { upserted, changed }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()

  // Load all active sources
  const { data: sources, error: sourcesError } = await db
    .from('official_sources')
    .select('id, name, url, source_type, category')
    .eq('active', true)

  if (sourcesError) {
    return Response.json({ error: sourcesError.message }, { status: 500 })
  }

  if (!sources || sources.length === 0) {
    return Response.json({ ok: true, message: 'No active sources. Run /api/admin/seed-rules first.' })
  }

  const results: Array<{ source: string; upserted: number; changed: boolean; error?: string }> = []

  for (const source of sources) {
    if (source.source_type === 'rss') {
      const result = await syncRSSSource(db, source)
      results.push({ source: source.name, ...result })
    } else {
      // html_page, pdf, api — Phase 2
      results.push({ source: source.name, upserted: 0, changed: false, error: `source_type "${source.source_type}" not yet supported` })
    }
  }

  const totalUpserted = results.reduce((n, r) => n + r.upserted, 0)
  const sourcesChanged = results.filter(r => r.changed).length
  const errors = results.filter(r => r.error).map(r => `${r.source}: ${r.error}`)

  return Response.json({
    ok: true,
    sourcesChecked: sources.length,
    sourcesChanged,
    totalUpserted,
    results,
    errors: errors.length > 0 ? errors : undefined,
  })
}
