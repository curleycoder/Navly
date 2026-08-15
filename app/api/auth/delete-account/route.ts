/**
 * POST /api/auth/delete-account
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Required by PIPEDA (and GDPR-equivalent Canadian privacy obligations) because
 * Navly collects sensitive data including criminality and medical admissibility flags.
 *
 * Sequence:
 *   1. Verify active session.
 *   2. Write an audit record to account_deletion_requests.
 *   3. Cancel any active Stripe tracker subscription.
 *   4. Hard-delete the auth.users row — ON DELETE CASCADE removes profiles,
 *      subscriptions, presence_logs, presence_streaks, deadline_reminders, etc.
 *   5. Mark the audit record complete.
 */
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST() {
  const supabase = await createServerClient()
  // getUser() validates the JWT against the auth server — required before an
  // irreversible action like account deletion. Never trust getSession() here.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const email = user.email ?? null
  const db = adminDb()

  // 1. Write audit record before doing anything destructive.
  const { data: auditRow } = await db
    .from('account_deletion_requests')
    .insert({ user_id: userId, email })
    .select('id')
    .single()

  // 2. Cancel any live Stripe subscription so the customer is not billed again.
  //    - include past_due: those still have a live Stripe sub that retries charges
  //    - use a list, not maybeSingle(): duplicate rows would make maybeSingle()
  //      error out and silently skip the cancel
  const { data: subs } = await db
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', userId)
    .eq('plan', 'tracker')
    .in('status', ['active', 'past_due'])
    .not('stripe_subscription_id', 'is', null)

  const cancelErrors: string[] = []
  for (const sub of subs ?? []) {
    try {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id!)
    } catch (e) {
      // Proceed with deletion, but keep a trace in the audit row so a
      // billing ghost can be found and canceled manually in Stripe.
      cancelErrors.push(
        `${sub.stripe_subscription_id}: ${e instanceof Error ? e.message : 'unknown'}`
      )
    }
  }

  if (cancelErrors.length > 0 && auditRow?.id) {
    await db
      .from('account_deletion_requests')
      .update({ notes: `STRIPE CANCEL FAILED — ${cancelErrors.join('; ')}`.slice(0, 1000) })
      .eq('id', auditRow.id)
  }

  // 3. Hard-delete the user. All related rows cascade automatically:
  //    profiles, subscriptions, presence_logs, presence_streaks,
  //    deadline_reminders, chat_rate_limits.
  const { error: deleteError } = await db.auth.admin.deleteUser(userId)
  if (deleteError) {
    return Response.json(
      { error: 'Account deletion failed. Please contact support@navly.ca.' },
      { status: 500 }
    )
  }

  // 4. Mark audit record complete.
  if (auditRow?.id) {
    await db
      .from('account_deletion_requests')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', auditRow.id)
  }

  return Response.json({ ok: true })
}
