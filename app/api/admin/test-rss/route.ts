/**
 * Debug route — shows exactly what the RSS pipeline discovers and fetches.
 * DELETE this file after debugging.
 *
 * GET /api/admin/test-rss
 * Authorization: Bearer <CRON_SECRET>
 */
import { STATIC_RSS_FEEDS, parseRSS } from '@/lib/ircc-rss'

const IRCC_RSS_INDEX = 'https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.html'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // ── Step 1: fetch the RSS index page ──────────────────────────────────────
  let indexHtml = ''
  try {
    const res = await fetch(IRCC_RSS_INDEX, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
    })
    results.indexStatus = res.status
    indexHtml = await res.text()
    results.indexLength = indexHtml.length

    // Show all hrefs found on the page
    const allHrefs = [...indexHtml.matchAll(/href="([^"]+)"/gi)].map((m) => m[1])
    results.allHrefs = allHrefs

    // Show which ones pass our filter
    const filtered = allHrefs.filter((url) => {
      const lower = url.toLowerCase()
      return (
        lower.includes('api.io.canada.ca') ||
        /\/rss/.test(lower) ||
        lower.includes('feed') ||
        /\.(xml|rss|atom)(\?|$)/.test(lower)
      )
    })
    results.discoveredFeedUrls = filtered
  } catch (e) {
    results.indexError = (e as Error).message
  }

  // ── Step 2: try fetching each discovered feed ─────────────────────────────
  const discoveredUrls: string[] = (results.discoveredFeedUrls as string[] | undefined) ?? []
  results.discoveredFeedResults = await Promise.all(
    discoveredUrls.map(async (url) => {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        })
        const body = await r.text()
        const parsed = parseRSS(body)
        return { url, status: r.status, bodyStart: body.slice(0, 300), parsedCount: parsed.length }
      } catch (e) {
        return { url, error: (e as Error).message }
      }
    })
  )

  // ── Step 3: try fetching each static feed ─────────────────────────────────
  results.staticFeedResults = await Promise.all(
    STATIC_RSS_FEEDS.map(async ({ url, sourceName }) => {
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        })
        const body = await r.text()
        const parsed = parseRSS(body)
        return { url, sourceName, status: r.status, bodyStart: body.slice(0, 300), parsedCount: parsed.length }
      } catch (e) {
        return { url, sourceName, error: (e as Error).message }
      }
    })
  )

  return Response.json(results, { status: 200 })
}
