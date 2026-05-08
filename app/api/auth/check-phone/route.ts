import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const { phone } = (await req.json()) as { phone: string }

  if (!phone || phone.trim().length < 7) {
    return Response.json({ taken: false })
  }

  const supabase = getAdminClient()

  // Check 1: profiles table (completed signups)
  const { data: profileMatch } = await supabase
    .from('profiles')
    .select('id')
    .eq('profile_data->>phone', phone.trim())
    .limit(1)
    .maybeSingle()

  if (profileMatch) return Response.json({ taken: true })

  // Check 2: auth.users table — catches phone numbers from abandoned signups
  // (OTP verified but email/password step never completed)
  const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const phoneInAuth = authUsers?.users?.some((u) => u.phone === phone.trim())

  return Response.json({ taken: !!phoneInAuth })
}
