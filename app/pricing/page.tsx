'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap, BarChart3, CalendarCheck, Loader2, X } from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const tiers = [
  {
    id: 'free',
    name: 'Free Check',
    price: '$0',
    period: 'forever',
    desc: 'Find out if you\'re on the right track.',
    icon: BarChart3,
    cta: 'Start Free →',
    href: '/onboarding',
    highlight: false,
    features: [
      'Inside/outside Canada intake',
      'Basic CRS score estimate',
      'FSW 67-point grid check',
      'Basic pathway overview',
      'Gap summary — what\'s missing',
      'Find a certified consultant (discount code included)',
    ],
  },
  {
    id: 'report',
    name: 'Persolized Report',
    price: '$29.99',
    period: 'one-time',
    desc: 'Understand exactly where you stand today.',
    icon: Zap,
    cta: 'Get My Report →',
    href: null,
    highlight: true,
    badge: 'Most popular',
    upsell: 'Already in the process? Pair with PR Tracker →',
    features: [
      'Full CRS + FSW score breakdown',
      'Top 3 PR pathways ranked for your profile',
      'Score improvement roadmap',
      'Province-by-province PNP match',
      'Consultant-ready PDF summary',
      'Valid snapshot of your profile today',
    ],
  },
  {
    id: 'tracker',
    name: 'Tracker',
    price: '$14.99',
    period: 'per month',
    desc: 'We watch your immigration journey so you don\'t miss anything.',
    icon: CalendarCheck,
    cta: 'Start Tracking →',
    href: null,
    highlight: false,
    badge: 'First 50 subscribers — lock in this price',
    upsell: 'Want a full PDF for your consultant? Add Readiness Report →',
    features: [
      'Canada physical presence days tracker',
      'Permit expiry reminders',
      'Express Entry draw alerts',
      'Monthly CRS recalculation',
      'Profile update reminders',
      'Progress history',
      'AI immigration assistant',
    ],
  },
]

function CheckoutButton({ tierId, cta, highlight }: { tierId: string; cta: string; highlight: boolean }) {
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login?redirect=/pricing'
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: tierId }),
    })
    const { url, error } = await res.json()
    if (url) {
      window.location.href = url
    } else {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className={cn(
        'mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60',
        highlight
          ? 'bg-navly-red text-white hover:bg-navly-red/80'
          : 'border border-navly-navy text-heading hover:bg-navly-navy hover:text-white'
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? 'Redirecting…' : cta}
    </button>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-surface text-heading">
      <header className="border-b border-subtle bg-surface-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <NavlyLogo size="sm" />
          </Link>
          <Link href="/onboarding" className="text-sm pt-2 font-semibold text-navly-red hover:underline">
            Start free →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-5">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-text hover:text-heading"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-navly-red">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-heading">
            Find your path to Canadian PR
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Not sure where you stand? Start free. Need clarity? Get your report. Already in the process? Let Navly track it for you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.id}
                className={cn(
                  'flex flex-col rounded-3xl border bg-surface-card p-6',
                  tier.highlight
                    ? 'border-navly-red shadow-xl shadow-red-100 ring-1 ring-navly-red/20'
                    : 'border-subtle shadow-sm'
                )}
              >
                

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navly-navy text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold text-heading">{tier.name}</h2>
                {'badge' in tier && tier.badge && (
                  <div className="mb-4 inline-flex w-fit items-center rounded-full bg-navly-red/10 px-3 py-1 text-xs font-bold text-navly-red">
                    {tier.badge}
                  </div>
                )}
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-heading">{tier.price}</span>
                  <span className="mb-1 text-sm text-muted-text">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-text">{tier.desc}</p>

                <ul className="my-6 flex flex-1 flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-text">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                {tier.href ? (
                  <Link
                    href={tier.href}
                    className={cn(
                      'mt-auto flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                      'border border-navly-navy text-heading hover:bg-navly-navy hover:text-white'
                    )}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <CheckoutButton tierId={tier.id} cta={tier.cta} highlight={tier.highlight} />
                )}
                {'upsell' in tier && tier.upsell && (
                  <p className="mt-3 text-center text-xs text-muted-text/70">{tier.upsell}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-heading">What's included</h2>
          <div className="overflow-hidden rounded-2xl border border-subtle bg-surface-card shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 border-b-2 border-subtle bg-navly-navy">
              <div className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-muted-text/70">Feature</div>
              {[
                { label: 'Free Check', sub: '$0', accent: 'text-muted-text/50' },
                { label: 'Readiness Report', sub: '$29 one-time', accent: 'text-amber-400' },
                { label: 'PR Tracker', sub: '$14.99/mo', accent: 'text-navly-red' },
              ].map((h) => (
                <div key={h.label} className="px-4 py-4 text-center">
                  <p className={`text-sm font-bold ${h.accent}`}>{h.label}</p>
                  <p className="text-[11px] text-muted-text">{h.sub}</p>
                </div>
              ))}
            </div>

            {[
              { feature: 'Inside/outside Canada intake', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Basic CRS estimate', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'FSW 67-point check', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Basic pathway overview', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Gap summary', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Consultant directory + discount', free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Full CRS + FSW breakdown', free: 'x', report: 'check', tracker: 'x' },
              { feature: 'Top 3 PR pathways ranked', free: 'x', report: 'check', tracker: 'x' },
              { feature: 'Score improvement roadmap', free: 'x', report: 'check', tracker: 'x' },
              { feature: 'PNP province match', free: 'x', report: 'check', tracker: 'x' },
              { feature: 'Consultant-ready PDF', free: 'x', report: 'check', tracker: 'x' },
              { feature: 'Canada days tracker', free: 'x', report: 'x', tracker: 'check' },
              { feature: 'Permit expiry reminders', free: 'x', report: 'x', tracker: 'check' },
              { feature: 'Express Entry draw alerts', free: 'x', report: 'x', tracker: 'check' },
              { feature: 'Monthly CRS recalculation', free: 'x', report: 'x', tracker: 'check' },
              { feature: 'Progress history', free: 'x', report: 'x', tracker: 'check' },
              { feature: 'AI immigration assistant', free: 'x', report: 'x', tracker: 'check' },
            ].map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 border-b border-subtle/50 last:border-0 ${i % 2 === 1 ? 'bg-surface-alt' : 'bg-surface-card'}`}>
                <div className="flex items-center px-5 py-4 text-sm font-medium text-heading">{row.feature}</div>
                {[row.free, row.report, row.tracker].map((val, j) => (
                  <div key={j} className="flex items-center justify-center px-4 py-4">
                    {val === 'check' && <Check className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />}
                    {val === 'x' && <X className="h-4 w-4 text-muted-text/50" strokeWidth={2.5} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-text">
          🔒 No legal advice. Navly helps you understand your options — always verify with a certified RCIC consultant.
        </p>
      </div>
    </main>
  )
}
