import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const adminEmail = process.env.ADMIN_EMAIL
  return Boolean(session && adminEmail && session.user.email === adminEmail)
}

// GET — list updates, default unreviewed only
export async function GET(req: Request) {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'

  let query = adminDb()
    .from('immigration_updates')
    .select('id, title, summary, url, category, impact_level, affects, published_at, detected_at, reviewed, source_id')
    .order('impact_level', { ascending: true })   // high first (alphabetically: high < low < medium — use manual sort client-side)
    .order('published_at', { ascending: false })
    .limit(100)

  if (!all) query = query.eq('reviewed', false)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// PATCH — mark as reviewed (approve) or dismiss
export async function PATCH(req: Request) {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id, action } = await req.json() as { id: string; action: 'approve' | 'dismiss' }

  if (action === 'dismiss') {
    const { error } = await adminDb().from('immigration_updates').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  }

  const { error } = await adminDb()
    .from('immigration_updates')
    .update({ reviewed: true })
    .eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
