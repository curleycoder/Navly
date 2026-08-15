import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Use service role key to bypass RLS on webhook (no user session available)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Stripe API 2025-03-31+ (SDK v18+): current_period_end moved from the
// Subscription object to each SubscriptionItem. All items share the same
// period for standard subscriptions, so read it from the first item.
function periodEndOf(sub: Stripe.Subscription): string | null {
  const end = sub.items?.data?.[0]?.current_period_end
  return end ? new Date(end * 1000).toISOString() : null
}

async function getExpiresAt(subscriptionId: string): Promise<string | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    return periodEndOf(sub)
  } catch {
    return null
  }
}

// Stripe API 2025-03-31+: Invoice.subscription was removed — the subscription
// now lives under invoice.parent.subscription_details.subscription.
function subscriptionIdOf(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription
  if (!sub) return null
  return typeof sub === 'string' ? sub : sub.id
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = getAdminClient()

  // ── checkout.session.completed ────────────────────────────────────────────
  // Fires when the user completes checkout (both one-time and subscription).
  // For subscriptions: store stripe_subscription_id and set initial expires_at.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id
    const plan = session.metadata?.plan

    if (userId && plan) {
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : null

      const expiresAt = subscriptionId ? await getExpiresAt(subscriptionId) : null

      // onConflict user_id,plan — Stripe retries webhooks; without a conflict
      // target this would insert a duplicate row on every retry (PK is `id`).
      // Requires the unique index from migration 011.
      const { error } = await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          plan,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string | null,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          expires_at: expiresAt,
        },
        { onConflict: 'user_id,plan' }
      )
      if (error) {
        // Non-200 → Stripe retries the event instead of silently dropping it.
        return new Response(`DB write failed: ${error.message}`, { status: 500 })
      }
    }
  }

  // ── invoice.paid ──────────────────────────────────────────────────────────
  // Fires on every successful payment — including renewals.
  // Extend expires_at to the next period end and ensure status is active.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    const subscriptionId = subscriptionIdOf(invoice)

    if (subscriptionId) {
      const expiresAt = await getExpiresAt(subscriptionId)
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', expires_at: expiresAt })
        .eq('stripe_customer_id', customerId)
        .eq('plan', 'tracker')
      if (error) {
        return new Response(`DB write failed: ${error.message}`, { status: 500 })
      }
    }
  }

  // ── invoice.payment_failed ────────────────────────────────────────────────
  // Fires when a renewal charge fails (card declined, expired, etc.).
  // Mark the subscription as past_due so the client can show a payment warning.
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_customer_id', customerId)
      .eq('plan', 'tracker')
  }

  // ── customer.subscription.updated ────────────────────────────────────────
  // Fires on any subscription change (plan upgrade, cancellation scheduled,
  // trial ended, etc.). Keep our status and expiry in sync.
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const expiresAt = periodEndOf(sub)

    // Map Stripe statuses to our three allowed values
    const status =
      sub.status === 'active' || sub.status === 'trialing'
        ? 'active'
        : sub.status === 'past_due' || sub.status === 'unpaid'
        ? 'past_due'
        : 'canceled'

    // Don't overwrite a real expiry with null if the event payload had no items.
    const update: { status: string; expires_at?: string } = { status }
    if (expiresAt) update.expires_at = expiresAt

    const { error } = await supabase
      .from('subscriptions')
      .update(update)
      .eq('stripe_customer_id', customerId)
      .eq('plan', 'tracker')
    if (error) {
      return new Response(`DB write failed: ${error.message}`, { status: 500 })
    }
  }

  // ── customer.subscription.deleted ────────────────────────────────────────
  // Fires when a subscription is fully canceled (after any cancellation grace period).
  // Scope to tracker only — never cancel one-time report purchases.
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_customer_id', customerId)
      .eq('plan', 'tracker')
  }

  return new Response('ok', { status: 200 })
}
