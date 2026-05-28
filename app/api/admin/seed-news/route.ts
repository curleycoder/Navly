/**
 * Admin route — upserts curated mockUpdates into the immigration_news table.
 * Run once (or re-run to refresh stale seeds — uses upsert by id).
 *
 * POST /api/admin/seed-news
 * Authorization: Bearer <CRON_SECRET>
 *
 * Use this to:
 *  1. Confirm the immigration_news table exists and is writable (if this fails, the cron is also failing)
 *  2. Permanently store important historical policy items the RSS cron will never carry
 *  3. Kick off after first deployment before the cron has run
 */
import { createClient } from '@supabase/supabase-js'
import { mockUpdates } from '@/lib/news'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const errors: string[] = []
  let upserted = 0

  for (const item of mockUpdates) {
    const { error } = await db.from('immigration_news').upsert(
      {
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
      },
      { onConflict: 'id' }
    )
    if (error) errors.push(`"${item.id}": ${error.message}`)
    else upserted++
  }

  return Response.json({
    ok: errors.length === 0,
    upserted,
    total: mockUpdates.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
