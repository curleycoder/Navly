import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Simple in-memory rate limiter — 5 checks per IP per minute (free, no external service)
const rateMap = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(req: Request) {
  // Require an active session — phone check only happens after account creation
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { phone } = (await req.json()) as { phone: string }
  if (!phone || phone.trim().length < 7) {
    return Response.json({ taken: false })
  }

  const db = getAdminClient()

  // Check profiles table (completed signups) — excludes current user's own number
  const { data: profileMatch } = await db
    .from('profiles')
    .select('id')
    .eq('profile_data->>phone', phone.trim())
    .neq('id', session.user.id)
    .limit(1)
    .maybeSingle()

  return Response.json({ taken: !!profileMatch })
}
