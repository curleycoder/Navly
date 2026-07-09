'use client'

import { useState } from 'react'
import { X, CalendarCheck, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Billing = 'monthly' | 'annual'

interface UpgradeModalProps {
  onClose: () => void
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const [billing, setBilling] = useState<Billing>('annual')
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
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

  const features = [
    'Full CRS + FSW score breakdown',
    'Top 3 PR pathways ranked for your profile',
    'Score improvement roadmap',
    'Province-by-province PNP match',
    'Consultant-ready PDF summary',
    'Canada physical presence days tracker',
    'Permit expiry reminders',
    'Express Entry draw alerts',
    'Monthly CRS recalculation',
    'AI immigration assistant',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Redirecting overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-card px-8 py-8 shadow-2xl">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-navly-red/20" />
              <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-navly-red" />
              <CalendarCheck className="h-6 w-6 text-navly-red" />
            </div>
            <div className="text-center">
              <p className="font-bold text-heading">Redirecting to checkout…</p>
              <p className="mt-1 text-sm text-muted-text">Taking you to Stripe. This only takes a moment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className={`relative w-full rounded-t-3xl bg-surface-card shadow-2xl sm:max-w-md sm:rounded-2xl transition-opacity ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-subtle" />
        </div>

        <div className="px-5 pb-6 pt-4 sm:p-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-text/70 transition hover:bg-subtle hover:text-muted-text"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navly-red text-white">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-heading leading-snug">PR Tracker</p>
              <p className="text-sm text-muted-text">We watch your immigration journey so you don't miss anything</p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="mb-4 flex rounded-xl border border-subtle bg-surface-alt p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
                billing === 'monthly' ? 'bg-surface-card text-heading shadow-sm' : 'text-muted-text'
              )}
            >
              Monthly · $14.99
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors',
                billing === 'annual' ? 'bg-surface-card text-heading shadow-sm' : 'text-muted-text'
              )}
            >
              Annual · $119.99/yr
              <span className="rounded-full bg-navly-red/10 px-1.5 py-0.5 text-[10px] font-bold text-navly-red">
                −33%
              </span>
            </button>
          </div>

          {/* Price detail */}
          <p className="mb-4 rounded-lg px-3 py-2 text-xs font-semibold text-center
            bg-amber-50 text-amber-700">
            {billing === 'annual'
              ? 'Billed $119.99/year — saves $60 vs monthly · First 50 subscribers lock in this price'
              : 'Billed monthly · switch to annual and save $60/year'}
          </p>

          {/* Features */}
          <ul className="mb-6 flex flex-col gap-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted-text">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-navly-red/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-navly-red" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-subtle px-4 py-3 text-sm font-semibold text-muted-text transition hover:bg-surface-alt"
            >
              Cancel
            </button>
            <button
              onClick={startCheckout}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navly-red px-4 py-3 text-sm font-bold text-white transition hover:bg-navly-red/80 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'Redirecting…' : 'Start free trial'}
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-muted-text/70">
            7-day free trial · no credit card required · cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
