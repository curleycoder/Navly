/**
 * POST /api/feedback
 *
 * In-app feedback capture for beta. Requires a session so feedback can be
 * traced back to a real account (and so the endpoint cannot be spammed
 * anonymously). Writes via the service role — the feedback table has RLS
 * enabled with no user-level policies.
 */
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = new Set(['bug', 'confusing', 'wrong_info', 'idea', 'other'])

// Per-user rate limit — reuses the chat_rate_limits pattern but far simpler:
// 5 submissions per user per 10 minutes, tracked in the feedback table itself.
const MAX_PER_WINDOW = 5
const WINDOW_MS = 10 * 60_000

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    category?: string
    message?: string
    page?: string
  } | null

  if (!body) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const message = (body.message ?? '').trim()
  if (message.length < 3) {
    return Response.json({ error: 'Please write a little more.' }, { status: 400 })
  }

  const category = VALID_CATEGORIES.has(body.category ?? '')
    ? body.category!
    : 'other'

  const db = adminDb()

  // Rate limit: count this user's recent submissions
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await db
    .from('feedback')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return Response.json(
      { error: 'Thanks — you have sent a few already. Please try again shortly.' },
      { status: 429 }
    )
  }

  const { error } = await db.from('feedback').insert({
    user_id: user.id,
    email: user.email ?? null,
    category,
    message: message.slice(0, 4000),
    page: (body.page ?? '').slice(0, 200) || null,
    user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300) || null,
  })

  if (error) {
    console.error('[feedback] insert error', error.message)
    return Response.json({ error: 'Could not save your feedback.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
