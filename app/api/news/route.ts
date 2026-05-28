import { createClient } from '@supabase/supabase-js'
import { mockUpdates, type NewsUpdate } from '@/lib/news'
import { fetchNewsFromRSS } from '@/lib/ircc-rss'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function rowToUpdate(row: Record<string, unknown>): NewsUpdate {
  return {
    id:            row.id as string,
    title:         row.title as string,
    summary:       row.summary as string,
    sourceUrl:     row.source_url as string,
    sourceName:    row.source_name as NewsUpdate['sourceName'],
    sourceType:    (row.source_type as NewsUpdate['sourceType']) ?? 'official',
    publishedAt:   String(row.published_at).slice(0, 10),
    category:      row.category as NewsUpdate['category'],
    importance:    row.importance as NewsUpdate['importance'],
    affectedUsers: (row.affected_users as string[]) ?? [],
  }
}

export async function GET() {
  const supabase = db()

  const [dbResult, rssResult] = await Promise.allSettled([
    supabase
      .from('immigration_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(60),

    fetchNewsFromRSS(6000),
  ])

  const dbItems: NewsUpdate[] =
    dbResult.status === 'fulfilled' && !dbResult.value.error && dbResult.value.data?.length
      ? dbResult.value.data.map(rowToUpdate)
      : []

  if (dbResult.status === 'fulfilled' && dbResult.value.error) {
    console.error('[news] Supabase select failed:', dbResult.value.error)
  }

  const rssItems: NewsUpdate[] =
    rssResult.status === 'fulfilled' ? rssResult.value : []

  if (rssResult.status === 'rejected') {
    console.error('[news] RSS fetch failed:', rssResult.reason)
  }

  // Await the batch upsert — fire-and-forget is unreliable on serverless
  if (rssItems.length > 0) {
    const { error } = await supabase.from('immigration_news').upsert(
      rssItems.map((item) => ({
        id:             item.id,
        title:          item.title,
        summary:        item.summary,
        source_url:     item.sourceUrl,
        source_name:    item.sourceName,
        source_type:    item.sourceType,
        published_at:   item.publishedAt,
        category:       item.category,
        importance:     item.importance,
        affected_users: item.affectedUsers,
      })),
      { onConflict: 'id' }
    )
    if (error) console.error('[news] Supabase upsert failed:', error)
  }

  // Merge: RSS (freshest) → DB (cached) → curated mock (permanent historical baseline)
  // First occurrence of each ID wins
  const seen = new Set<string>()
  const merged: NewsUpdate[] = []
  for (const item of [...rssItems, ...dbItems, ...mockUpdates]) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }

  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return Response.json(merged)
}
