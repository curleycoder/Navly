'use client'

import { useState } from 'react'
import { X, Zap, CalendarCheck, Loader2, ArrowRight } from 'lucide-react'

type Plan = 'report' | 'tracker'

const config: Record<Plan, {
  icon: React.ElementType
  plan: string
  price: string
  teaser: string
  features: string[]
  cta: string
}> = {
  report: {
    icon: Zap,
    plan: 'Persolized Report',
    price: '$29.99 one-time',
    teaser: 'Understand exactly where you stand today',
    features: [
      'Full CRS + FSW score breakdown',
      'Top 3 PR pathways ranked for your profile',
      'Score improvement roadmap',
      'Province-by-province PNP match',
      'Consultant-ready PDF summary',
    ],
    cta: 'Get My Report',
  },
  tracker: {
    icon: CalendarCheck,
    plan: 'PR Tracker',
    price: '$14.99 / month',
    teaser: "We watch your immigration journey so you don't miss anything",
    features: [
      'Canada physical presence days tracker',
      'Permit expiry reminders',
      'Express Entry draw alerts',
      'Monthly CRS recalculation',
      'Profile update reminders',
      'Progress history',
      'AI immigration assistant',
    ],
    cta: 'Start Tracking',
  },
}

interface UpgradeModalProps {
  plan: Plan
  onClose: () => void
}

export function UpgradeModal({ plan, onClose }: UpgradeModalProps) {
  const c = config[plan]
  const Icon = c.icon
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const { url, error } = await res.json()
    if (url) {
      window.location.href = url
      // keep loading=true — page will navigate away
    } else {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Redirecting overlay — sits above modal content when loading */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-8 shadow-2xl">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#D62828]/20" />
              <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-[#D62828]" />
              <Icon className="h-6 w-6 text-[#D62828]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-[#0B1F3A]">Redirecting to checkout…</p>
              <p className="mt-1 text-sm text-slate-500">Taking you to Stripe. This only takes a moment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal — bottom sheet on mobile, centered card on sm+ */}
      <div className={`relative w-full rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl transition-opacity ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-6 pt-4 sm:p-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-5 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D62828] text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#0B1F3A] leading-snug">{c.teaser}</p>
              <p className="text-sm text-slate-500">{c.plan} · {c.price}</p>
            </div>
          </div>

          {/* Early-bird note for tracker */}
          {plan === 'tracker' && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              First 50 subscribers lock in this price — lock yours in now.
            </p>
          )}

          {/* Features */}
          <ul className="mb-6 flex flex-col gap-2.5">
            {c.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D62828]/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D62828]" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={startCheckout}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D62828] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'Redirecting…' : c.cta}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
