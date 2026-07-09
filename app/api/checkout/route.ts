import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { plan, billing = 'monthly' } = (await req.json()) as {
    plan: string
    billing?: 'monthly' | 'annual'
  }

  if (plan !== 'tracker' && plan !== 'report') {
    return Response.json({ error: 'Invalid plan.' }, { status: 400 })
  }

  // Require an active session — payment must be linked to an account
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'You must be signed in to purchase.' }, { status: 401 })
  }
  const userId = session.user.id

  if (plan === 'report') {
    const priceId = process.env.STRIPE_PRICE_REPORT
    if (!priceId) {
      return Response.json({ error: 'Stripe price not configured.' }, { status: 500 })
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout-success?plan=report&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: userId,
      metadata: { plan: 'report' },
      allow_promotion_codes: true,
    })
    return Response.json({ url: checkoutSession.url })
  }

  // Tracker subscription
  const priceId = billing === 'annual'
    ? process.env.STRIPE_PRICE_TRACKER_ANNUAL
    : process.env.STRIPE_PRICE_TRACKER

  if (!priceId) {
    return Response.json({ error: 'Stripe price not configured.' }, { status: 500 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout-success?plan=tracker&billing=${billing}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { plan: 'tracker', billing },
    subscription_data: { trial_period_days: 7 },
    allow_promotion_codes: true,
  })

  return Response.json({ url: checkoutSession.url })
}
