import { supabase } from './supabase/client'

// A day is generous enough to cover someone finishing onboarding, closing the
// app, and coming back later the same day, while still firmly excluding an
// established user who cleared their browser storage or signed in on a new
// device — localStorage alone can't tell those two apart (it only knows "not
// seen on this browser," not "not seen, ever"), so this checks account age too.
const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000

export async function isNewAccount(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.created_at) return false
  return Date.now() - new Date(user.created_at).getTime() < NEW_ACCOUNT_WINDOW_MS
}
