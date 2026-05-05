'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Zap, BarChart3, CalendarCheck, Loader2 } from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'

const tiers = [
  {
    id: 'free',
    name: 'Free Check',
    price: '$0',
    period: 'forever',
    desc: 'Start with a basic immigration readiness check.',
    icon: BarChart3,
    cta: 'Start free',
    href: '/onboarding',
    highlight: false,
    features: [
      'Inside/outside Canada intake',
      'Basic CRS score estimate',
      'FSW 67-point grid check',
      'Basic pathway overview',
      'Settlement task checklist',
      'Find a certified consultant',
    ],
  },
  {
    id: 'report',
    name: 'Personalized Report',
    price: '$29',
    period: 'one-time',
    desc: 'Get a personalized snapshot of your immigration readiness, score gaps, possible pathways, and next steps.',
    icon: Zap,
    cta: 'Get my report',
    href: null,
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Free Check',
      'Detailed readiness report PDF',
      'CRS and FSW score breakdown',
      'Top 3 possible PR pathways',
      'Score improvement roadmap',
      'Province-by-province PNP overview',
      'Consultant-ready summary',
    ],
  },
  {
    id: 'tracker',
    name: 'PR Tracker',
    price: '$14',
    period: 'per month',
    desc: 'Includes your readiness report plus tools to track deadlines, Canada days, score changes, and monthly progress.',
    icon: CalendarCheck,
    cta: 'Start tracking',
    href: null,
    highlight: false,
    features: [
      'First readiness report included',
      'Canada physical presence days tracker',
      'Permit expiry reminders',
      'Express Entry draw alerts',
      'Monthly CRS recalculation',
      'Profile update reminders',
      'Saved progress history',
      'General immigration information assistant',
    ],
  },
]

function CheckoutButton({ tierId, cta, highlight }: { tierId: string; cta: string; highlight: boolean }) {
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
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
          ? 'bg-[#D62828] text-white hover:bg-[#B91C1C]'
          : 'border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? 'Redirecting…' : cta}
    </button>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0B1F3A]">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/">
            <NavlyLogo size="sm" />
          </Link>
          <Link href="/onboarding" className="text-sm font-semibold text-[#D62828] hover:underline">
            Start free →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[#D62828]">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A]">
            Start free. Upgrade when you need more.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Navly is free to use. Paid tiers unlock deeper analysis, ongoing tracking, and priority support.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.id}
                className={cn(
                  'flex flex-col rounded-3xl border bg-white p-6',
                  tier.highlight
                    ? 'border-[#D62828] shadow-xl shadow-red-100 ring-1 ring-[#D62828]/20'
                    : 'border-slate-200 shadow-sm'
                )}
              >
                {'badge' in tier && tier.badge && (
                  <div className="mb-4 inline-flex w-fit items-center rounded-full bg-[#D62828]/10 px-3 py-1 text-xs font-bold text-[#D62828]">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold text-[#0B1F3A]">{tier.name}</h2>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-[#0B1F3A]">{tier.price}</span>
                  <span className="mb-1 text-sm text-slate-500">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{tier.desc}</p>

                <ul className="my-6 flex flex-1 flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
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
                      'border border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
                    )}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <CheckoutButton tierId={tier.id} cta={tier.cta} highlight={tier.highlight} />
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Navly is an educational planning tool. It does not provide legal immigration advice.
          For legal review, connect with a certified RCIC or immigration lawyer.
        </p>
      </div>
    </main>
  )
}
