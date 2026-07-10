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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id
    const plan = session.metadata?.plan

    if (userId && plan) {
      const supabase = getAdminClient()
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer as string | null,
        status: 'active',
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const supabase = getAdminClient()
    // Scope to tracker only — never cancel one-time purchases (report) when a subscription ends
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_customer_id', customerId)
      .eq('plan', 'tracker')
  }

  return new Response('ok', { status: 200 })
}
