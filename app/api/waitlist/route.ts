import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const { email, interest } = (await req.json()) as { email?: string; interest?: string }

  const trimmed = (email ?? '').trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const db = getAdminClient()

  // Upsert so a duplicate email just updates the timestamp — no error, no dupe row
  const { error } = await db.from('waitlist').upsert(
    { email: trimmed, interest: interest ?? null, created_at: new Date().toISOString() },
    { onConflict: 'email' }
  )

  if (error) {
    console.error('[waitlist] insert error', error.message)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
