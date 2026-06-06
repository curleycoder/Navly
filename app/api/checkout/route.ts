import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { plan } = (await req.json()) as { plan: 'report' | 'tracker' }

  if (!plan || !['report', 'tracker'].includes(plan)) {
    return Response.json({ error: 'Invalid plan.' }, { status: 400 })
  }

  const priceId = plan === 'tracker'
    ? process.env.STRIPE_PRICE_TRACKER
    : process.env.STRIPE_PRICE_REPORT

  if (!priceId) {
    return Response.json({ error: 'Stripe price not configured.' }, { status: 500 })
  }

  // Require an active session — payment must be linked to an account
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'You must be signed in to purchase a plan.' }, { status: 401 })
  }
  const userId = session.user.id

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: plan === 'tracker' ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    client_reference_id: userId,
    metadata: { plan },
    allow_promotion_codes: true,
  })

  return Response.json({ url: checkoutSession.url })
}
