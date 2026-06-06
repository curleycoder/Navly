import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function adminDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ALLOWED_FIELDS = new Set([
  'name', 'business_name', 'certification_type', 'license_number',
  'city', 'province', 'languages', 'services', 'website',
  'booking_link', 'contact_email', 'phone', 'sponsored', 'verified', 'active',
])

function pickAllowed(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.has(key))
  )
}

async function assertAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!session || !adminEmail || session.user.email !== adminEmail) return null
  return session.user.id
}

// GET — list all consultants (admin sees inactive too)
export async function GET() {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { data, error } = await adminDb()
    .from('consultants')
    .select('*')
    .order('sponsored', { ascending: false })
    .order('name')
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// POST — create consultant
export async function POST(req: Request) {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const body = await req.json()
  const { data, error } = await adminDb()
    .from('consultants')
    .insert(pickAllowed(body))
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

// PUT — update consultant (id in body)
export async function PUT(req: Request) {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id, ...fields } = await req.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const { data, error } = await adminDb()
    .from('consultants')
    .update(pickAllowed(fields))
    .eq('id', id)
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

// DELETE — delete consultant (id in body)
export async function DELETE(req: Request) {
  if (!await assertAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id } = await req.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await adminDb().from('consultants').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
