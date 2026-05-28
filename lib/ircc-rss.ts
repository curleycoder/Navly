/**
 * Shared IRCC RSS fetching, parsing, and classification logic.
 * Used by both /api/news (live fetch on request) and /api/cron/news (background upsert + email).
 */
import type { NewsUpdate, NewsCategory, NewsImportance } from './news'

// Official sources first, CIC News as third-party supplement.
// IRCC feed URLs are discovered dynamically from canada.ca/en/.../news/rss.html.
// api.io.canada.ca feeds need &format=atom appended to return XML instead of JSON.
export const STATIC_RSS_FEEDS: Array<{ url: string; sourceName: import('./news').NewsSourceName; sourceType: import('./news').NewsSourceType }> = [
  {
    // Official IRCC newsroom Atom feed — verified from canada.ca/en/immigration-refugees-citizenship/news/rss.html
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&pick=50&format=atom',
    sourceName: 'IRCC',
    sourceType: 'official',
  },
  { url: 'https://www.gazette.gc.ca/rss/p2-eng.html', sourceName: 'Canada Gazette', sourceType: 'official'    },
  { url: 'https://www.cicnews.com/feed/',              sourceName: 'CIC News',       sourceType: 'third_party' },
]

const IRCC_RSS_INDEX = 'https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.html'

/** Discovers live IRCC feed URLs from the canada.ca RSS index page. */
async function discoverIRCCFeeds(): Promise<string[]> {
  try {
    const res = await fetch(IRCC_RSS_INDEX, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
    })
    if (!res.ok) return []
    const html = await res.text()
    // Extract all hrefs that look like RSS/Atom feeds.
    // IRCC uses api.io.canada.ca URLs which have no file extension — match by path/domain too.
    const urls = [...html.matchAll(/href="([^"]+)"/gi)]
      .map((m) => m[1])
      .filter((url) => {
        const lower = url.toLowerCase()
        return (
          lower.includes('api.io.canada.ca') ||
          /\/rss/.test(lower) ||
          lower.includes('feed') ||
          /\.(xml|rss|atom)(\?|$)/.test(lower)
        )
      })
      .filter((url) => !url.startsWith('#') && !url.startsWith('mailto:'))
      .map((url) => url.startsWith('http') ? url : `https://www.canada.ca${url}`)
    // api.io.canada.ca returns JSON by default — request Atom/XML explicitly
    const normalized = urls.map((url) =>
      url.includes('api.io.canada.ca') && !url.includes('format=')
        ? url + (url.includes('?') ? '&' : '?') + 'format=atom'
        : url
    )
    return [...new Set(normalized)]
  } catch {
    return []
  }
}

type FeedItem = { guid: string; title: string; link: string; description: string; pubDate: string }

function extractText(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

/** Parses RSS 2.0 (<item>) format */
function parseRSSItems(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractText(block, 'title')
    const link  = extractText(block, 'link')
    if (title && link) items.push({
      guid:        extractText(block, 'guid') || link,
      title,
      link,
      description: extractText(block, 'description'),
      pubDate:     extractText(block, 'pubDate'),
    })
  }
  return items
}

/** Parses Atom 1.0 (<entry>) format — used by api.io.canada.ca IRCC feed */
function parseAtomItems(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g
  let match: RegExpExecArray | null
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractText(block, 'title')
    // Atom <link> is self-closing: <link rel="alternate" href="..."/>
    const linkMatch = block.match(/<link[^>]+href="([^"]+)"/)
    const link = linkMatch ? linkMatch[1] : extractText(block, 'link')
    if (title && link) items.push({
      guid:        extractText(block, 'id') || link,
      title,
      link,
      description: extractText(block, 'summary') || extractText(block, 'content'),
      pubDate:     extractText(block, 'updated') || extractText(block, 'published'),
    })
  }
  return items
}

/** Parses RSS or Atom feed XML — auto-detects format */
export function parseRSS(xml: string): FeedItem[] {
  if (xml.includes('<entry') && xml.includes('</entry>')) return parseAtomItems(xml)
  return parseRSSItems(xml)
}

