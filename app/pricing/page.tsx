'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, BarChart3, CalendarCheck, FileText, Loader2, X } from 'lucide-react'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

type Billing = 'monthly' | 'annual'

const TRACKER_FEATURES = [
  'Full CRS + FSW score breakdown',
  'Top 3 PR pathways ranked for your profile',
  'Score improvement roadmap',
  'Province-by-province PNP match',
  'Consultant-ready PDF summary',
  'Canada physical presence days tracker',
  'Permit expiry reminders',
  'Express Entry draw alerts',
  'Monthly CRS recalculation',
  'Profile update reminders',
  'Progress history',
  'AI immigration assistant',
]

const REPORT_FEATURES = [
  'Full CRS + FSW score breakdown',
  'Top 3 PR pathways ranked',
  'Gap analysis with risk flags',
  'Province-by-province PNP match',
  'Timeline estimate to eligibility',
  'Best next actions — personalized',
  'Downloadable PDF (consultant-ready)',
]

const REPORT_EXCLUSIONS = [
  'No live updates or alerts',
  'No Canada days tracker',
  'No AI assistant',
]

const FREE_FEATURES = [
  'Inside/outside Canada intake',
  'Basic CRS score estimate',
  'FSW 67-point grid check',
  'Basic pathway overview',
  'Gap summary — what\'s missing',
  'Find a certified consultant (discount code included)',
]

function ReportCheckoutButton() {
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
      body: JSON.stringify({ plan: 'report' }),
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
      className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-navly-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navly-navy/80 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? 'Redirecting…' : 'Get my report — $69.99 →'}
    </button>
  )
}

