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

  // Check profiles table (phone stored in profile_data JSONB)
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('profile_data->>phone', phone.trim())
    .limit(1)
    .maybeSingle()

  return Response.json({ taken: !!data })
}