export function classifyCategory(title: string, desc: string): NewsCategory {
  const text = (title + ' ' + desc).toLowerCase()
  if (text.includes('express entry') || text.includes('crs') || text.includes('invitation to apply') || text.includes('comprehensive ranking')) return 'express-entry'
  if (text.includes('provincial nominee') || text.includes('pnp') || text.includes('rural community') || text.includes('rural immigration') || text.includes('atlantic immigration') || text.includes('smaller communit') || text.includes('regional immigration') || text.includes('rcip') || text.includes('rnip')) return 'pnp'
  if (text.includes('study permit') || text.includes('pgwp') || text.includes('student') || text.includes('post-graduation') || text.includes('designated learning')) return 'study'
  if (text.includes('work permit') || text.includes('lmia') || text.includes('open work') || text.includes('labour market') || text.includes('temporary foreign worker') || text.includes('employer-specific')) return 'work'
  if (text.includes('family sponsorship') || text.includes('spousal') || text.includes('spouse') || text.includes('parent') || text.includes('grandparent') || text.includes('super visa')) return 'family'
  if (text.includes('refugee') || text.includes('asylum') || text.includes('protected person') || text.includes('claimant')) return 'refugee'
  if (text.includes('visitor') || text.includes('eta') || text.includes('tourism') || text.includes('electronic travel')) return 'visitor'
  if (text.includes('permanent residen') || text.includes(' pr ') || text.includes(' pr,') || text.includes('pr card') || text.includes('citizenship') || text.includes('naturalization') || text.includes('residency obligation')) return 'pr'
  return 'general'
}

export function classifyImportance(title: string, desc: string): NewsImportance {
  const text = (title + ' ' + desc).toLowerCase()
  if (
    text.includes('draw') || text.includes('invitation') || text.includes('cap') ||
    text.includes('suspended') || text.includes('new policy') || text.includes('cutoff') ||
    text.includes('processing times') || text.includes('intake') ||
    text.includes('no longer') || text.includes('eliminated') || text.includes('removed') ||
    text.includes('pilot') || text.includes('launched') || text.includes('announces') ||
    text.includes('effective') || text.includes('mandatory') || text.includes('required') ||
    text.includes('reduced') || text.includes('increase') || text.includes('levels plan')
  ) return 'high'
  if (
    text.includes('update') || text.includes('change') || text.includes('extended') ||
    text.includes('threshold') || text.includes('allocation') || text.includes('reminder') ||
    text.includes('delay') || text.includes('backlog') || text.includes('processing')
  ) return 'medium'
  return 'low'
}

export function classifyAffectedUsers(category: NewsCategory): string[] {
  const map: Record<NewsCategory, string[]> = {
    'express-entry': ['work-permit', 'pr', 'express-entry'],
    'pnp':           ['work-permit', 'student', 'pr', 'pnp'],
    'study':         ['student', 'study-permit'],
    'work':          ['work-permit'],
    'family':        ['family', 'family-member'],
    'refugee':       ['refugee'],
    'visitor':       ['visitor'],
    'pr':            ['work-permit', 'student', 'pr'],
    'general':       [],
  }
  return map[category] ?? []
}

function fetchFeed(
  feedUrl: string,
  sourceName: import('./news').NewsSourceName,
  sourceType: import('./news').NewsSourceType,
  signal: AbortSignal,
): Promise<NewsUpdate[]> {
  return fetch(feedUrl, { signal, headers: { 'User-Agent': 'Navly-NewsBot/1.0' }, cache: 'no-store' })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((xml) =>
      parseRSS(xml)
        .slice(0, 30)
        .map((item): NewsUpdate => {
          const category = classifyCategory(item.title, item.description)
          return {
            id:            item.guid || item.link,
            title:         item.title.slice(0, 500),
            summary:       item.description.replace(/<[^>]+>/g, '').trim().slice(0, 1000),
            sourceUrl:     item.link,
            sourceName,
            sourceType,
            publishedAt:   item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            category,
            importance:    classifyImportance(item.title, item.description),
            affectedUsers: classifyAffectedUsers(category),
          }
        })
    )
}

/** Fetches official IRCC feeds (discovered dynamically) + static feeds in parallel. */
export async function fetchNewsFromRSS(timeoutMs = 8000): Promise<NewsUpdate[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Discover live IRCC feed URLs from canada.ca RSS index page
    const irccFeedUrls = await discoverIRCCFeeds()

    const irccFetches = irccFeedUrls.map((url) =>
      fetchFeed(url, 'IRCC', 'official', controller.signal)
    )
    const staticFetches = STATIC_RSS_FEEDS.map(({ url, sourceName, sourceType }) =>
      fetchFeed(url, sourceName, sourceType, controller.signal)
    )

    const results = await Promise.allSettled([...irccFetches, ...staticFetches])

    return results
      .filter((r): r is PromiseFulfilledResult<NewsUpdate[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
  } finally {
    clearTimeout(timer)
  }
}
