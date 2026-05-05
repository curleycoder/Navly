import { createClient } from '@supabase/supabase-js'
import { mockUpdates } from '@/lib/news'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const { data, error } = await db()
      .from('ircc_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(40)

    if (error || !data || data.length === 0) {
      // Fall back to mock data if table is empty or doesn't exist yet
      return Response.json(mockUpdates)
    }

    // Map snake_case DB columns to camelCase NewsUpdate shape
    const mapped = data.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      sourceUrl: row.source_url,
      sourceName: row.source_name,
      publishedAt: row.published_at?.slice(0, 10) ?? '',
      category: row.category,
      importance: row.importance,
      affectedUsers: row.affected_users ?? [],
    }))

    return Response.json(mapped)
  } catch {
    return Response.json(mockUpdates)
  }
}