function CheckoutButton({ billing, highlight }: { billing: Billing; highlight: boolean }) {
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
      body: JSON.stringify({ plan: 'tracker', billing }),
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
      {loading ? 'Redirecting…' : 'Start free 7-day trial →'}
    </button>
  )
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('annual')

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

        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-navly-red">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-heading">
            Find your path to Canadian PR
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            Start free to see where you stand. Get a one-time Readiness Report, or unlock the full PR Tracker for live tracking and alerts.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-subtle bg-surface-card p-1 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'rounded-xl px-5 py-2 text-sm font-semibold transition-colors',
                billing === 'monthly'
                  ? 'bg-navly-navy text-white shadow-sm'
                  : 'text-muted-text hover:text-heading'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-colors',
                billing === 'annual'
                  ? 'bg-navly-navy text-white shadow-sm'
                  : 'text-muted-text hover:text-heading'
              )}
            >
              Annual
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-bold',
                billing === 'annual' ? 'bg-navly-red text-white' : 'bg-navly-red/10 text-navly-red'
              )}>
                Save 33%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Free tier */}
          <div className="flex flex-col rounded-3xl border border-subtle bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navly-navy text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-heading">Free Check</h2>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold text-heading">$0</span>
              <span className="mb-1 text-sm text-muted-text">forever</span>
            </div>
            <p className="mt-2 text-sm text-muted-text">Find out if you're on the right track.</p>
            <ul className="my-6 flex flex-1 flex-col gap-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/onboarding"
              className="mt-auto flex w-full items-center justify-center rounded-xl border border-navly-navy px-4 py-2.5 text-sm font-semibold transition-colors text-heading hover:bg-navly-navy hover:text-white"
            >
              Start Free →
            </Link>
          </div>

          {/* Readiness Report tier */}
          <div className="flex flex-col rounded-3xl border border-navly-navy bg-surface-card p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navly-navy text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-heading">Readiness Report</h2>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-bold text-heading">$69.99</span>
              <span className="mb-1 text-sm text-muted-text">one-time</span>
            </div>
            <p className="mt-2 text-sm text-muted-text">A deep-dive snapshot of your PR readiness — delivered as a PDF you can share with a consultant.</p>
            <ul className="my-5 flex flex-1 flex-col gap-2.5">
              {REPORT_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
              {REPORT_EXCLUSIONS.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-text/50">
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ReportCheckoutButton />
            <p className="mt-2 text-center text-xs text-muted-text/60">
              AI-generated planning report · not legal advice
            </p>
          </div>

          {/* Tracker tier */}
          <div className="flex flex-col rounded-3xl border border-navly-red bg-surface-card p-6 shadow-xl shadow-red-100 ring-1 ring-navly-red/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-navly-navy text-white">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-heading">PR Tracker</h2>
              {billing === 'annual' && (
                <span className="rounded-full bg-navly-red/10 px-3 py-1 text-xs font-bold text-navly-red">
                  Best value
                </span>
              )}
              {billing === 'monthly' && (
                <span className="rounded-full bg-subtle px-3 py-1 text-xs font-bold text-muted-text">
                  First 50 — lock in price
                </span>
              )}
            </div>

            {/* Price display */}
            {billing === 'annual' ? (
              <div className="mt-2">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-heading">$119.99</span>
                  <span className="mb-1 text-sm text-muted-text">/ year</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-navly-red">
                  Saves $60 vs paying monthly
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold text-heading">$14.99</span>
                  <span className="mb-1 text-sm text-muted-text">/ month</span>
                </div>
                <p className="mt-1 text-xs text-muted-text">
                  Or save 33% with annual →{' '}
                  <button onClick={() => setBilling('annual')} className="font-semibold text-navly-red hover:underline">
                    Switch to annual
                  </button>
                </p>
              </div>
            )}

            <p className="mt-3 text-sm text-muted-text">
              Full clarity + we watch your journey so you don't miss anything.
            </p>

            <ul className="my-6 flex flex-1 flex-col gap-2.5">
              {TRACKER_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-text">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>

            <CheckoutButton billing={billing} highlight={true} />
            <p className="mt-2 text-center text-xs text-muted-text/70">
              7-day free trial · no credit card required · cancel anytime
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-heading">What's included</h2>
          <div className="overflow-hidden rounded-2xl border border-subtle bg-surface-card shadow-sm">
            <div className="grid grid-cols-4 border-b-2 border-subtle bg-navly-navy">
              <div className="px-5 py-4 text-s font-bold uppercase tracking-wide text-white">Feature</div>
              {[
                { label: 'Free Check', sub: '$0', accent: 'text-white' },
                { label: 'Report', sub: '$69.99 one-time', accent: 'text-white' },
                { label: 'PR Tracker', sub: billing === 'annual' ? '$119.99/yr' : '$14.99/mo', accent: 'text-navly-red' },
              ].map((h) => (
                <div key={h.label} className="px-4 py-4 text-center">
                  <p className={`text-sm font-bold ${h.accent}`}>{h.label}</p>
                  <p className="text-[11px] text-white">{h.sub}</p>
                </div>
              ))}
            </div>

            {[
              { feature: 'Basic CRS estimate',              free: 'check', report: 'check', tracker: 'check' },
              { feature: 'FSW 67-point check',              free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Basic pathway overview',          free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Gap summary',                     free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Consultant directory',            free: 'check', report: 'check', tracker: 'check' },
              { feature: 'Full CRS + FSW breakdown',        free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'Top 3 PR pathways ranked',        free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'Gap analysis + risk flags',       free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'PNP province match',              free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'Consultant-ready PDF',            free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'Score improvement roadmap',       free: 'x',     report: 'check', tracker: 'check' },
              { feature: 'Canada days tracker',             free: 'x',     report: 'x',     tracker: 'check' },
              { feature: 'Permit expiry reminders',         free: 'x',     report: 'x',     tracker: 'check' },
              { feature: 'Express Entry draw alerts',       free: 'x',     report: 'x',     tracker: 'check' },
              { feature: 'Monthly CRS recalculation',       free: 'x',     report: 'x',     tracker: 'check' },
              { feature: 'Progress history',                free: 'x',     report: 'x',     tracker: 'check' },
              { feature: 'AI immigration assistant',        free: 'x',     report: 'x',     tracker: 'check' },
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
