/**
 * Cron route — fetches latest IRCC news from the canada.ca RSS feed and
 * upserts into the ircc_news Supabase table.
 *
 * Called by Vercel Cron (see vercel.json) or manually via GET with
 * Authorization: Bearer <CRON_SECRET>
 */
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Simple RSS XML parser — no external dependencies needed
function parseRSS(xml: string): Array<{ guid: string; title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ guid: string; title: string; link: string; description: string; pubDate: string }> = []

  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
      return m ? m[1].trim() : ''
    }
    const guid = get('guid') || get('link')
    const title = get('title')
    const link = get('link')
    const description = get('description')
    const pubDate = get('pubDate')
    if (title && link) items.push({ guid, title, link, description, pubDate })
  }

  return items
}

function classifyCategory(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (text.includes('express entry') || text.includes('crs') || text.includes('invitation to apply')) return 'express-entry'
  if (text.includes('provincial nominee') || text.includes('pnp')) return 'pnp'
  if (text.includes('study permit') || text.includes('pgwp') || text.includes('student')) return 'study'
  if (text.includes('work permit') || text.includes('lmia') || text.includes('open work')) return 'work'
  if (text.includes('family sponsorship') || text.includes('spousal') || text.includes('spouse')) return 'family'
  if (text.includes('refugee') || text.includes('asylum') || text.includes('protected person')) return 'refugee'
  if (text.includes('visitor') || text.includes('eta') || text.includes('tourism')) return 'visitor'
  if (text.includes('permanent residen') || text.includes('pr ') || text.includes(' pr,')) return 'pr'
  return 'general'
}

function classifyImportance(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (
    text.includes('draw') || text.includes('invitation') || text.includes('cap') ||
    text.includes('suspended') || text.includes('new policy') || text.includes('cutoff') ||
    text.includes('processing times') || text.includes('intake')
  ) return 'high'
  if (
    text.includes('update') || text.includes('change') || text.includes('extended') ||
    text.includes('threshold') || text.includes('allocation')
  ) return 'medium'
  return 'low'
}

function classifyAffectedUsers(category: string): string[] {
  const map: Record<string, string[]> = {
    'express-entry': ['work-permit', 'pr', 'express-entry'],
    'pnp': ['work-permit', 'student', 'pr', 'pnp'],
    'study': ['student', 'study-permit'],
    'work': ['work-permit'],
    'family': ['family', 'family-member'],
    'refugee': ['refugee'],
    'visitor': ['visitor'],
    'pr': ['work-permit', 'student', 'pr'],
    'general': [],
  }
  return map[category] ?? []
}

const IRCC_RSS_FEEDS = [
  'https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.xml',
  'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/rss.xml',
]

export async function GET(req: Request) {
  // Auth check
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  let totalUpserted = 0
  const errors: string[] = []

  for (const feedUrl of IRCC_RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
        next: { revalidate: 0 },
      })
      if (!res.ok) {
        errors.push(`Feed ${feedUrl}: HTTP ${res.status}`)
        continue
      }
      const xml = await res.text()
      const items = parseRSS(xml)

      for (const item of items.slice(0, 20)) {
        const category = classifyCategory(item.title, item.description)
        const importance = classifyImportance(item.title, item.description)
        const affectedUsers = classifyAffectedUsers(category)
        const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
        const sourceName = feedUrl.includes('notices') ? 'IRCC Notices' : 'IRCC'

        const { error } = await db.from('ircc_news').upsert({
          id: item.guid || item.link,
          title: item.title.slice(0, 500),
          summary: item.description.replace(/<[^>]+>/g, '').trim().slice(0, 1000),
          source_url: item.link,
          source_name: sourceName,
          published_at: publishedAt,
          category,
          importance,
          affected_users: affectedUsers,
        }, { onConflict: 'id' })

        if (error) errors.push(`Upsert error: ${error.message}`)
        else totalUpserted++
      }
    } catch (e) {
      errors.push(`Feed ${feedUrl}: ${(e as Error).message}`)
    }
  }

  return Response.json({
    ok: true,
    upserted: totalUpserted,
    errors: errors.length > 0 ? errors : undefined,
  })
}
