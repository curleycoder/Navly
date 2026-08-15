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

// Retrieve current_period_end from a Stripe subscription and return it as an ISO string.
async function getExpiresAt(subscriptionId: string): Promise<string | null> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    return new Date(sub.current_period_end * 1000).toISOString()
  } catch {
    return null
  }
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

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer as string | null,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        expires_at: expiresAt,
      })
    }
  }

  // ── invoice.paid ──────────────────────────────────────────────────────────
  // Fires on every successful payment — including renewals.
  // Extend expires_at to the next period end and ensure status is active.
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    const subscriptionId =
      typeof invoice.subscription === 'string' ? invoice.subscription : null

    if (subscriptionId) {
      const expiresAt = await getExpiresAt(subscriptionId)
      await supabase
        .from('subscriptions')
        .update({ status: 'active', expires_at: expiresAt })
        .eq('stripe_customer_id', customerId)
        .eq('plan', 'tracker')
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
    const expiresAt = new Date(sub.current_period_end * 1000).toISOString()

    // Map Stripe statuses to our three allowed values
    const status =
      sub.status === 'active' || sub.status === 'trialing'
        ? 'active'
        : sub.status === 'past_due' || sub.status === 'unpaid'
        ? 'past_due'
        : 'canceled'

    await supabase
      .from('subscriptions')
      .update({ status, expires_at: expiresAt })
      .eq('stripe_customer_id', customerId)
      .eq('plan', 'tracker')
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
